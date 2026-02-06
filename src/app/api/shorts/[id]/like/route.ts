import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        console.log('[API Like] Endpoint hit')

        // Await params for Next.js 15+
        const params = await props.params
        console.log('[API Like] Params resolved:', params)

        const session = await getServerSession(authOptions)
        if (!session?.user || !(session.user as any).id) {
            console.log('[API Like] No valid session')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const shortId = parseInt(params.id)

        console.log(`[API Like] User ${userId} toggling like for Short ${shortId}`)

        if (isNaN(shortId)) {
            console.error('[API Like] Invalid Short ID NaN')
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        // Check if already liked
        const existingLike = await prisma.shortLike.findUnique({
            where: {
                shortId_userId: {
                    shortId,
                    userId
                }
            }
        })

        console.log('[API Like] Existing like found?', !!existingLike)

        if (existingLike) {
            // Unlike
            await prisma.shortLike.delete({
                where: { id: existingLike.id }
            })
            console.log('[API Like] Deleted like')
            return NextResponse.json({ liked: false })
        } else {
            // Like
            const newLike = await prisma.shortLike.create({
                data: {
                    shortId,
                    userId
                }
            })
            console.log('[API Like] Created like:', newLike.id)
            return NextResponse.json({ liked: true })
        }

    } catch (error) {
        console.error('[API Like] Error toggling like:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
