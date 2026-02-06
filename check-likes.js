const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const likes = await prisma.shortLike.findMany()
        console.log('Total Likes in DB:', likes.length)
        if (likes.length > 0) {
            console.log('Sample Like:', likes[0])
        } else {
            console.log('No likes found in DB.')
        }

        // Check shorts
        const shorts = await prisma.short.findMany({
            include: { _count: { select: { likes: true } } }
        })
        console.log('Shorts with counts:', shorts.map(s => ({ id: s.id, likeCount: s._count.likes })))
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
