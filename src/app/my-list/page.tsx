import React from 'react'
import { Bookmark, Film, Plus } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import MovieCard from '@/components/movies/MovieCard'

export default async function MyListPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/signin')
    }

    const userId = (session.user as any).id

    // Fetch user's watchlist
    const watchlistItems = await prisma.watchlist.findMany({
        where: { userId },
        include: {
            movie: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const movies = watchlistItems.map(item => item.movie)

    return (
        <div className="min-h-screen bg-zinc-950 p-8 md:p-20 lg:p-32">
            <div className="max-w-7xl mx-auto space-y-20">
                <header className="flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-12 rounded-full bg-primary" />
                            <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter">My Archive</h1>
                        </div>
                        <p className="text-zinc-500 max-w-xl font-medium text-lg leading-relaxed">
                            Your personal curated museum of cinematic experiences.
                            Saved, secured, and ready for your next viewing session.
                        </p>
                    </div>
                    <div className="flex items-center gap-6 pb-2">
                        <div className="text-right">
                            <p className="text-2xl font-black text-white italic">{movies.length} Items</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Storage sync active</p>
                        </div>
                    </div>
                </header>

                {movies.length === 0 ? (
                    <>
                        {/* Professional Empty State */}
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-primary/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                            <div className="relative flex flex-col items-center justify-center min-h-[50vh] rounded-[3.5rem] border border-dashed border-white/10 bg-zinc-900/10 backdrop-blur-3xl px-8 text-center transition-all group-hover:bg-zinc-900/20 group-hover:border-white/20">
                                <div className="h-28 w-28 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-800 mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all shadow-2xl">
                                    <Bookmark className="h-12 w-12" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">The Vault is Waiting</h2>
                                <p className="text-zinc-500 max-w-sm mb-12 text-lg font-medium leading-relaxed">Your collection is empty. Explore our world-class library and start building your personal anthology today.</p>
                                <Link href="/explore" className="btn-premium flex items-center gap-3">
                                    <Plus className="h-5 w-5" />
                                    Discover Cinema
                                </Link>
                            </div>
                        </div>

                        {/* Quick Recommendations Placeholder */}
                        <div className="pt-12 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600">Suggested for you</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-20 pointer-events-none grayscale">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="aspect-[2/3] rounded-2xl bg-zinc-900 border border-white/5" />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                            {movies.map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    id={movie.id}
                                    title={movie.title}
                                    year={movie.year || undefined}
                                    thumbnail={movie.thumbnail || undefined}
                                    category={movie.category}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
