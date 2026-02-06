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
        const targetUserId = params.id

        const session = await getServerSession(authOptions)
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUserId = (session.user as any).id

        if (currentUserId === targetUserId) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            }
        })

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: targetUserId
                    }
                }
            })
            return NextResponse.json({ following: false })
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            })
            return NextResponse.json({ following: true })
        }

    } catch (error) {
        console.error('Error toggling follow:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
