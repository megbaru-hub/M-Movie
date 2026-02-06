import { prisma } from '@/lib/prisma'
import AnalyticsDashboard from './AnalyticsDashboard'
import { subDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    // 1. Fetch Aggregated Data
    const totalUsers = await prisma.user.count()
    const totalComments = await prisma.comment.count()

    // Summing views might be heavy if table is huge, but fine for now
    const shorts = await prisma.short.findMany({ select: { views: true } })
    const totalShortsViews = shorts.reduce((acc, curr) => acc + curr.views, BigInt(0))

    // 2. Aggregate Growth / Engagement Last 7 Days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i)
        return {
            date: d,
            label: format(d, 'EEE') // Mon, Tue...
        }
    })

    const engagementData = await Promise.all(last7Days.map(async (day) => {
        const start = new Date(day.date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(day.date)
        end.setHours(23, 59, 59, 999)

        const users = await prisma.user.count({
            where: { createdAt: { gte: start, lte: end } }
        })
        const comments = await prisma.comment.count({
            where: { createdAt: { gte: start, lte: end } }
        })

        return {
            day: day.label,
            users,
            comments
        }
    }))

    // 3. Mock Performance Data (since we don't store request logs in DB)
    const mockPerformanceData = [
        { time: '00:00', latency: 45, requests: 240 },
        { time: '04:00', latency: 30, requests: 120 },
        { time: '08:00', latency: 65, requests: 890 },
        { time: '12:00', latency: 50, requests: 1200 },
        { time: '16:00', latency: 85, requests: 940 },
        { time: '20:00', latency: 60, requests: 650 },
        { time: '23:59', latency: 40, requests: 300 },
    ]

    return (
        <AnalyticsDashboard
            performanceData={mockPerformanceData}
            engagementData={engagementData}
            totalUsers={totalUsers}
            totalComments={totalComments}
            totalShortsViews={totalShortsViews}
        />
    )
}
