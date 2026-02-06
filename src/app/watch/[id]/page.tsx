import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Film, Play } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

import MediaDownloadButton from '@/components/video/MediaDownloadButton'
import WatchlistButton from '@/components/video/WatchlistButton'
import VideoPlayerClient from '@/components/video/VideoPlayerClient'
import ShareButton from '@/components/video/ShareButton'
import StarRating from '@/components/video/StarRating'
import MovieComments from '@/components/video/MovieComments'
import MovieReactions from '@/components/video/MovieReactions'
import { Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WatchPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ autoplay?: string }> }) {
    const { id: idStr } = await params
    const { autoplay } = await searchParams
    const id = parseInt(idStr)

    if (isNaN(id)) {
        return notFound()
    }

    const movieData = await (prisma.movie as any).update({
        where: { id },
        data: { views: { increment: 1 } },
        include: {
            variants: true,
            ratings: true,
            reactions: true,
            _count: {
                select: {
                    ratings: true,
                    comments: true,
                    reactions: true
                }
            }
        }
    })
    const movie = movieData as any

    if (!movie) {
        return notFound()
    }

    const avgRating = movie.ratings.length > 0
        ? movie.ratings.reduce((acc: number, r: { value: number }) => acc + r.value, 0) / movie.ratings.length
        : 0;

    const views = Number(movie.views)
    const likes = movie.reactions.filter((r: any) => r.type === 'LIKE').length
    const dislikes = movie.reactions.filter((r: any) => r.type === 'DISLIKE').length

    const session = await getServerSession(authOptions)
    let isWatchlisted = false
    let userReaction: 'LIKE' | 'DISLIKE' | null = null

    if (session?.user) {
        const userId = (session.user as any).id

        // Watchlist status
        const watchlistEntry = await (prisma as any).watchlist.findUnique({
            where: {
                userId_movieId: {
                    userId,
                    movieId: id
                }
            }
        })
        isWatchlisted = !!watchlistEntry

        // Reaction status
        const reaction = movie.reactions.find((r: any) => r.userId === userId)
        userReaction = (reaction?.type as 'LIKE' | 'DISLIKE') || null
    }

    const availableQualities = (movie.variants as any[]).map((v: any) => v.quality).sort((a: number, b: number) => b - a)


    // Fetch related content
    const relatedMovies = await prisma.movie.findMany({
        where: {
            category: movie.category,
            NOT: { id: movie.id }
        },
        take: 10,
    })

    const nextMovie = await prisma.movie.findFirst({
        where: {
            category: movie.category,
            id: { gt: id }
        },
        orderBy: { id: 'asc' },
        select: { id: true }
    })

    const prevMovie = await prisma.movie.findFirst({
        where: {
            category: movie.category,
            id: { lt: id }
        },
        orderBy: { id: 'desc' },
        select: { id: true }
    })

    const videoUrl = `/api/stream/${movie.id}`
    console.log('WatchPage: ID=', movie.id, 'URL=', videoUrl)

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8 lg:p-12">
            <div className="max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Section: Player & Primary Info */}
                <div className="xl:col-span-8 space-y-10">
                    {/* Cinematic Player */}
                    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                        <VideoPlayerClient
                            url={videoUrl}
                            title={movie.title}
                            thumbnail={movie.thumbnail || undefined}
                            subtitleUrl={movie.subtitles || undefined}
                            availableQualities={availableQualities}
                            nextId={nextMovie?.id}
                            prevId={prevMovie?.id}
                            autoPlay={autoplay === 'true'}
                        />
                    </div>

                    {/* Details Section */}
                    <div className="space-y-8">
                        <section className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/50 tracking-tighter capitalize">{movie.title}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                                        {movie.category}
                                    </span>
                                    {movie.year && (
                                        <span className="text-zinc-500 font-bold text-lg">{movie.year}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-zinc-500" />
                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{views.toLocaleString()} Views</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-2">
                                    <StarRating movieId={movie.id} initialRating={avgRating} />
                                </div>
                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Ultra HD 4K</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                <span className="text-zinc-500 font-medium">Genre: <span className="text-zinc-300 ml-1">{movie.genre || 'Various'}</span></span>
                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                <span className="text-zinc-500 font-medium">Origin: <span className="text-zinc-300 ml-1">{movie.country || 'International'}</span></span>
                            </div>
                        </section>

                        {/* Interactive Bar */}
                        <div className="flex items-center gap-10 py-8 border-y border-white/5">
                            <WatchlistButton
                                movieId={movie.id}
                                initialIsAdded={isWatchlisted}
                            />
                            <MovieReactions
                                movieId={movie.id}
                                initialLikes={likes}
                                initialDislikes={dislikes}
                                userReaction={userReaction}
                            />

                            <ShareButton
                                movieId={movie.id}
                                movieTitle={movie.title}
                            />

                            <MediaDownloadButton
                                videoUrl={videoUrl}
                                subtitleUrl={movie.subtitles || undefined}
                                title={movie.title}
                            />
                        </div>

                        {/* Discussion Section */}
                        <div className="pt-4">
                            <MovieComments movieId={movie.id} />
                        </div>
                    </div>
                </div>

                {/* Right Section: Up Next */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Up Next</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">More in {movie.category}</span>
                    </div>

                    <div className="space-y-6">
                        {relatedMovies.map((m: any) => (
                            <Link key={m.id} href={`/watch/${m.id}?autoplay=true`} className="flex gap-4 group cursor-pointer">
                                <div className="relative h-24 aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-primary/50 transition-all duration-300 shrink-0 flex items-center justify-center">
                                    {m.thumbnail ? (
                                        <img src={m.thumbnail} alt={m.title} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <Film className="h-6 w-6 text-zinc-800" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                        <Play className="h-6 w-6 fill-white text-white" />
                                    </div>
                                </div>
                                <div className="py-1">
                                    <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-2">{m.title}</h3>
                                    <p className="text-xs text-zinc-500 mt-1">{m.year} • {m.genre}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
