import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile } from 'fs/promises'
import path from 'path'

import { transcodeVideo } from '@/lib/video-transcoding'

export async function POST(request: Request) {
    try {
        // 1. Authentication
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('nexus_admin_session')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [role, userId] = sessionToken.includes(':') ? sessionToken.split(':') : [null, null]

        if (role !== 'SUPER_ADMIN' && role !== 'CONTENT_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized Role' }, { status: 401 })
        }

        // 2. Parse FormData
        const formData = await request.formData()

        const title = formData.get('title') as string
        const category = formData.get('category') as string
        const genre = formData.get('genre') as string
        const country = formData.get('country') as string
        const year = formData.get('year') as string
        const season = formData.get('season') ? parseInt(formData.get('season') as string) : undefined
        const episode = formData.get('episode') ? parseInt(formData.get('episode') as string) : undefined

        const videoFile = formData.get('videoFile') as File | null
        const thumbnailFile = formData.get('thumbnailFile') as File | null
        const subtitleFile = formData.get('subtitleFile') as File | null

        if (!title || !category) {
            return NextResponse.json({ error: 'Title and Category are required' }, { status: 400 })
        }

        // 3. File Saving Logic
        let videoPath = ''
        let thumbnailPath = ''
        let subtitlePath = ''
        let fullVideoFilePath = '' // To store the full path for transcoding

        const uploadDir = path.join(process.cwd(), 'public/uploads')

        if (videoFile) {
            const buffer = Buffer.from(await videoFile.arrayBuffer())
            const filename = `${Date.now()}-${videoFile.name.replace(/\s/g, '_')}`
            fullVideoFilePath = path.join(uploadDir, filename)
            await writeFile(fullVideoFilePath, buffer)
            videoPath = `/uploads/${filename}`
        }

        if (thumbnailFile) {
            const buffer = Buffer.from(await thumbnailFile.arrayBuffer())
            const filename = `${Date.now()}-thumb-${thumbnailFile.name.replace(/\s/g, '_')}`
            await writeFile(path.join(uploadDir, filename), buffer)
            thumbnailPath = `/uploads/${filename}`
        }

        if (subtitleFile) {
            let buffer = Buffer.from(await subtitleFile.arrayBuffer())
            let filename = `${Date.now()}-sub-${subtitleFile.name.replace(/\s/g, '_')}`

            // Check if it's an SRT file and convert to VTT
            if (subtitleFile.name.toLowerCase().endsWith('.srt')) {
                console.log('Converting SRT to VTT...')
                const srtText = buffer.toString('utf-8')
                const vttText = 'WEBVTT\n\n' + srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
                buffer = Buffer.from(vttText, 'utf-8')
                filename = filename.replace(/\.[^/.]+$/, "") + ".vtt"
            }

            await writeFile(path.join(uploadDir, filename), buffer)
            subtitlePath = `/uploads/${filename}`
        }

        // 4. Database Creation
        const movie = await prisma.movie.create({
            data: {
                title,
                slug: title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
                category,
                genre,
                country,
                year,
                season,
                episode,
                uploaderId: userId, // Track who uploaded the content
                originalFile: videoPath,
                thumbnail: thumbnailPath,
                subtitles: subtitlePath
            }
        })

        // 5. Trigger Transcoding in background if a video file was uploaded
        if (videoFile && fullVideoFilePath) {
            console.log(`Starting background transcoding for movie ${movie.id} from ${fullVideoFilePath}`);
            transcodeVideo(movie.id, fullVideoFilePath).catch(err => {
                console.error(`Transcoding background error for movie ${movie.id}:`, err);
            });
        }

        return NextResponse.json(movie)

    } catch (error) {
        console.error('Content Deployment Error:', error)
        return NextResponse.json({ error: 'Failed to deploy content' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('nexus_admin_session')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [role, userId] = sessionToken.split(':')
        const { searchParams } = new URL(request.url)
        const id = parseInt(searchParams.get('id') || '')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const movie = await prisma.movie.findUnique({ where: { id } })

        if (!movie) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 })
        }

        // Authorization: SUPER_ADMIN or the Uploader
        if (role !== 'SUPER_ADMIN' && movie.uploaderId !== userId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this content' }, { status: 403 })
        }

        await prisma.movie.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Purge sequence failed' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('nexus_admin_session')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [role, userId] = sessionToken.split(':')
        const { searchParams } = new URL(request.url)
        const id = parseInt(searchParams.get('id') || '')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const { title, genre, country, year } = await request.json()

        const movie = await prisma.movie.findUnique({ where: { id } })

        if (!movie) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 })
        }

        // Authorization
        if (role !== 'SUPER_ADMIN' && movie.uploaderId !== userId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this content' }, { status: 403 })
        }

        const updated = await prisma.movie.update({
            where: { id },
            data: {
                title,
                genre,
                country,
                year,
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Update sequence failed' }, { status: 500 })
    }
}
