'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Music, X, Send, CornerDownRight, Smile, Image as ImageIcon } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import GifPicker from './GifPicker'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ShortsPlayerProps {
    id: number
    url: string
    title: string
    channel: string
    description?: string
    isActive: boolean
    initialLikeCount?: number
    initialCommentCount?: number
    initialIsLiked?: boolean
    creatorId: string | null
    initialIsFollowed?: boolean
}

interface Comment {
    id: number
    text: string
    createdAt: string
    user: {
        name: string | null
        image: string | null
        username: string | null
    }
    likeCount: number
    isLiked: boolean
    replies: Comment[]
    replyCount: number
}

import { useToast } from '../ui/ToastContext'

export default function ShortsPlayer({
    id,
    url,
    title,
    channel,
    description,
    isActive,
    initialLikeCount = 0,
    initialCommentCount = 0,
    initialIsLiked = false,
    creatorId,
    initialIsFollowed = false
}: ShortsPlayerProps) {
    const { toast } = useToast()
    const { data: session } = useSession()
    const router = useRouter()

    // Engagement State
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [commentCountDisplay, setCommentCountDisplay] = useState(initialCommentCount)
    const [isFollowed, setIsFollowed] = useState(initialIsFollowed)

    // Player State
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    // View Counting State
    const [hasViewed, setHasViewed] = useState(false)

    // Comment UI State
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showGifPicker, setShowGifPicker] = useState(false)
    const [selectedGif, setSelectedGif] = useState<string | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // View Counting Logic (5s threshold)
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isActive && isPlaying && !hasViewed) {
            timer = setTimeout(() => {
                fetch(`/api/shorts/${id}/view`, { method: 'POST' }).catch(err => console.error('Error counting view:', err))
                setHasViewed(true)
                // console.log(`View counted for short ${id}`)
            }, 5000)
        }

        return () => clearTimeout(timer)
    }, [isActive, isPlaying, hasViewed, id])

    // Fetch comments when overlay opens
    useEffect(() => {
        if (showComments) {
            fetchComments()
        }
    }, [showComments])

    const fetchComments = async () => {
        setIsLoadingComments(true)
        try {
            const res = await fetch(`/api/shorts/${id}/comments`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
        } finally {
            setIsLoadingComments(false)
        }
    }

    const handlePostComment = async () => {
        if (!session) {
            router.push('/signin')
            return
        }
        if (!commentText.trim()) return

        try {
            const body: any = { text: commentText }
            if (replyingTo) {
                body.parentId = replyingTo.id
            }

            const res = await fetch(`/api/shorts/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: commentText,
                    parentId: replyingTo?.id || null,
                    gifUrl: selectedGif
                })
            })

            if (res.ok) {
                const newComment = await res.json()

                if (replyingTo) {
                    setComments(prevComments => prevComments.map(c => {
                        if (c.id === replyingTo.id) {
                            return {
                                ...c,
                                replies: [...c.replies, newComment],
                                replyCount: c.replyCount + 1
                            }
                        }
                        return c
                    }))
                } else {
                    setComments([newComment, ...comments])
                    setCommentCountDisplay(prev => prev + 1)
                }

                setCommentText('')
                setReplyingTo(null)
                setSelectedGif(null)
            }
        } catch (error) {
            console.error('Error posting comment:', error)
        }
    }

    const handleReplyClick = (comment: Comment) => {
        setReplyingTo(comment)
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const handleLikeComment = async (commentId: number, currentLiked: boolean) => {
        if (!session) {
            router.push('/signin')
            return
        }

        const updateLikeState = (list: Comment[]): Comment[] => {
            return list.map(c => {
                if (c.id === commentId) {
                    return { ...c, isLiked: !currentLiked, likeCount: currentLiked ? c.likeCount - 1 : c.likeCount + 1 }
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateLikeState(c.replies) }
                }
                return c
            })
        }
        setComments(updateLikeState(comments))

        try {
            await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })
        } catch (error) {
            console.error('Error liking comment', error)
        }
    }

    const handleFollow = async () => {
        if (!session) {
            router.push('/signin')
            return
        }
        if (!creatorId) return

        const newIsFollowed = !isFollowed
        setIsFollowed(newIsFollowed)

        try {
            const res = await fetch(`/api/users/${creatorId}/follow`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed')

            const data = await res.json()
            if (data.following !== undefined) setIsFollowed(data.following)
        } catch (error) {
            console.error('Error toggling follow:', error)
            setIsFollowed(!newIsFollowed)
            if (error instanceof Error && error.message === 'Cannot follow yourself') {
                toast("Self-Following not permitted", 'error')
            }
        }
    }

    const handleLike = async () => {
        if (!session) {
            router.push('/signin')
            return
        }

        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1)

        try {
            const res = await fetch(`/api/shorts/${id}/like`, { method: 'POST' })
            if (res.status === 401) {
                router.push('/signin')
                throw new Error('Unauthorized')
            }
            if (!res.ok) throw new Error('Failed')

            const data = await res.json()
            if (data.liked !== undefined) setIsLiked(data.liked)
        } catch (error) {
            console.error('Error liking short:', error)
            if (error instanceof Error && error.message !== 'Unauthorized') {
                setIsLiked(!newIsLiked)
                setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1)
            }
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Watch this short by ${channel}: ${title}`,
                    url: window.location.href
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast('Share link copied to clipboard', 'success')
        }
    }

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0
            setCurrentTime(0)
            setIsPlaying(true)
        } else if (!isActive) {
            setIsPlaying(false)
            setShowComments(false)
        }
    }, [isActive])

    useEffect(() => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.play().catch(console.error)
        } else {
            videoRef.current.pause()
        }
    }, [isPlaying])

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying)
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setIsMuted(videoRef.current.muted)
        }
    }

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(video.currentTime)
            }
        }
        const handleLoadedMetadata = () => {
            setDuration(video.duration)
        }
        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [isDragging])

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !videoRef.current) return
        const rect = progressBarRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const newTime = percentage * duration
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const handleProgressBarDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !progressBarRef.current || !videoRef.current) return
        const rect = progressBarRef.current.getBoundingClientRect()
        const percentage = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width
        const newTime = percentage * duration
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0
    const isOwner = session?.user && (session.user as any).id === creatorId

    const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
        <div className={`flex gap-3 ${isReply ? 'mt-3 pl-2' : ''}`}>
            {/* User Avatar */}
            <div className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden`}>
                {comment.user.image ? (
                    <img src={comment.user.image} alt={comment.user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white/50">
                        {(comment.user.name?.[0] || 'U').toUpperCase()}
                    </div>
                )}
            </div>
            {/* Content */}
            <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                    <span className={`font-semibold text-white/90 ${isReply ? 'text-xs' : 'text-sm'}`}>
                        @{comment.user.username || comment.user.name?.replace(/\s+/g, '').toLowerCase() || 'user'}
                    </span>
                    <span className="text-[10px] text-white/40">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p className={`text-white leading-snug ${isReply ? 'text-xs' : 'text-sm'}`}>{comment.text}</p>
                {(comment as any).gifUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden max-w-[200px] border border-white/10 shadow-lg">
                        <img src={(comment as any).gifUrl} alt="GIF" className="w-full h-auto" />
                    </div>
                )}

                {/* Comment Actions */}
                <div className="flex items-center gap-4 pt-1">
                    <button
                        onClick={() => handleLikeComment(comment.id, comment.isLiked)}
                        className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${comment.isLiked ? 'text-rose-500' : 'text-white/50 hover:text-white'}`}
                    >
                        <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likeCount || 0}</span>
                    </button>
                    {!isReply && (
                        <button
                            onClick={() => handleReplyClick(comment)}
                            className="text-[10px] font-medium text-white/50 hover:text-white transition-colors"
                        >
                            Reply
                        </button>
                    )}
                </div>

                {/* Render Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-0 pl-2 border-l border-white/10">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <div ref={containerRef} className="relative h-full w-full bg-black flex items-center justify-center group overflow-hidden touch-none">
            {/* Background Blurr Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
                <video
                    src={url}
                    loop
                    muted
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover blur-3xl scale-110"
                />
            </div>

            {/* The Main Video Layer */}
            <div className="absolute inset-0 z-0 flex items-center justify-center" onClick={togglePlayPause}>
                <video
                    ref={videoRef}
                    src={url}
                    loop
                    muted={isMuted}
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain max-h-full"
                />
            </div>

            {/* Play/Pause Overlay Indicator */}
            <AnimatePresence>
                {!isPlaying && !showComments && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 pointer-events-none"
                    >
                        <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center pl-2 shadow-2xl border border-white/30">
                            <svg viewBox="0 0 24 24" fill="white" className="h-12 w-12"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mute/Unmute Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    toggleMute()
                }}
                className="absolute top-6 right-6 z-20 h-11 w-11 rounded-full backdrop-blur-xl bg-black/20 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
            >
                {isMuted ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                )}
            </button>

            {/* Right Action Sidebar - Positioned much higher */}
            <div className={`absolute right-3 bottom-0 top-0 flex flex-col justify-center gap-6 items-center z-20 pointer-events-none transition-opacity duration-300 ${showComments ? 'opacity-0' : 'opacity-100'}`}>
                <div className="pointer-events-auto mt-auto mb-40 flex flex-col gap-5">
                    {/* LIKE BUTTON */}
                    <div className="flex flex-col items-center gap-1 group/action">
                        <button
                            onClick={handleLike}
                            className={`h-12 w-12 rounded-full backdrop-blur-md border transition-all shadow-lg hover:scale-110 ${isLiked ? 'bg-gradient-to-tr from-primary to-rose-600 text-white border-white/30 shadow-primary/50' : 'bg-black/20 text-white border-white/20 hover:bg-white/20'}`}
                        >
                            <Heart className={`h-6 w-6 mx-auto ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-[10px] font-bold tracking-wide text-white drop-shadow-lg">{likeCount}</span>
                    </div>

                    {/* COMMENT BUTTON */}
                    <div className="flex flex-col items-center gap-1 group/action">
                        <button
                            onClick={() => setShowComments(true)}
                            className="h-12 w-12 rounded-full backdrop-blur-md bg-black/20 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
                        >
                            <MessageCircle className="h-6 w-6" />
                        </button>
                        <span className="text-[10px] font-bold tracking-wide text-white drop-shadow-lg">{commentCountDisplay}</span>
                    </div>

                    {/* SHARE BUTTON */}
                    <div className="flex flex-col items-center gap-1 group/action">
                        <button
                            onClick={handleShare}
                            className="h-12 w-12 rounded-full backdrop-blur-md bg-black/20 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
                        >
                            <Share2 className="h-6 w-6" />
                        </button>
                        <span className="text-[10px] font-bold tracking-wide text-white drop-shadow-lg">Share</span>
                    </div>

                    <button className="h-12 w-12 rounded-full backdrop-blur-md bg-black/20 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 group/action transition-all shadow-lg">
                        <MoreVertical className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Bottom Content Info */}
            <div className={`absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-16 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 ${showComments ? 'opacity-0' : 'opacity-100'}`}>
                <div className="space-y-1.5 max-w-[75%] pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            onClick={() => creatorId && router.push(`/profile/${creatorId}`)}
                            className="flex items-center gap-2 cursor-pointer group/profile"
                        >
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-rose-600 p-[1.5px] shadow-md group-hover/profile:scale-110 transition-transform">
                                <div className="h-full w-full rounded-[6px] bg-zinc-950 flex items-center justify-center font-black text-[10px] text-white">M</div>
                            </div>
                            <h3 className="text-white font-bold tracking-tight text-sm drop-shadow-md truncate group-hover/profile:underline decoration-primary decoration-2 underline-offset-4">@{channel}</h3>
                        </div>

                        {/* FOLLOW BUTTON */}
                        {!isOwner && creatorId && (
                            <button
                                onClick={handleFollow}
                                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isFollowed
                                    ? 'bg-zinc-800 text-white/70 border border-white/20'
                                    : 'bg-white/90 text-black hover:bg-primary hover:text-white'
                                    }`}
                            >
                                {isFollowed ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    <p className="text-xs font-medium text-white/90 leading-snug line-clamp-2 drop-shadow-md">
                        {description || title}
                    </p>

                    <div className="flex gap-1 flex-wrap">
                        <span className="text-[10px] font-bold text-primary drop-shadow-md">#Movies</span>
                        <span className="text-[10px] font-bold text-white/70 drop-shadow-md">#Cinematic</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 pt-1">
                        <Music className="h-3 w-3 animate-spin-slow" />
                        <span className="text-[9px] font-bold tracking-wide uppercase drop-shadow-md truncate">Original Sound - M-Movies Anthology</span>
                    </div>
                </div>
            </div>

            {/* COMMENTS OVERLAY */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute inset-x-0 bottom-0 h-[70%] bg-zinc-950 rounded-t-3xl z-40 flex flex-col border-t border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="font-bold text-white">Comments ({commentCountDisplay})</h3>
                            <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="h-5 w-5 text-white/70" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {isLoadingComments ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))
                            ) : (
                                <div className="text-center py-10 text-white/40 text-sm">
                                    <p>Be the first to comment on this video!</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-zinc-900/50 relative">
                            {/* Reply Indicator */}
                            {replyingTo && (
                                <div className="flex items-center justify-between px-2 pb-2 text-xs text-white/60">
                                    <span>Replying to <span className="text-primary">@{replyingTo.user.username || 'user'}</span></span>
                                    <button onClick={() => setReplyingTo(null)}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-4 mb-4 z-50"
                                    >
                                        <EmojiPicker
                                            onSelect={(emoji) => {
                                                setCommentText(prev => prev + emoji)
                                                setShowEmojiPicker(false)
                                            }}
                                        />
                                    </motion.div>
                                )}
                                {showGifPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-4 mb-4 z-50"
                                    >
                                        <GifPicker
                                            onSelect={(gifUrl) => {
                                                setSelectedGif(gifUrl)
                                                setShowGifPicker(false)
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {selectedGif && (
                                <div className="absolute left-4 bottom-16 bg-zinc-950 p-1 rounded-xl border border-white/10 group/gifpre">
                                    <img src={selectedGif} alt="GIF Preview" className="h-16 rounded-lg object-cover" />
                                    <button
                                        onClick={() => setSelectedGif(null)}
                                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-100 shadow-md"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            <form
                                className="flex gap-2 items-center"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handlePostComment()
                                }}
                            >
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-full pl-4 pr-20 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowGifPicker(!showGifPicker)
                                                setShowEmojiPicker(false)
                                            }}
                                            className={cn(
                                                "p-1.5 rounded-full transition-all",
                                                showGifPicker ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEmojiPicker(!showEmojiPicker)
                                                setShowGifPicker(false)
                                            }}
                                            className={cn(
                                                "p-1.5 rounded-full transition-all",
                                                showEmojiPicker ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            <Smile className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!commentText.trim() && !selectedGif)}
                                    className="p-2 bg-primary rounded-full text-white hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay Dimmer when comments open */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowComments(false)}
                        className="absolute inset-0 bg-black/60 z-30"
                    />
                )}
            </AnimatePresence>

            {/* Interactive Progress Bar */}
            <div className={`absolute bottom-0 left-0 right-0 z-30 pb-0 transition-opacity duration-300 ${showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Time Display */}
                <div className="px-3 pb-1 flex items-center justify-between text-white text-[10px] font-bold drop-shadow-lg">
                    <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{formatTime(currentTime)}</span>
                    <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{formatTime(duration)}</span>
                </div>

                {/* Progress Bar */}
                <div
                    ref={progressBarRef}
                    className="relative h-1 bg-white/20 cursor-pointer group/progress"
                    onClick={handleProgressBarClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleProgressBarDrag}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-rose-500 to-primary transition-all"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity border-2 border-primary" />
                    </div>
                </div>
            </div>
        </div>
    )
}
