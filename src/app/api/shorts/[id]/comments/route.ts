import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

// GET: Fetch comments for a short with replies and user data
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const shortId = parseInt(params.id)

        if (isNaN(shortId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id

        // Fetch top-level comments (parentId is null)
        const comments = await prisma.comment.findMany({
            where: {
                shortId,
                parentId: null // Only fetch root comments
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        username: true
                    }
                },
                _count: {
                    select: { likes: true, replies: true }
                },
                // Check if liked by current user
                likes: userId ? {
                    where: { userId },
                    select: { userId: true }
                } : false,
                // Include replies
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                                username: true
                            }
                        },
                        _count: { select: { likes: true } },
                        likes: userId ? {
                            where: { userId },
                            select: { userId: true }
                        } : false
                    }
                }
            }
        })

        // Serialize comments to include flat isLiked boolean
        const serializeComment = (c: any) => ({
            ...c,
            likeCount: c._count.likes,
            replyCount: c._count.replies || 0,
            isLiked: userId && c.likes?.length > 0,
            replies: c.replies?.map(serializeComment) || [],
            likes: undefined,
            _count: undefined
        })

        const serializedComments = comments.map(serializeComment)

        return NextResponse.json(serializedComments)
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST: Add a new comment or reply
export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const session = await getServerSession(authOptions)
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const shortId = parseInt(params.id)
        if (isNaN(shortId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const body = await req.json()
        const { text, gifUrl, parentId } = body

        if (!text && !gifUrl) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
        }

        const comment = await prisma.comment.create({
            data: {
                shortId,
                userId: (session.user as any).id,
                text: text?.trim() || '',
                gifUrl: gifUrl || null,
                parentId: parentId ? parseInt(parentId) : null
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        username: true
                    }
                },
                _count: { select: { likes: true, replies: true } }
            }
        })

        // Return standardized structure
        return NextResponse.json({
            ...comment,
            likeCount: 0,
            replyCount: 0,
            isLiked: false,
            replies: []
        })
    } catch (error) {
        console.error('Error posting comment:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
