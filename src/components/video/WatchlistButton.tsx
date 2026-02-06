'use client'

import React, { useState } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { useToast } from '../ui/ToastContext'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface WatchlistButtonProps {
    movieId: number
    initialIsAdded: boolean
    variant?: 'icon' | 'labeled'
}

export default function WatchlistButton({ movieId, initialIsAdded, variant = 'labeled' }: WatchlistButtonProps) {
    const [isAdded, setIsAdded] = useState(initialIsAdded)
    const [isPending, setIsPending] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const toggleWatchlist = async () => {
        setIsPending(true)
        try {
            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieId })
            })

            if (res.status === 401) {
                router.push('/signin')
                return
            }

            if (res.ok) {
                const data = await res.json()
                setIsAdded(data.added)
                toast(
                    data.added
                        ? 'Added to your archive collection'
                        : 'Removed from your archive collection',
                    'success'
                )
            } else {
                toast('Failed to update watchlist', 'error')
            }
        } catch (error) {
            toast('Archive synchronization failure', 'error')
        } finally {
            setIsPending(false)
        }
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={toggleWatchlist}
                disabled={isPending}
                className={cn(
                    "h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all",
                    isAdded ? "text-primary border-primary/20 bg-primary/5" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
        )
    }

    return (
        <button
            onClick={toggleWatchlist}
            disabled={isPending}
            className="flex flex-col items-center gap-2 group transition-all"
        >
            <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all transform group-hover:scale-110",
                isAdded
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-white"
            )}>
                {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : isAdded ? <Check className="h-6 w-6 animate-spin-once" /> : <Plus className="h-6 w-6" />}
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                isAdded ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
            )}>
                {isAdded ? 'Added' : 'My List'}
            </span>
        </button>
    )
}
