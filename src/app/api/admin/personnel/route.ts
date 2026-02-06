import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('nexus_admin_session')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [role, userId] = sessionToken.split(':')
        if (role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Super Admin privileges required' }, { status: 403 })
        }

        const { username, password, name } = await request.json()

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and Password are required' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = await prisma.user.create({
            data: {
                username,
                passwordHash,
                name: name || 'Content Agent',
                role: 'CONTENT_ADMIN'
            }
        })

        return NextResponse.json({ success: true, user: { id: newUser.id, username: newUser.username } })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Username already enlisted' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Failed to deploy personnel' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('nexus_admin_session')?.value

        if (!sessionToken || !sessionToken.startsWith('SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const admins = await prisma.user.findMany({
            where: {
                role: { in: ['SUPER_ADMIN', 'CONTENT_ADMIN'] }
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json(admins)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 })
    }
}
