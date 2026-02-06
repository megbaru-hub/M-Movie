import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        console.log('[API /api/shorts] Fetching shorts...')

        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id

        // Parse Query Params
        const { searchParams } = new URL(req.url)
        const filter = searchParams.get('filter') // 'following' or null
        const targetUserId = searchParams.get('userId')

        console.log('[API /api/shorts] User:', userId, 'Filter:', filter, 'Target:', targetUserId)

        let whereClause: any = {}

        if (filter === 'following') {
            if (!userId) {
                // Return empty if not logged in and asking for following
                return NextResponse.json([])
            }
            whereClause = {
                user: {
                    followedBy: {
                        some: {
                            followerId: userId
                        }
                    }
                }
            }
        } else if (targetUserId) {
            whereClause = { userId: targetUserId }
        }

        const shorts = await prisma.short.findMany({
            where: whereClause,
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        // Check if the current user follows this creator
                        followedBy: userId ? {
                            where: { followerId: userId },
                            select: { followerId: true }
                        } : false
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                },
                // Fetch likes for current user to check if liked
                likes: userId ? {
                    where: { userId: userId },
                    select: { id: true }
                } : false
            }
        })

        console.log('[API /api/shorts] Fetched count:', shorts.length)

        const serializedShorts = shorts.map(short => {
            const userLikes = (short as any).likes
            const isLiked = userId && Array.isArray(userLikes) ? userLikes.length > 0 : false

            // Following check
            const followedBy = (short.user as any)?.followedBy
            const isFollowed = userId && Array.isArray(followedBy) ? followedBy.length > 0 : false

            return {
                ...short,
                views: short.views.toString(),
                likeCount: short._count.likes,
                commentCount: short._count.comments,
                isLikedByCurrentUser: isLiked,
                isFollowedByCurrentUser: isFollowed,
                // Remove internal relation data
                likes: undefined,
                _count: undefined,
            }
        })

        return NextResponse.json(serializedShorts)
    } catch (error) {
        console.error('[API /api/shorts] Error fetching shorts:', error)
        return NextResponse.json([])
    }
}
