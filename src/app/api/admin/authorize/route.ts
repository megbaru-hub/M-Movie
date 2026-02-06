import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { username, password, portalType } = await request.json()

        if (!username || !password || !portalType) {
            return NextResponse.json({ error: 'Incomplete credentials' }, { status: 400 })
        }

        const user = await (prisma.user as any).findUnique({
            where: { username } as any
        })

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Access Denied: Invalid Credentials' }, { status: 401 })
        }

        // Verify role alignment with portal
        if (portalType === 'SUPER' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Security Violation: Role Mismatch' }, { status: 403 })
        }

        // Allow SUPER_ADMIN to also access CONTENT portal
        if (portalType === 'CONTENT' && user.role !== 'CONTENT_ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Security Violation: Role Mismatch' }, { status: 403 })
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash)
        if (!isMatch) {
            return NextResponse.json({ error: 'Access Denied: Invalid Credentials' }, { status: 401 })
        }

        const cookieStore = await cookies()

        // Secure, persistent HTTP-only session
        const sessionValue = `${user.role}:${user.id}`

        cookieStore.set('nexus_admin_session', sessionValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        })

        return NextResponse.json({ success: true, role: user.role })
    } catch (error) {
        return NextResponse.json({ error: 'Authentication sequence failed' }, { status: 500 })
    }
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete('nexus_admin_session')
    return NextResponse.json({ success: true })
}
