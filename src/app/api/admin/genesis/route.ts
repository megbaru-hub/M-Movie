import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { username, password, genesisCode } = await request.json()

        if (!username || !password || !genesisCode) {
            return NextResponse.json({ error: 'Missing required credentials' }, { status: 400 })
        }

        // Verify Genesis Code
        if (genesisCode !== process.env.SUPER_ADMIN_GENESIS_CODE) {
            return NextResponse.json({ error: 'Invalid Genesis Token. Access Denied.' }, { status: 403 })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                role: 'SUPER_ADMIN',
                name: 'Super Admin Node'
            }
        })

        return NextResponse.json({ success: true, message: 'Super Admin deployed successfully' })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Username already enlisted in the Nexus' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Deployment sequence failed' }, { status: 500 })
    }
}
