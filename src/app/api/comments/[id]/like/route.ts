import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const commentId = parseInt(params.id)

        const session = await getServerSession(authOptions)
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id

        if (isNaN(commentId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        // Check if already liked
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                commentId_userId: {
                    commentId,
                    userId
                }
            }
        })

        if (existingLike) {
            // Unlike
            await prisma.commentLike.delete({
                where: { id: existingLike.id }
            })
            return NextResponse.json({ liked: false })
        } else {
            // Like
            await prisma.commentLike.create({
                data: {
                    commentId,
                    userId
                }
            })
            return NextResponse.json({ liked: true })
        }

    } catch (error) {
        console.error('Error toggling comment like:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
