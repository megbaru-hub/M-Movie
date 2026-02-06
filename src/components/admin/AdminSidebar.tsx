'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Film,
    Users,
    Settings,
    ChevronLeft,
    PlusCircle,
    MonitorPlay,
    BarChart3,
    ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminLinks = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: Film, label: 'Content Manager', href: '/admin/content' },
    { icon: Users, label: 'User Directory', href: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: ShieldCheck, label: 'Security', href: '/admin/security' },
    { icon: Settings, label: 'General Settings', href: '/admin/settings' },
]

interface AdminSidebarProps {
    role: 'SUPER_ADMIN' | 'CONTENT_ADMIN'
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
    const pathname = usePathname()

    const visibleLinks = role === 'SUPER_ADMIN'
        ? adminLinks
        : adminLinks.filter(link => ['Overview', 'Content Manager'].includes(link.label))

    return (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-white/5 flex flex-col font-sans">
            {/* Admin Brand */}
            <div className="h-20 flex items-center px-8 border-b border-white/5 gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <MonitorPlay className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-tighter italic">Nexus Admin</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">M-Movies Core</p>
                </div>
            </div>

            <nav className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
                {/* Management Section */}
                <div>
                    <p className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Management</p>
                    <div className="space-y-1">
                        {visibleLinks.filter(l => ['Overview', 'Content Manager', 'User Directory'].includes(l.label)).map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative",
                                        isActive
                                            ? "bg-zinc-900 text-white border border-white/5"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                                    )}
                                    <link.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                    <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* System Section (Only for Super Admins) */}
                {role === 'SUPER_ADMIN' && (
                    <div>
                        <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">System</p>
                        <div className="space-y-1">
                            {visibleLinks.filter(l => ['Analytics', 'Security', 'General Settings'].includes(l.label)).map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all",
                                            isActive
                                                ? "bg-zinc-900 text-white border border-white/5"
                                                : "text-zinc-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <link.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                        <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 space-y-4 border-t border-white/5">
                <button
                    onClick={async () => {
                        await fetch('/api/admin/authorize', { method: 'DELETE' })
                        window.location.href = '/'
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-colors border border-rose-500/10"
                >
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 text-zinc-400 hover:text-white transition-colors border border-white/5"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Return to App</span>
                </Link>
            </div>
        </div>
    )
}
