'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface MovieReactionsProps {
    movieId: number
    initialLikes: number
    initialDislikes: number
    userReaction?: 'LIKE' | 'DISLIKE' | null
}

export default function MovieReactions({ movieId, initialLikes, initialDislikes, userReaction: initialUserReaction }: MovieReactionsProps) {
    const { data: session } = useSession()
    const [likes, setLikes] = useState(initialLikes)
    const [dislikes, setDislikes] = useState(initialDislikes)
    const [userReaction, setUserReaction] = useState<'LIKE' | 'DISLIKE' | null | undefined>(initialUserReaction)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
        if (!session) {
            // Optional: Redirect to login or show modal
            alert('Please sign in to react')
            return
        }

        if (isSubmitting) return

        const newType = userReaction === type ? null : type

        // Optimistic UI
        if (userReaction === 'LIKE') setLikes(prev => prev - 1)
        if (userReaction === 'DISLIKE') setDislikes(prev => prev - 1)

        if (newType === 'LIKE') setLikes(prev => prev + 1)
        if (newType === 'DISLIKE') setDislikes(prev => prev + 1)

        setUserReaction(newType)
        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/movies/${movieId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: newType })
            })

            if (!res.ok) throw new Error('Failed to react')

        } catch (error) {
            console.error('Reaction error:', error)
            // Revert optimistic UI
            setUserReaction(userReaction)
            setLikes(initialLikes)
            setDislikes(initialDislikes)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center bg-zinc-900/50 rounded-full border border-white/5 p-1">
            <button
                onClick={() => handleReaction('LIKE')}
                disabled={isSubmitting}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                    userReaction === 'LIKE'
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "hover:bg-white/5 text-zinc-400 hover:text-white"
                )}
            >
                <ThumbsUp className={cn("h-4 w-4", userReaction === 'LIKE' && "fill-white")} />
                <span className="text-xs font-black">{likes}</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
                onClick={() => handleReaction('DISLIKE')}
                disabled={isSubmitting}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                    userReaction === 'DISLIKE'
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-white/5 text-zinc-400 hover:text-white"
                )}
            >
                <ThumbsDown className={cn("h-4 w-4", userReaction === 'DISLIKE' && "fill-white")} />
                <span className="text-xs font-black">{dislikes}</span>
            </button>
        </div>
    )
}
