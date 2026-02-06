import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id: idStr } = await params
        const movieId = parseInt(idStr)
        const { type } = await req.json() // 'LIKE', 'DISLIKE' or null (to remove)

        if (isNaN(movieId)) {
            return new NextResponse('Invalid ID', { status: 400 })
        }

        const userId = (session.user as any).id

        if (!type) {
            // Remove reaction
            await prisma.movieReaction.deleteMany({
                where: { movieId, userId }
            })
            return NextResponse.json({ success: true, type: null })
        }

        const reaction = await prisma.movieReaction.upsert({
            where: {
                movieId_userId: {
                    movieId,
                    userId
                }
            },
            update: {
                type
            },
            create: {
                movieId,
                userId,
                type
            }
        })

        return NextResponse.json(reaction)
    } catch (error) {
        console.error('Reaction error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
