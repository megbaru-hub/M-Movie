'use client'

import React from 'react'
import { Share2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
    movieId: number
    movieTitle: string
    variant?: 'icon' | 'labeled'
}

export default function ShareButton({ movieId, movieTitle, variant = 'labeled' }: ShareButtonProps) {
    const { toast } = useToast()

    const handleShare = async () => {
        const url = `${window.location.origin}/watch/${movieId}`
        const shareData = {
            title: movieTitle,
            text: `Check out ${movieTitle} on M-Movies!`,
            url: url
        }

        // Check if Web Share API is supported
        if (navigator.share) {
            try {
                await navigator.share(shareData)
                toast('Shared successfully!', 'success')
            } catch (error) {
                // User cancelled or error occurred
                if ((error as Error).name !== 'AbortError') {
                    // Fallback to clipboard
                    copyToClipboard(url)
                }
            }
        } else {
            // Fallback to clipboard
            copyToClipboard(url)
        }
    }

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            toast('Link copied to clipboard!', 'success')
        } catch (error) {
            toast('Failed to copy link', 'error')
        }
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                title="Share"
            >
                <Share2 className="h-4 w-4" />
            </button>
        )
    }

    return (
        <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 group transition-all"
        >
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-800 group-hover:text-white transition-all transform group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 stroke-current stroke-2">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
                Share
            </span>
        </button>
    )
}
