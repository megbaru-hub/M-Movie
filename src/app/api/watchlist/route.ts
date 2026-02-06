import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { movieId } = await request.json()

    if (!movieId) {
        return NextResponse.json({ error: 'Movie ID required' }, { status: 400 })
    }

    try {
        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_movieId: {
                    userId,
                    movieId: parseInt(movieId)
                }
            }
        })

        if (existing) {
            await prisma.watchlist.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ added: false })
        } else {
            await prisma.watchlist.create({
                data: {
                    userId,
                    movieId: parseInt(movieId)
                }
            })
            return NextResponse.json({ added: true })
        }
    } catch (error) {
        console.error('Watchlist error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
