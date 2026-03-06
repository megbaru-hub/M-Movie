import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from './prisma'

const TARGET_QUALITIES = [
    { name: '1080p', height: 1080, maxBitrate: '4000k' },
    { name: '720p', height: 720, maxBitrate: '2000k' },
    { name: '480p', height: 480, maxBitrate: '1000k' },
    { name: '360p', height: 360, maxBitrate: '600k' },
    { name: '240p', height: 240, maxBitrate: '400k' },
    { name: '144p', height: 144, maxBitrate: '200k' },
]

const isCloud = !!process.env.VERCEL_URL || !!process.env.BLOB_READ_WRITE_TOKEN;

async function getSourceMetadata(filePath: string): Promise<{ height: number }> {
    return new Promise((resolve) => {
        const ffprobe = spawn('ffprobe', [
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=height',
            '-of', 'csv=s=x:p=0',
            filePath
        ])

        let output = ''
        ffprobe.stdout.on('data', (data: Buffer | string) => output += data.toString())
        ffprobe.on('close', () => {
            const height = parseInt(output.trim())
            resolve({ height: isNaN(height) ? 1080 : height })
        })
    })
}

export async function transcodeVideo(movieId: number, sourceFilePath: string) {
    if (isCloud) {
        console.log(`[Transcoding] Serverless environment detected. Skipping FFmpeg transcoding for Movie ID: ${movieId}`)
        // In serverless, we just register the original file as the 1080p quality variant so the player has something to work with
        // Note: sourceFilePath will be a URL if isCloud is true
        await prisma.movieVariant.upsert({
            where: { movieId_quality: { movieId, quality: 1080 } },
            update: { file: sourceFilePath },
            create: { movieId, quality: 1080, file: sourceFilePath }
        })
        return
    }

    console.log(`[Transcoding] Starting process for Movie ID: ${movieId}`)

    const publicDir = path.join(process.cwd(), 'public')
    const variantsDirRelative = path.join('uploads', 'variants', movieId.toString())
    const variantsDirAbsolute = path.join(publicDir, variantsDirRelative)

    try {
        await fs.mkdir(variantsDirAbsolute, { recursive: true })

        // 1. Get source height to avoid upscaling
        const { height: sourceHeight } = await getSourceMetadata(sourceFilePath)
        console.log(`[Transcoding] Source height detected: ${sourceHeight}p`)

        // 2. Cleanup old variants that are now invalid (e.g. if the source resolution dropped)
        const existingVariants = await prisma.movieVariant.findMany({
            where: { movieId }
        })

        for (const variant of existingVariants) {
            if (variant.quality > sourceHeight) {
                console.log(`[Transcoding] Removing invalid high-res variant: ${variant.quality}p`)
                const variantPath = path.join(publicDir, variant.file)
                try {
                    await fs.unlink(variantPath)
                } catch {
                    // Ignore if file doesn't exist
                }
                await prisma.movieVariant.delete({ where: { id: variant.id } })
            }
        }

        for (const quality of TARGET_QUALITIES) {
            // Skip upscaling: Don't create a 1080p version if source is only 720p
            if (quality.height > sourceHeight) {
                console.log(`[Transcoding] Skipping ${quality.name} (Source is only ${sourceHeight}p)`)
                continue
            }

            const outputFilename = `${quality.name}.mp4`
            const outputPathAbsolute = path.join(variantsDirAbsolute, outputFilename)
            const outputPathRelative = path.join('/', variantsDirRelative, outputFilename)

            console.log(`[Transcoding] Creating ${quality.name} variant...`)

            await new Promise((resolve, reject) => {
                // Using CRF (Constant Rate Factor) instead of fixed bitrate to prevent bloat.
                // CRF 24-28 is a good range for balance.
                const ffmpeg = spawn('ffmpeg', [
                    '-i', sourceFilePath,
                    '-vf', `scale=-2:${quality.height}`,
                    '-c:v', 'libx264',
                    '-crf', '26', // Higher number = lower quality/smaller size. 
                    '-maxrate', quality.maxBitrate,
                    '-bufsize', (parseInt(quality.maxBitrate) * 2) + 'k',
                    '-c:a', 'aac',
                    '-b:a', '128k',
                    '-preset', 'veryfast',
                    '-y',
                    outputPathAbsolute
                ])

                ffmpeg.on('close', (code: number | null) => {
                    if (code === 0) resolve(true)
                    else reject(new Error(`FFmpeg exited with code ${code}`))
                })
            })

            // Save variant to database
            await prisma.movieVariant.upsert({
                where: { movieId_quality: { movieId, quality: quality.height } },
                update: { file: outputPathRelative },
                create: { movieId, quality: quality.height, file: outputPathRelative }
            })

            console.log(`[Transcoding] ${quality.name} variant completed.`)
        }

        console.log(`[Transcoding] Done for Movie ID: ${movieId}`)
    } catch (error) {
        console.error(`[Transcoding] Error:`, error)
        throw error
    }
}
