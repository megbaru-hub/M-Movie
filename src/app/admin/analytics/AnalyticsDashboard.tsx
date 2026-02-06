'use client'

import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from 'recharts'
import { Activity, Users, Eye, Heart, Server, Globe } from 'lucide-react'

interface AnalyticsDashboardProps {
    performanceData: any[]
    engagementData: any[]
    totalUsers: number
    totalComments: number
    totalShortsViews: bigint
}

export default function AnalyticsDashboard({
    performanceData,
    engagementData,
    totalUsers,
    totalComments,
    totalShortsViews
}: AnalyticsDashboardProps) {
    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">System Analytics</h1>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Real-time Performance Telemetry</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Server className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-[xs] font-black text-emerald-500 uppercase tracking-widest text-[9px]">Optimal</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">24ms</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg Latency (Mock)</p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="px-2 py-1 rounded-full bg-blue-500/10 text-[xs] font-black text-blue-500 uppercase tracking-widest text-[9px]">Live count</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">{totalShortsViews.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Short Views</p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-rose-500" />
                        </div>
                        <span className="px-2 py-1 rounded-full bg-rose-500/10 text-[xs] font-black text-rose-500 uppercase tracking-widest text-[9px]">Total</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">{totalComments.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Comments</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latency Chart */}
                <div className="p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">System Load (Simulated)</h3>
                        <Globe className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Chart */}
                <div className="p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">User Growth & Engagement</h3>
                        <Users className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#27272a' }}
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="users" name="New Users" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="comments" name="Comments" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
