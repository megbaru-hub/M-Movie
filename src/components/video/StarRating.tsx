'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
    movieId: number
    initialRating?: number
    readOnly?: boolean
    onRate?: (rating: number) => void
    size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ movieId, initialRating = 0, readOnly = false, onRate, size = 'sm' }: StarRatingProps) {
    const [rating, setRating] = useState(initialRating)
    const [hover, setHover] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const sizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-6 w-6'
    }

    const handleRate = async (value: number) => {
        if (readOnly || isSubmitting) return

        setRating(value)
        setIsSubmitting(true)

        try {
            const res = await fetch('/api/movies/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieId, rating: value * 2 }) // scale 1-5 to 2-10
            })

            if (!res.ok) {
                // Optional: handle error
            } else {
                if (onRate) onRate(value * 2)
            }
        } catch (error) {
            console.error('Failed to rate:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly || isSubmitting}
                    className={cn(
                        "transition-all duration-200 focus:outline-none",
                        !readOnly && "hover:scale-125",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    onClick={(e) => {
                        e.preventDefault()
                        handleRate(star)
                    }}
                >
                    <Star
                        className={cn(
                            sizes[size],
                            (hover ? star <= hover : star <= Math.round(rating / 2))
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-zinc-600 fill-zinc-900"
                        )}
                    />
                </button>
            ))}
            {readOnly && rating > 0 && (
                <span className="ml-1.5 text-[10px] font-black text-zinc-500">{(rating).toFixed(1)}</span>
            )}
        </div>
    )
}
