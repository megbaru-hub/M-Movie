import { prisma } from '@/lib/prisma'
import { Film, Users, Play, Heart, TrendingUp, Clock, Globe, ShieldCheck, UserPlus, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    // Fetch overview stats and recent activity
    const [movieCount, shortCount, userCount, commentCount, recentMovies, latestUsers, latestComments] = await Promise.all([
        prisma.movie.count(),
        prisma.short.count(),
        prisma.user.count(),
        prisma.comment.count(),
        prisma.movie.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, createdAt: true }
        }),
        prisma.comment.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        })
    ])

    const stats = [
        { label: 'Total Anthology', value: movieCount, icon: Film, color: 'text-blue-500', trend: '+12%' },
        { label: 'Shorts Content', value: shortCount, icon: Play, color: 'text-primary', trend: '+5%' },
        { label: 'Active Personnel', value: userCount, icon: Users, color: 'text-emerald-500', trend: '+24%' },
        { label: 'Total Engagements', value: commentCount, icon: Heart, color: 'text-rose-500', trend: '+8%' },
    ]

    return (
        <div className="space-y-16">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-12 rounded-full bg-primary" />
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter">Command Center</h1>
                    </div>
                    <p className="text-zinc-500 max-w-2xl font-medium text-lg">
                        Operational overview of the M-Movies ecosystem. Monitor performance, manage core content, and oversee the global directory.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-md flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Sync Status</p>
                        <p className="text-sm font-black text-white uppercase italic">All Systems Nominal</p>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="group p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 hover:border-primary/20 transition-all cursor-default relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="h-24 w-24" />
                        </div>
                        <div className="relative space-y-4">
                            <div className={`h-12 w-12 rounded-2xl bg-zinc-950 flex items-center justify-center ${stat.color} border border-white/5`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">{stat.label}</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                                    <span className="text-[10px] font-black text-emerald-500 mb-1.5 uppercase tracking-widest">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Recent Content Table */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">Recent Deployment</h2>
                        <Link href="/admin/content" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-rose-400 transition-colors">View All Archive →</Link>
                    </div>
                    <div className="rounded-[3rem] bg-zinc-900/40 border border-white/5 overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Content Identifier</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Type</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Category</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-zinc-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentMovies.length > 0 ? recentMovies.map((movie) => (
                                    <tr key={movie.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-16 rounded-lg bg-zinc-950 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {movie.thumbnail ? (
                                                        <img src={movie.thumbnail} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    ) : (
                                                        <Film className="h-4 w-4 text-zinc-800" />
                                                    )}
                                                </div>
                                                <p className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{movie.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{movie.category}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{movie.genre || 'General'}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">Modify</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                            No content deployed yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Alerts / Real Logs */}
                <div className="lg:col-span-4 space-y-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white px-4">Live Telemetry</h2>
                    <div className="space-y-4">
                        {/* New Users */}
                        {latestUsers.map((user) => (
                            <div key={user.id} className="flex gap-6 p-6 rounded-[2rem] bg-zinc-900/30 border border-white/5 backdrop-blur-sm">
                                <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 border border-white/5 text-emerald-500">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white">New User Enlisted</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Identity: {user.username || 'Anonymous'}</p>
                                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest pt-2">
                                        {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Recent Comments */}
                        {latestComments.map((comment) => (
                            <div key={comment.id} className="flex gap-6 p-6 rounded-[2rem] bg-zinc-900/30 border border-white/5 backdrop-blur-sm">
                                <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 border border-white/5 text-primary">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white">New Engagement</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed line-clamp-1">
                                        User {comment.user?.username || 'Unknown'} commented.
                                    </p>
                                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest pt-2">
                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {latestUsers.length === 0 && latestComments.length === 0 && (
                            <div className="p-8 text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
