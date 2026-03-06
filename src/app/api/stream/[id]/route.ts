import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params
    const id = parseInt(idStr)

    // 1. Fetch Movie
    const movie = await prisma.movie.findUnique({
        where: { id },
        // include: { variants: true } 
    })

    if (!movie) {
        return new NextResponse('Movie not found', { status: 404 })
    }

    // 2. Resolve File Path 
    let filePath = ''
    const { searchParams } = new URL(request.url)
    const isDownload = searchParams.get('download') === 'true'
    const requestedQuality = searchParams.get('quality') // e.g. "720"

    let videoFileInDb = movie.originalFile

    if (requestedQuality) {
        const variant = await prisma.movieVariant.findUnique({
            where: {
                movieId_quality: {
                    movieId: id,
                    quality: parseInt(requestedQuality)
                }
            }
        })
        if (variant) {
            videoFileInDb = variant.file
        }
    }

    if (videoFileInDb) {
        // Handle external URLs (Vercel Blob)
        if (videoFileInDb.startsWith('http')) {
            return NextResponse.redirect(videoFileInDb)
        }

        // New System: Path is stored in originalFile, usually starts with /uploads
        const PUBLIC_DIR = path.join(process.cwd(), 'public')
        // Removing leading slash for join
        const cleanPath = videoFileInDb.startsWith('/') ? videoFileInDb.slice(1) : videoFileInDb

        // Check public dir first (new uploads)
        const publicPath = path.join(PUBLIC_DIR, cleanPath)

        if (fs.existsSync(publicPath)) {
            filePath = publicPath
        } else {
            // Fallback to legacy structure
            const MEDIA_ROOT = path.join(process.cwd(), '../media')
            filePath = path.join(MEDIA_ROOT, cleanPath)
        }
    } else {
        return new NextResponse('No video source available', { status: 404 })
    }

    if (!fs.existsSync(filePath)) {
        console.error(`File missing at: ${filePath}`)
        return new NextResponse('Video file missing on server', { status: 404 })
    }

    // 3. Handle Range Request
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = request.headers.get('range')

    const filename = `${movie.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${requestedQuality ? '_' + requestedQuality + 'p' : ''}.mp4`


    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const contentLength = (end - start) + 1

        const fileStream = fs.createReadStream(filePath, { start, end })
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of fileStream) {
                        controller.enqueue(chunk)
                    }
                    controller.close()
                } catch (error) {
                    console.error('Stream error:', error)
                }
            },
            cancel() {
                fileStream.destroy()
            }
        })

        const headers: Record<string, string> = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength.toString(),
            'Content-Type': 'video/mp4',
        }

        if (isDownload) {
            headers['Content-Disposition'] = `attachment; filename="${filename}"`
        }

        return new NextResponse(stream, { status: 206, headers })
    } else {
        const headers: Record<string, string> = {
            'Content-Length': fileSize.toString(),
            'Content-Type': 'video/mp4',
        }

        if (isDownload) {
            headers['Content-Disposition'] = `attachment; filename="${filename}"`
        }

        const fileStream = fs.createReadStream(filePath)
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of fileStream) {
                        controller.enqueue(chunk)
                    }
                    controller.close()
                } catch (error) {
                    console.error('Stream error:', error)
                }
            },
            cancel() {
                fileStream.destroy()
            }
        })

        return new NextResponse(stream, { status: 200, headers })
    }
}
