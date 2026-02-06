import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

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

        // Get file extension
        const ext = file.type.split('/')[1]
        const fileName = `${userId}.${ext}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
        const filePath = path.join(uploadDir, fileName)

        // Delete old avatar if exists (with different extension)
        const possibleExts = ['jpg', 'jpeg', 'png', 'webp']
        for (const oldExt of possibleExts) {
            const oldFile = path.join(uploadDir, `${userId}.${oldExt}`)
            if (existsSync(oldFile) && oldFile !== filePath) {
                try {
                    await unlink(oldFile)
                } catch (err) {
                    console.error('Error deleting old avatar:', err)
                }
            }
        }

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Update user's image field in database
        const imageUrl = `/uploads/avatars/${fileName}`
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
