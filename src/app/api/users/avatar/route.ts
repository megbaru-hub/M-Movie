import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/storage'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const formData = await request.formData()
        const file = formData.get('avatar') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Please upload JPG, PNG, or WebP' }, { status: 400 })
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
        }

        // Generate file name
        const ext = file.type.split('/')[1]
        const fileName = `${userId}-${Date.now()}.${ext}`

        // Save using storage utility
        const imageUrl = await uploadFile(file, fileName, 'avatars')
        await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl }
        })

        return NextResponse.json({
            success: true,
            imageUrl
        })
    } catch (error) {
        console.error('Avatar upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
