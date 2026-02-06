
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const movies = await prisma.movie.findMany()
    console.log(`Found ${movies.length} movies:`)
    movies.forEach(m => {
        console.log(`ID: ${m.id} | Title: ${m.title} | Category: ${m.category}`)
    })
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
