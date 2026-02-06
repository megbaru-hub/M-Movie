import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    try {
        // Get session using NextAuth
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized: Please sign in to upload' }, { status: 401 })
        }

        const userId = (session.user as any).id

        const formData = await request.formData()
        const file = formData.get('file') as File
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        if (!file || !title) {
            return NextResponse.json({ error: 'Title and Video File are required' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            return NextResponse.json({ error: 'Invalid file type. Please upload a video.' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const uploadDir = path.join(process.cwd(), 'public/uploads/shorts')
        const relativePath = `/uploads/shorts/${filename}`
        const filePath = path.join(uploadDir, filename)

        // Save file to public/uploads/shorts
        await writeFile(filePath, buffer)

        // Generate slug
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000)

        // Create DB record
        const short = await prisma.short.create({
            data: {
                title,
                slug,
                description,
                videoFile: relativePath,
                userId: userId,
                channelName: session.user.name || 'M-Movies User',
            }
        })

        // Convert BigInt to string for JSON serialization
        const shortResponse = {
            ...short,
            views: short.views.toString(),
        }

        return NextResponse.json(shortResponse)
    } catch (error) {
        console.error('Short Upload Error:', error)
        return NextResponse.json({ error: 'Failed to upload short video' }, { status: 500 })
    }
}
