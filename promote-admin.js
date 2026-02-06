const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const userId = 'cml9qqv1f0000ku40t7tuymgo' // Megb DE
        console.log(`Promoting user ${userId} to SUPER_ADMIN...`)

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: 'SUPER_ADMIN' }
        })

        console.log('Success! User updated:', user)
    } catch (e) {
        console.error('Error updating role:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
