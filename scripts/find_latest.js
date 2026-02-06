
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findLatestMovie() {
    try {
        const movie = await prisma.movie.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, originalFile: true }
        })
        console.log("LATEST_MOVIE:", JSON.stringify(movie))
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

findLatestMovie()
