'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, MessageSquare, Reply, User, Smile, Image as ImageIcon, X, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import EmojiPicker from './EmojiPicker'
import GifPicker from './GifPicker'
import { AnimatePresence, motion } from 'framer-motion'

interface Comment {
    id: number
    text: string
    createdAt: string
    user: {
        name: string | null
        image: string | null
        username: string | null
    }
    replies?: Comment[]
    likes: number
    dislikes: number
    userReaction: 'LIKE' | 'DISLIKE' | null
}

interface MovieCommentsProps {
    movieId: number
}

export default function MovieComments({ movieId }: MovieCommentsProps) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showGifPicker, setShowGifPicker] = useState(false)
    const [selectedGif, setSelectedGif] = useState<string | null>(null)

    useEffect(() => {
        fetchComments()
    }, [movieId])

    const fetchComments = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/movies/${movieId}/comments`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error('Fetch comments error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.user || !newComment.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/movies/${movieId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newComment,
                    gifUrl: selectedGif
                })
            })

            if (res.ok) {
                const comment = await res.json()
                setComments(prev => [comment, ...prev])
                setNewComment('')
                setSelectedGif(null)
            }
        } catch (error) {
            console.error('Post comment error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReaction = async (commentId: number, type: 'LIKE' | 'DISLIKE') => {
        if (!session?.user) return

        // Optimistic update
        setComments(prev => {
            const updateReplies = (replies: Comment[]): Comment[] => {
                return replies.map(r => {
                    if (r.id === commentId) {
                        const newReaction = r.userReaction === type ? null : type
                        let newLikes = r.likes
                        let newDislikes = r.dislikes

                        if (r.userReaction === 'LIKE') newLikes--
                        if (r.userReaction === 'DISLIKE') newDislikes--

                        if (newReaction === 'LIKE') newLikes++
                        if (newReaction === 'DISLIKE') newDislikes++

                        return { ...r, likes: newLikes, dislikes: newDislikes, userReaction: newReaction }
                    }
                    return { ...r, replies: updateReplies(r.replies || []) }
                })
            }
            return updateReplies(prev)
        })

        try {
            await fetch(`/api/movies/comments/${commentId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: comments.find(c => c.id === commentId)?.userReaction === type ? null : type })
            })
        } catch (error) {
            console.error('Reaction error:', error)
            // Revert could be implemented here
        }
    }

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                        Discussion <span className="text-zinc-500 ml-2 font-medium not-italic">({comments.length})</span>
                    </h2>
                </div>
            </div>

            {/* Post Comment Form */}
            {session ? (
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex-shrink-0 overflow-hidden">
                        {session.user?.image ? (
                            <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-full w-full p-2 text-zinc-500" />
                        )}
                    </div>
                    <div className="flex-1 relative group/form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Join the conversation..."
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 pr-32 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors resize-none min-h-[100px]"
                        />
                        {selectedGif && (
                            <div className="absolute left-6 bottom-16 bg-zinc-950 p-1 rounded-xl border border-white/10 group/gifpre">
                                <img src={selectedGif} alt="GIF Preview" className="h-20 rounded-lg object-cover" />
                                <button
                                    onClick={() => setSelectedGif(null)}
                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover/gifpre:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowGifPicker(!showGifPicker)
                                    setShowEmojiPicker(false)
                                }}
                                className={cn(
                                    "p-2 rounded-xl transition-all hover:bg-white/5",
                                    showGifPicker ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={cn(
                                    "p-2 rounded-xl transition-all hover:bg-white/5",
                                    showEmojiPicker ? "text-primary bg-primary/10" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Smile className="h-4 w-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={(!newComment.trim() && !selectedGif) || isSubmitting}
                                className="bg-primary p-2 rounded-xl text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-110 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full right-0 mb-4 z-50"
                                >
                                    <EmojiPicker
                                        onSelect={(emoji) => {
                                            setNewComment(prev => prev + emoji)
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
                                    className="absolute bottom-full right-0 mb-4 z-50"
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
                    </div>
                </form>
            ) : (
                <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-center">
                    <p className="text-zinc-500 font-medium italic">Please sign in to join the discussion.</p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-10">
                {isLoading ? (
                    <div className="animate-pulse space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-900" />
                                <div className="flex-1 space-y-4 pt-2">
                                    <div className="h-3 w-32 bg-zinc-900 rounded" />
                                    <div className="h-3 w-full bg-zinc-900 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0">
                                {comment.user.image ? (
                                    <img src={comment.user.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-full w-full p-2 text-zinc-500" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-white text-xs tracking-tight uppercase">
                                        {comment.user.name || comment.user.username || 'Anonymous'}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {comment.text && <p className="text-zinc-400 text-sm leading-relaxed">{comment.text}</p>}
                                {(comment as any).gifUrl && (
                                    <div className="mt-2 rounded-2xl overflow-hidden max-w-sm border border-white/5">
                                        <img src={(comment as any).gifUrl} alt="Comment GIF" className="w-full h-auto" />
                                    </div>
                                )}
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1.5 border border-white/5">
                                        <button
                                            onClick={() => handleReaction(comment.id, 'LIKE')}
                                            className={cn(
                                                "flex items-center gap-1.5 transition-colors",
                                                comment.userReaction === 'LIKE' ? "text-primary" : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            <ThumbsUp className={cn("h-3.5 w-3.5", comment.userReaction === 'LIKE' && "fill-current")} />
                                            <span className="text-[10px] font-black">{comment.likes}</span>
                                        </button>
                                        <div className="w-[1px] h-3 bg-white/10" />
                                        <button
                                            onClick={() => handleReaction(comment.id, 'DISLIKE')}
                                            className={cn(
                                                "flex items-center gap-1.5 transition-colors",
                                                comment.userReaction === 'DISLIKE' ? "text-rose-500" : "text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            <ThumbsDown className={cn("h-3.5 w-3.5", comment.userReaction === 'DISLIKE' && "fill-current")} />
                                            <span className="text-[10px] font-black">{comment.dislikes}</span>
                                        </button>
                                    </div>

                                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors">
                                        <Reply className="h-3 w-3" />
                                        Reply
                                    </button>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-6 pl-4 border-l border-white/5 space-y-6">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="flex gap-4">
                                                <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0">
                                                    {reply.user.image ? (
                                                        <img src={reply.user.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-full w-full p-2 text-zinc-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-white text-[10px] tracking-tight uppercase">
                                                            {reply.user.name || reply.user.username || 'Anonymous'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">
                                                            {new Date(reply.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-400 text-sm leading-relaxed">{reply.text}</p>
                                                    <div className="flex items-center gap-4 pt-2">
                                                        <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1.5 border border-white/5">
                                                            <button
                                                                onClick={() => handleReaction(reply.id, 'LIKE')}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 transition-colors",
                                                                    reply.userReaction === 'LIKE' ? "text-primary" : "text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                <ThumbsUp className={cn("h-3 w-3", reply.userReaction === 'LIKE' && "fill-current")} />
                                                                <span className="text-[10px] font-black">{reply.likes}</span>
                                                            </button>
                                                            <div className="w-[1px] h-3 bg-white/10" />
                                                            <button
                                                                onClick={() => handleReaction(reply.id, 'DISLIKE')}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 transition-colors",
                                                                    reply.userReaction === 'DISLIKE' ? "text-rose-500" : "text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                <ThumbsDown className={cn("h-3 w-3", reply.userReaction === 'DISLIKE' && "fill-current")} />
                                                                <span className="text-[10px] font-black">{reply.dislikes}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-10" />
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Silence is golden.</p>
                        <p className="text-[10px] font-bold mt-2 uppercase text-zinc-800">Be the first to break it.</p>
                    </div>
                )}
            </div>
        </section>
    )
}
