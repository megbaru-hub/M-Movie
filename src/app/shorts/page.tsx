'use client'

import { useEffect, useState } from 'react'
import ShortsPlayer from '@/components/video/ShortsPlayer'

interface Short {
    id: number
    title: string
    description: string | null
    channelName: string | null
    user: { name: string | null } | null
    userId: string | null
    views: string
    likeCount: number
    commentCount: number
    isLikedByCurrentUser: boolean
    isFollowedByCurrentUser: boolean
}

export default function ShortsPage() {
    const [shorts, setShorts] = useState<Short[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you')

    useEffect(() => {
        fetchShorts(activeTab)
    }, [activeTab])

    const fetchShorts = (tab: 'for-you' | 'following') => {
        setIsLoading(true)
        const url = tab === 'following' ? '/api/shorts?filter=following' : '/api/shorts'

        fetch(url, { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error(`Status ${res.status}`)
                return res.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setShorts(data)
                } else {
                    setShorts([])
                }
            })
            .catch(err => {
                console.error('Error fetching shorts:', err)
                setShorts([])
            })
            .finally(() => setIsLoading(false))
    }

    // Loading Screen
    if (isLoading && shorts.length === 0) {
        // Sync top offset with main container
        return (
            <div className="fixed inset-0 top-16 md:top-20 md:left-24 z-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
                <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center h-full text-white">
                        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
                        <p className="font-black uppercase tracking-[0.3em] text-xs">Loading {activeTab === 'following' ? 'Following' : 'For You'}...</p>
                    </div>
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 pointer-events-none">
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`text-xs font-black uppercase tracking-[0.2em] pointer-events-auto transition-colors ${activeTab === 'following' ? 'text-white border-b-2 border-primary pb-2' : 'text-white/50 hover:text-white'}`}
                    >
                        Following
                    </button>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <button
                        onClick={() => setActiveTab('for-you')}
                        className={`text-xs font-black uppercase tracking-[0.2em] pointer-events-auto transition-colors ${activeTab === 'for-you' ? 'text-white border-b-2 border-primary pb-2' : 'text-white/50 hover:text-white'}`}
                    >
                        For You
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 top-16 md:top-20 md:left-20 lg:left-72 z-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
            {/* Phone View Container */}
            <div className="h-full w-full flex items-center justify-center">
                <div className="relative h-full w-full max-w-md mx-auto bg-black shadow-2xl overflow-hidden">
                    {/* Header Tabs */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 pointer-events-none w-full justify-center">
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`text-xs font-black uppercase tracking-[0.2em] pointer-events-auto transition-all ${activeTab === 'following' ? 'text-white border-b-2 border-primary pb-2 scale-110' : 'text-white/60 hover:text-white'}`}
                        >
                            Following
                        </button>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <button
                            onClick={() => setActiveTab('for-you')}
                            className={`text-xs font-black uppercase tracking-[0.2em] pointer-events-auto transition-all ${activeTab === 'for-you' ? 'text-white border-b-2 border-primary pb-2 scale-110' : 'text-white/60 hover:text-white'}`}
                        >
                            For You
                        </button>
                    </div>

                    {/* Scrollable Shorts Container */}
                    <div
                        className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                        onScroll={(e) => {
                            const scrollTop = e.currentTarget.scrollTop
                            const height = e.currentTarget.offsetHeight
                            const newIndex = Math.round(scrollTop / height)
                            if (newIndex !== activeIndex) {
                                setActiveIndex(newIndex)
                            }
                        }}
                    >
                        {Array.isArray(shorts) && shorts.length > 0 ? (
                            shorts.map((short, index) => (
                                <div key={short.id} className="h-full w-full snap-center relative">
                                    <ShortsPlayer
                                        id={short.id}
                                        url={`/api/stream/shorts/${short.id}`}
                                        title={short.title}
                                        channel={short.user?.name || short.channelName || 'M-Movies Artist'}
                                        description={short.description || ''}
                                        isActive={index === activeIndex}
                                        initialLikeCount={short.likeCount || 0}
                                        initialCommentCount={short.commentCount || 0}
                                        initialIsLiked={short.isLikedByCurrentUser || false}
                                        creatorId={short.userId}
                                        initialIsFollowed={short.isFollowedByCurrentUser || false}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-600 bg-zinc-950 relative">
                                <div className="h-20 w-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6">
                                    <span className="text-4xl">🎞️</span>
                                </div>
                                <p className="font-black uppercase tracking-[0.3em] text-xs text-center px-8">
                                    {activeTab === 'following' ? 'No posts from people you follow.' : 'No shorts in the feed yet.'}
                                </p>
                                {activeTab === 'following' && (
                                    <button onClick={() => setActiveTab('for-you')} className="mt-4 text-[10px] text-primary hover:underline">
                                        Switch to For You
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
