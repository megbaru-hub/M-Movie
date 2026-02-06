'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    Upload,
    Film,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Video
} from 'lucide-react'
import Link from 'next/link'

export default function ShortsUploadPage() {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null as File | null
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('video/')) {
                setError('Please select a valid video file')
                return
            }
            setFormData({ ...formData, file })
            setError(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            if (!formData.file) {
                setError('Please select a video file')
                setIsUploading(false)
                return
            }

            const data = new FormData()
            data.append('file', formData.file)
            data.append('title', formData.title)
            data.append('description', formData.description)

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90))
            }, 200)

            const res = await fetch('/api/shorts/upload', {
                method: 'POST',
                body: data
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => router.push('/shorts'), 2000)
            } else {
                const data = await res.json()
                setError(data.error || 'Upload failed')
            }
        } catch (err) {
            setError('Upload failed. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Short Uploaded!</h2>
                    <p className="text-zinc-500 font-medium">Your short is now live. Redirecting to feed...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-12">
            <header className="flex items-center justify-between">
                <div className="space-y-4">
                    <Link href="/shorts" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Shorts
                    </Link>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Upload Short</h1>
                    <p className="text-zinc-500 font-medium">Share your creative moment with the world</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 shadow-2xl">
                    <Video className="h-8 w-8" />
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Video Upload Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Video File</h2>
                    </div>

                    <div className="relative group">
                        <input
                            type="file"
                            id="video-upload"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                        />
                        <label
                            htmlFor="video-upload"
                            className="relative block w-full p-12 rounded-3xl border-2 border-dashed border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-primary/30 transition-all cursor-pointer"
                        >
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 group-hover:text-primary transition-colors">
                                    <Upload className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-white uppercase tracking-wider">
                                        {formData.file ? formData.file.name : 'Click to upload video'}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                        MP4, WebM, or AVI • Max 500MB
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Video Details Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Details</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-4">Title</label>
                            <input
                                required
                                type="text"
                                placeholder="Give your short a catchy title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-primary/40 transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block px-4">Description (Optional)</label>
                            <textarea
                                placeholder="Tell viewers what your short is about..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-primary/40 transition-all shadow-inner resize-none"
                            />
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 flex items-center gap-4 text-rose-500">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {isUploading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-rose-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="pt-12">
                    <button
                        disabled={isUploading}
                        className="w-full py-6 rounded-[2.5rem] bg-white text-black text-xs font-black uppercase tracking-[0.5em] hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Upload className="h-5 w-5" />
                                Upload Short
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
