import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { movieId, rating } = await req.json()

        if (!movieId || typeof rating !== 'number' || rating < 1 || rating > 10) {
            return new NextResponse('Invalid data', { status: 400 })
        }

        const userId = (session.user as any).id

        const result = await prisma.rating.upsert({
            where: {
                movieId_userId: {
                    movieId,
                    userId
                }
            },
            update: {
                value: rating
            },
            create: {
                movieId,
                userId,
                value: rating
            }
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Rating error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
