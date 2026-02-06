const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const user = await prisma.user.findFirst()
        if (!user) { console.log('No user found'); return }

        console.log('Found user:', user.id, user.name)

        const short = await prisma.short.findFirst()
        if (!short) { console.log('No short found'); return }

        console.log('Found short:', short.id, short.title)

        // Clean up existing like if any
        try {
            await prisma.shortLike.delete({
                where: { shortId_userId: { shortId: short.id, userId: user.id } }
            })
            console.log('Cleaned up existing like')
        } catch (e) { }

        const like = await prisma.shortLike.create({
            data: {
                shortId: short.id,
                userId: user.id
            }
        })
        console.log('Successfully created like via script:', like)
    } catch (e) {
        console.error('Error in script:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
