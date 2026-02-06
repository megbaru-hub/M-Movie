'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PlayCircle, Plus, Star, Calendar, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import StarRating from '@/components/video/StarRating'

interface MovieCardProps {
    id: number
    title: string
    year?: string
    thumbnail?: string
    category: string
    className?: string
    views?: number
    rating?: number
}

export default function MovieCard({ id, title, year, thumbnail, category, className, views = 0, rating = 0 }: MovieCardProps) {
    const formatViews = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
        return count.toString()
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <Link href={`/watch/${id}?autoplay=true`} className={cn("block w-full", className)}>
                {/* Poster Container */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03] group-hover:-translate-y-3 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] group-hover:border-primary/20 group-hover:z-10">
                    {thumbnail ? (
                        <Image
                            src={thumbnail}
                            alt={title}
                            width={300}
                            height={450}
                            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-800 font-black italic tracking-tighter text-2xl uppercase">
                            M_MOVIES
                        </div>
                    )}

                    {/* Premium Badge */}
                    <div className="absolute top-3 left-3 z-20">
                        <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xl border border-white/10">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>Premium</span>
                        </div>
                    </div>

                    {/* Info Badge */}
                    <div className="absolute top-3 right-3 z-20">
                        <div className="rounded-lg bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                            {category}
                        </div>
                    </div>

                    {/* Hover Overlay Content */}
                    <div className="absolute inset-x-0 bottom-0 z-30 translate-y-full p-6 transition-transform duration-500 group-hover:translate-y-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl">
                                <PlayCircle className="h-6 w-6 fill-black" />
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors">
                                <Plus className="h-5 w-5" />
                            </div>
                        </div>

                        <h3 className="line-clamp-2 text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 leading-tight mb-2 italic tracking-tighter capitalize group-hover:scale-[1.02] transition-transform duration-500">
                            {title}
                        </h3>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                <div className="flex items-center gap-1 text-zinc-300">
                                    <Eye className="h-3 w-3" />
                                    <span>{formatViews(views)} Views</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{year}</span>
                                </div>
                            </div>

                            <div className="pt-1">
                                <StarRating movieId={id} initialRating={rating} />
                            </div>
                        </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* Regular Title (Visible when not hovered) */}
                <div className="mt-4 transition-opacity duration-300 group-hover:opacity-0 px-1">
                    <h3 className="truncate text-sm font-bold text-zinc-100 leading-tight capitalize tracking-tight">
                        {title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                            {category} • {year}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400">
                            <Eye className="h-2.5 w-2.5" />
                            <span>{formatViews(views)}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
