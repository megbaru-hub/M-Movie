import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const shortId = parseInt(params.id)

        if (isNaN(shortId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        // Increment view count
        await prisma.short.update({
            where: { id: shortId },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error incrementing view:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
