
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 12)

    const username = 'Archiver01'
    const name = 'Content Archiver Node'

    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {
                role: 'CONTENT_ADMIN',
                passwordHash: hashedPassword,
                name: name
            },
            create: {
                username,
                name,
                passwordHash: hashedPassword,
                role: 'CONTENT_ADMIN',
            },
        })

        console.log(`SUCCESS: User '${user.username}' (Name: ${user.name}) is now a ${user.role}.`)
        console.log(`Password set to: ${password}`)
    } catch (e) {
        console.error("Error creating user:", e)
    }
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
