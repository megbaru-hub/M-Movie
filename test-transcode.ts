import { transcodeVideo } from './src/lib/video-transcoding'
import { prisma } from './src/lib/prisma'
import path from 'path'

async function runLegacyTranscoding(id: number) {
    const movie = await prisma.movie.findUnique({ where: { id } })
    if (!movie || !movie.originalFile) {
        console.error("Movie or original file not found")
        return
    }

    const publicDir = path.join(process.cwd(), 'public')
    const sourcePath = path.join(publicDir, movie.originalFile)

    console.log(`Starting manual transcoding for ${movie.title} (${id}) at ${sourcePath}`)
    await transcodeVideo(id, sourcePath)
    console.log("Transcoding finished")
}

runLegacyTranscoding(26).catch(console.error)
