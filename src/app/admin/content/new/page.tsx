'use client'

import React, { useState } from 'react'
import { Upload, Film, Tv, Music, Clapperboard, Layers, Calendar, Globe, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

// Configuration Options
const CATEGORIES = [
    { id: 'movie', label: 'Movie', icon: Film },
    { id: 'tvseries', label: 'TV Series', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Clapperboard },
    { id: 'music', label: 'Music', icon: Music },
]

import { FILM_GENRES, MUSIC_GENRES, COUNTRIES, YEARS } from '@/lib/constants'
import { useToast } from '@/components/ui/ToastContext'

export default function NewContentPage() {
    const { toast } = useToast()
    const [category, setCategory] = useState('movie')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        country: '',
        year: '',
        season: '',
        episode: '',
    })
    // File State
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [subtitleFile, setSubtitleFile] = useState<File | null>(null)

    const isSeries = category === 'tvseries' || category === 'anime'
    const isMusic = category === 'music'

    const currentGenres = isMusic ? MUSIC_GENRES : FILM_GENRES

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Build FormData
            const data = new FormData()
            data.append('title', formData.title)
            data.append('category', category)
            if (formData.genre) data.append('genre', formData.genre)
            if (formData.country) data.append('country', formData.country)
            if (formData.year) data.append('year', formData.year)
            if (isSeries && formData.season) data.append('season', formData.season)
            if (isSeries && formData.episode) data.append('episode', formData.episode)

            // Append Files
            if (videoFile) data.append('videoFile', videoFile)
            if (thumbnailFile) data.append('thumbnailFile', thumbnailFile)
            if (subtitleFile) data.append('subtitleFile', subtitleFile)

            const res = await fetch('/api/admin/content', {
                method: 'POST',
                // No Content-Type header needed for FormData
                body: data
            })

            if (res.ok) {
                toast('Content Deployed Successfully', 'success')
                setTimeout(() => {
                    window.location.href = '/admin/content'
                }, 1000)
            } else {
                const err = await res.json()
                toast(`Deployment Failed: ${err.error || 'Unknown Error'}`, 'error')
            }
        } catch (error) {
            console.error(error)
            toast('System Error occurred during deployment', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 mb-24">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Content Deployment</h1>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Initialize New Media Injection</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Category Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => {
                        const isSelected = category === cat.id
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setCategory(cat.id)
                                    setFormData(prev => ({ ...prev, genre: '' }))
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                                    isSelected
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-zinc-900/50 text-zinc-500 border-white/5 hover:bg-zinc-900 hover:text-white"
                                )}
                            >
                                <cat.icon className="h-6 w-6" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Main Metadata */}
                <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-8">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Core Metadata</h3>

                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Content Title</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={isSeries ? "Series Name (e.g. Breaking Bad)" : "Title"}
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>

                        {/* Series Details - Conditional */}
                        {isSeries && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest pl-2">
                                        <Layers className="h-3 w-3" /> Season Number
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={formData.season}
                                        onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                        placeholder="e.g. 1"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest pl-2">
                                        <Hash className="h-3 w-3" /> Episode Number
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={formData.episode}
                                        onChange={(e) => setFormData({ ...formData, episode: e.target.value })}
                                        placeholder="e.g. 1"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Dropdowns (Genre, Country, Year) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Genre */}
                            {category !== 'anime' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">
                                        {isMusic ? 'Music Genre' : 'Film Genre'}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.genre}
                                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                            className="w-full appearance-none bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="">Select Genre</option>
                                            {currentGenres.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Film className="h-3 w-3 text-zinc-600" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Country */}
                            {category !== 'music' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Country</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full appearance-none bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="">Select Country</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Globe className="h-3 w-3 text-zinc-600" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Year */}
                            {category !== 'music' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Year</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full appearance-none bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="">Select Year</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Calendar className="h-3 w-3 text-zinc-600" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* File Upload (REAL) */}
                <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Source Files</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Video File</label>
                            <input
                                required
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Thumbnail Image</label>
                            <input
                                required
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Subtitle File (.vtt, .srt)</label>
                            <input
                                type="file"
                                accept=".vtt,.srt"
                                onChange={(e) => setSubtitleFile(e.target.files?.[0] || null)}
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8">
                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="px-8 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Uploading & Deploying...' : 'Initiate Deployment'}
                    </button>
                </div>
            </form>
        </div>
    )
}
