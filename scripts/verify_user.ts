
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const username = 'Archiver01'
    const password = 'password123'

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        console.log(`User '${username}' NOT FOUND.`)
        return
    }

    console.log(`User Found: ${user.username}`)
    console.log(`Role: ${user.role}`)
    console.log(`Stored Hash: ${user.passwordHash?.substring(0, 10)}...`)

    if (user.passwordHash) {
        const isMatch = await bcrypt.compare(password, user.passwordHash)
        console.log(`Password '${password}' match: ${isMatch}`)
    } else {
        console.log("No password hash stored.")
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
