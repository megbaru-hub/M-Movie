'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Bell, Upload, ChevronDown, LogOut, User as UserIcon, X, Menu, Home, Compass, Clapperboard, Film, Tv, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const menuItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Compass, label: 'Explore', href: '/explore' },
        { icon: Clapperboard, label: 'Shorts', href: '/shorts' },
        { icon: Film, label: 'My List', href: '/my-list' },
    ]

    const categories = [
        { icon: Music, label: 'Music', href: '/explore?category=music' },
        { icon: Film, label: 'Movies', href: '/explore?category=movies' },
        { icon: Tv, label: 'TV Shows', href: '/explore?category=tvseries' },
        { icon: Compass, label: 'Anime', href: '/explore?category=anime' },
    ]

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                isScrolled
                    ? "h-16 glass border-b border-white/10"
                    : "h-20 bg-transparent"
            )}
        >
            <div className="mx-auto flex h-full items-center justify-between px-6 md:px-12">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setShowMobileMenu(true)}
                    className="md:hidden text-zinc-400 hover:text-white transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center group">
                        <div className="relative h-12 w-auto">
                            <img
                                src="/logo.png"
                                alt="M-Movies Logo"
                                className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        {['Home', 'Movies', 'TV Shows', 'Shorts'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : item === 'Movies' ? '/explore?category=movies' : item === 'TV Shows' ? '/explore?category=tvseries' : '/shorts'}
                                className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-8">
                    <form
                        onSubmit={handleSearch}
                        className="hidden lg:flex relative group"
                    >
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search library..."
                            className="h-10 w-48 rounded-full bg-zinc-900/50 pl-11 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:w-72 focus:bg-zinc-900 border border-white/5 focus:border-primary/30 transition-all font-bold"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </form>

                    <div className="flex items-center gap-6 text-zinc-400">
                        {status === 'authenticated' && (
                            <>
                                <Link href="/shorts/upload" className="hover:text-white transition-colors relative group">
                                    <Upload className="h-5 w-5" />
                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        Upload Short
                                    </span>
                                </Link>
                                <button className="hover:text-white transition-colors relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/40" />
                                </button>
                            </>
                        )}

                        {status === 'loading' && (
                            <div className="h-9 w-9 rounded-xl bg-zinc-900 animate-pulse" />
                        )}

                        {status === 'unauthenticated' && (
                            <Link
                                href="/signin"
                                className="px-6 py-2 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/80 transition-all"
                            >
                                Sign In
                            </Link>
                        )}

                        {status === 'authenticated' && session?.user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-3 transition-all hover:opacity-80"
                                >
                                    <div className="relative h-9 w-9 overflow-hidden rounded-xl">
                                        {session.user.image ? (
                                            <img
                                                key={session.user.image}
                                                src={session.user.image}
                                                alt={session.user.name || 'User'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white font-black text-xs">
                                                {session.user.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden">
                                        <div className="p-4 border-b border-white/5">
                                            <p className="text-sm font-black text-white truncate">{session.user.name}</p>
                                            <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                href="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                <UserIcon className="h-4 w-4" />
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false)
                                                    signOut({ callbackUrl: '/' })
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {showMobileMenu && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileMenu(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-80 bg-zinc-950 border-r border-white/10 z-[101] md:hidden overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <Link href="/" onClick={() => setShowMobileMenu(false)}>
                                    <img src="/logo.png" alt="M-Movies" className="h-10 w-auto" />
                                </Link>
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* User Section */}
                            {status === 'authenticated' && session?.user && (
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden">
                                            {session.user.image ? (
                                                <img src={session.user.image} alt={session.user.name || 'User'} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white font-black">
                                                    {session.user.name?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                                            <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Menu */}
                            <div className="p-6">
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Menu</p>
                                <nav className="space-y-2">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setShowMobileMenu(false)}
                                                className={cn(
                                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                                                    isActive
                                                        ? "bg-primary text-white"
                                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span className="font-bold text-sm">{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>

                            {/* Categories */}
                            <div className="px-6 pb-6">
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Library</p>
                                <nav className="space-y-2">
                                    {categories.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="font-bold text-sm">{item.label}</span>
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Auth Actions */}
                            {status === 'authenticated' && (
                                <div className="p-6 border-t border-white/5">
                                    <Link
                                        href="/profile"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <UserIcon className="h-5 w-5" />
                                        <span className="font-bold text-sm">Profile</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowMobileMenu(false)
                                            signOut({ callbackUrl: '/' })
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="font-bold text-sm">Sign Out</span>
                                    </button>
                                </div>
                            )}

                            {status === 'unauthenticated' && (
                                <div className="p-6 border-t border-white/5">
                                    <Link
                                        href="/signin"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block w-full px-6 py-3 rounded-xl bg-primary text-white text-center text-sm font-black uppercase tracking-widest hover:bg-primary/80 transition-all"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}
