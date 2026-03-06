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

    // 1. Fetch Short
    const short = await prisma.short.findUnique({
        where: { id }
    })

    if (!short) {
        return new NextResponse('Short not found', { status: 404 })
    }

    if (!short.videoFile) {
        return new NextResponse('No video source available', { status: 404 })
    }

    // Handle external URLs (Vercel Blob)
    if (short.videoFile.startsWith('http')) {
        return NextResponse.redirect(short.videoFile)
    }

    // 2. Resolve File Path 
    // For Shorts, we stored them in public/uploads/shorts/
    const PUBLIC_DIR = path.join(process.cwd(), 'public')

    // Remove leading slash if present in DB path to join correctly
    const cleanPath = short.videoFile.startsWith('/') ? short.videoFile.slice(1) : short.videoFile
    const filePath = path.join(PUBLIC_DIR, cleanPath)

    if (!fs.existsSync(filePath)) {
        console.error(`Short file missing at: ${filePath}`)
        return new NextResponse('Video file missing on server', { status: 404 })
    }

    // 3. Handle Range Request
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = request.headers.get('range')

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const contentLength = (end - start) + 1

        // Create Read Stream
        const fileStream = fs.createReadStream(filePath, { start, end })

        // Convert Node stream to Web ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of fileStream) {
                        controller.enqueue(chunk)
                    }
                    controller.close()
                } catch (error) {
                    // Handle error causing stream interrupt
                    console.error('Stream error:', error)
                    // If incorrect state, we can't do much, but try parsing
                }
            },
            cancel() {
                fileStream.destroy()
            }
        })

        return new NextResponse(stream, {
            status: 206,
            headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength.toString(),
                'Content-Type': 'video/mp4',
            },
        })
    } else {
        // No Range
        const headers = {
            'Content-Length': fileSize.toString(),
            'Content-Type': 'video/mp4',
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
