const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkContent() {
    const movies = await prisma.movie.findMany({
        select: {
            id: true,
            title: true,
            uploaderId: true,
            category: true
        }
    });

    console.log('--- MOVIE INVENTORY SCAN ---');
    console.table(movies);

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            role: true
        }
    });
    console.log('\n--- SYSTEM USERS ---');
    console.table(users);
}

checkContent().catch(console.error).finally(() => prisma.$disconnect());
