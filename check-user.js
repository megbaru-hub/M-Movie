const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Fetching users...')
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        shorts: true,
                    }
                }
            }
        })
        console.log('Users:', users)
    } catch (e) {
        console.error('Error fetching user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
