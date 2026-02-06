const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Fetching shorts...')

        // Test 1: No user
        console.log('--- Test 1: No User ---')
        let shorts = await prisma.short.findMany({
            take: 1,
            include: {
                user: {
                    include: {
                        followedBy: false
                    }
                }
            }
        })
        console.log('Short User:', shorts[0]?.user)

        // Test 2: With User
        console.log('--- Test 2: With User ---')
        const user = await prisma.user.findFirst()
        const userId = user?.id

        if (userId) {
            shorts = await prisma.short.findMany({
                take: 1,
                include: {
                    user: {
                        include: {
                            followedBy: {
                                where: { followerId: userId },
                                select: { followerId: true }
                            }
                        }
                    }
                }
            })
            console.log('Short User (Auth):', shorts[0]?.user)
        }

    } catch (e) {
        console.error('Error fetching shorts:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
