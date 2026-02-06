import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const userId = params.id

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        shorts: true,
                        followedBy: true,
                        following: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Add follow check if viewer is logged in
        const session = await getServerSession(authOptions)
        const viewerId = (session?.user as any)?.id
        let isFollowedByViewer = false

        if (viewerId) {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: viewerId,
                        followingId: userId
                    }
                }
            })
            isFollowedByViewer = !!follow
        }

        return NextResponse.json({
            ...user,
            isFollowedByViewer
        })

    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const userId = params.id

        const session = await getServerSession(authOptions)
        const currentUserId = (session?.user as any)?.id

        if (!currentUserId || currentUserId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, bio, username } = body

        // Validate username uniqueness if changed
        if (username) {
            const existing = await prisma.user.findUnique({ where: { username } })
            if (existing && existing.id !== userId) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                bio,
                username
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
