import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const movieId = parseInt(idStr)

        if (isNaN(movieId)) {
            return new NextResponse('Invalid ID', { status: 400 })
        }

        const session = await getServerSession(authOptions)
        const currentUserId = (session?.user as any)?.id

        const commentInclude = {
            user: {
                select: {
                    name: true,
                    image: true,
                    username: true
                }
            },
            reactions: true,
            _count: {
                select: { reactions: true }
            }
        }

        const comments = await prisma.movieComment.findMany({
            where: { movieId, parentId: null },
            include: {
                ...commentInclude,
                replies: {
                    include: commentInclude
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formatComment = (c: any) => ({
            ...c,
            likes: c.reactions.filter((r: any) => r.type === 'LIKE').length,
            dislikes: c.reactions.filter((r: any) => r.type === 'DISLIKE').length,
            userReaction: c.reactions.find((r: any) => r.userId === currentUserId)?.type || null,
            replies: c.replies?.map(formatComment) || []
        })

        return NextResponse.json(comments.map(formatComment))
    } catch (error) {
        console.error('Fetch comments error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

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
        const { text, gifUrl, parentId } = await req.json()

        if (isNaN(movieId) || (!text && !gifUrl)) {
            return new NextResponse('Invalid data', { status: 400 })
        }

        const userId = (session.user as any).id

        const comment = await prisma.movieComment.create({
            data: {
                movieId,
                userId,
                text,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        username: true
                    }
                }
            }
        })

        return NextResponse.json({
            ...comment,
            likes: 0,
            dislikes: 0,
            userReaction: null,
            replies: []
        })
    } catch (error) {
        console.error('Post comment error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
