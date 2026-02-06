'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Clapperboard, MonitorPlay, Film, Tv, Music, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: Clapperboard, label: 'Shorts', href: '/shorts' },
    { icon: Film, label: 'My List', href: '/my-list' },
    { icon: Tv, label: 'Settings', href: '/settings' },
]

const categories = [
    { icon: Music, label: 'Music', href: '/explore?category=music' },
    { icon: Film, label: 'Movies', href: '/explore?category=movies' },
    { icon: Tv, label: 'TV Shows', href: '/explore?category=tvseries' },
    { icon: Compass, label: 'Anime', href: '/explore?category=anime' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden h-full w-20 flex-col items-center border-r border-white/5 bg-zinc-950 text-zinc-100 md:flex lg:w-72 lg:items-start transition-all duration-500">
            <div className="flex h-20 w-full items-center justify-center lg:justify-start lg:px-8">
                <Link href="/" className="flex items-center group">
                    <div className="relative h-10 w-auto lg:h-12">
                        <img
                            src="/logo.png"
                            alt="M-Movies Logo"
                            className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                </Link>
            </div>

            <div className="flex-1 w-full px-4 mt-8 space-y-10 overflow-y-auto no-scrollbar">
                {/* Main Menu */}
                <div>
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 h-4">Menu</p>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all relative overflow-hidden",
                                        isActive
                                            ? "bg-zinc-900 border border-white/5 text-white"
                                            : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                                    )}
                                    <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                    <span className="hidden font-bold text-sm lg:block">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Categories */}
                <div>
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 h-4">Library</p>
                    <nav className="space-y-1">
                        {categories.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all",
                                        isActive
                                            ? "text-primary"
                                            : "text-zinc-500 hover:text-zinc-100"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                                    <span className="hidden font-bold text-sm lg:block">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            <div className="p-8 w-full">
                <div className="rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-white/5 hidden lg:block">
                    <p className="text-xs font-bold text-white mb-1">Join Premium</p>
                    <p className="text-[10px] text-zinc-500 mb-3">Get unlimited access to thousands of titles.</p>
                    <Link href="/profile" className="block w-full rounded-xl bg-primary py-2 text-[10px] font-black uppercase tracking-widest text-center text-white hover:opacity-90 transition-opacity">
                        Upgrade
                    </Link>
                </div>

                <div className="mt-8 text-[10px] uppercase font-bold tracking-widest text-zinc-700 hidden lg:block px-4">
                    © 2026 M-Movies
                </div>
            </div>
        </div>
    )
}
