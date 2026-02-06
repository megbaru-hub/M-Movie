'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GifPickerProps {
    onSelect: (gifUrl: string) => void
    className?: string
}

// Curated high-quality movie/reaction GIFs as fallback
const FALLBACK_GIFS = [
    { id: '1', title: 'Popcorn Cinema', url: 'https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif' },
    { id: '2', title: 'Surprised', url: 'https://media.giphy.com/media/6nWhy3h2ScyMo/giphy.gif' },
    { id: '3', title: 'Applause', url: 'https://media.giphy.com/media/26hirEPeB7PZqzYMQ/giphy.gif' },
    { id: '4', title: 'Laughing', url: 'https://media.giphy.com/media/10JhviCqBVmw5G/giphy.gif' },
    { id: '5', title: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipLchakBUZiU/giphy.gif' },
    { id: '6', title: 'Minions Yay', url: 'https://media.giphy.com/media/LndtzYYuETtkc/giphy.gif' },
    { id: '7', title: 'Spider-Man Pointing', url: 'https://media.giphy.com/media/l36kU80xPf0ojG0EM/giphy.gif' },
    { id: '8', title: 'This is Fine', url: 'https://media.giphy.com/media/9M5jK4GXmD5o1irGrF/giphy.gif' }
]

export default function GifPicker({ onSelect, className }: GifPickerProps) {
    const [search, setSearch] = useState('')
    const [gifs, setGifs] = useState<any[]>(FALLBACK_GIFS)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Using a more reliable way to fetch or at least handle the ban
    const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC'

    useEffect(() => {
        fetchTrending()
    }, [])

    const fetchTrending = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`)
            if (!res.ok) throw new Error('API Key Limit Reached or Invalid')
            const { data } = await res.json()
            if (data && data.length > 0) {
                setGifs(data.map((g: any) => ({
                    id: g.id,
                    title: g.title,
                    url: g.images.fixed_height.url
                })))
            }
        } catch (err) {
            console.error('Giphy trending error:', err)
            setError('Using local curated collection (API limit reached)')
            setGifs(FALLBACK_GIFS)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (query: string) => {
        setSearch(query)
        if (!query.trim()) {
            fetchTrending()
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20&rating=g`)
            if (!res.ok) throw new Error('Search failed')
            const { data } = await res.json()
            if (data && data.length > 0) {
                setGifs(data.map((g: any) => ({
                    id: g.id,
                    title: g.title,
                    url: g.images.fixed_height.url
                })))
            } else {
                setGifs([])
            }
        } catch (err) {
            console.error('Giphy search error:', err)
            setError('Search unavailable - filtering local collection')
            setGifs(FALLBACK_GIFS.filter(g => g.title.toLowerCase().includes(query.toLowerCase())))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] w-[350px] h-[450px] overflow-hidden", className)}>
            {/* Search Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">GIF Library</h4>
                    {error && (
                        <div className="flex items-center gap-1 text-[8px] font-bold text-amber-500/80 uppercase tracking-wider">
                            <AlertCircle className="h-2.5 w-2.5" />
                            <span>Demo Mode</span>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search cinematic GIFs..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isLoading && gifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Connecting to Cinema...</p>
                    </div>
                ) : gifs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {gifs.map((gif) => (
                            <motion.button
                                key={gif.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(gif.url)}
                                className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-primary/50 transition-all group shadow-lg"
                            >
                                <img
                                    src={gif.url}
                                    alt={gif.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Handle broken image links
                                        (e.target as HTMLImageElement).parentElement?.remove()
                                    }}
                                />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] font-black text-white/50 uppercase tracking-tighter">GIF</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-30">
                        <Search className="h-10 w-10 text-zinc-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No scene found</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-black/40 flex items-center justify-between">
                <img src="https://raw.githubusercontent.com/Giphy/giphy-js/master/packages/components/src/assets/giphy-logo.png" alt="GIPHY" className="h-3 opacity-30 grayscale" />
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Premium Collection</span>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}
