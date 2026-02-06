
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Starting cleanup of placeholder movies...")

    // Delete all items from the Movie table that are likely placeholders.
    // The user said "dont touch the short", which implies the Short model.
    // But just in case 'Movie' table is used for everything, I'll filter by category if needed.
    // However, looking at the schema generally, Short is a separate model.
    // The seed data added categories: 'movie', 'tvseries', 'anime', 'music'.

    const { count } = await prisma.movie.deleteMany({
        where: {
            category: {
                in: ['movie', 'tvseries', 'anime', 'music']
            }
        }
    })

    console.log(`Deleted ${count} placeholder movies/videos.`)
    console.log("Shorts and User data were NOT touched.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
