import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { commentId: idStr } = await params
        const commentId = parseInt(idStr)
        const { type } = await req.json() // 'LIKE' or 'DISLIKE' or null (to remove)

        if (isNaN(commentId)) {
            return new NextResponse('Invalid ID', { status: 400 })
        }

        const userId = (session.user as any).id

        if (!type) {
            // Remove reaction
            await prisma.movieCommentReaction.deleteMany({
                where: { commentId, userId }
            })
            return NextResponse.json({ success: true })
        }

        const reaction = await prisma.movieCommentReaction.upsert({
            where: {
                commentId_userId: {
                    commentId,
                    userId
                }
            },
            update: { type },
            create: {
                commentId,
                userId,
                type
            }
        })

        return NextResponse.json(reaction)
    } catch (error) {
        console.error('Comment reaction error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
