'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import VideoPlayer from './VideoPlayer'

interface VideoPlayerClientProps {
    url: string
    title: string
    thumbnail?: string
    subtitleUrl?: string
    availableQualities?: number[]
    nextId?: number
    prevId?: number
    autoPlay?: boolean
}

export default function VideoPlayerClient({
    nextId,
    prevId,
    ...playerProps
}: VideoPlayerClientProps) {
    const router = useRouter()

    const handleNext = nextId ? () => {
        router.push(`/watch/${nextId}?autoplay=true`)
    } : undefined

    const handlePrev = prevId ? () => {
        router.push(`/watch/${prevId}?autoplay=true`)
    } : undefined

    return (
        <VideoPlayer
            {...playerProps}
            onNext={handleNext}
            onPrev={handlePrev}
        />
    )
}
