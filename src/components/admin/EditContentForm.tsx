'use client'

import React, { useState } from 'react'
import { Save, Film, Globe, Calendar, Loader2 } from 'lucide-react'
import { FILM_GENRES, MUSIC_GENRES, COUNTRIES, YEARS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Movie {
    id: number
    title: string
    category: string
    genre: string | null
    country: string | null
    year: string | null
}

import { useToast } from '../ui/ToastContext'

export default function EditContentForm({ movie }: { movie: Movie }) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: movie.title,
        genre: movie.genre || '',
        country: movie.country || '',
        year: movie.year || '',
    })

    const isMusic = movie.category === 'music'
    const currentGenres = isMusic ? MUSIC_GENRES : FILM_GENRES

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/admin/content?id=${movie.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast('Record Updated Successfully', 'success')
                setTimeout(() => {
                    window.location.href = '/admin/content'
                }, 1000)
            } else {
                const err = await res.json()
                toast(`Update Failed: ${err.error}`, 'error')
            }
        } catch (error) {
            toast('System Error occurred during update', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Metadata Integrity</h3>

                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Display Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Genre */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Genre Classification</label>
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

                        {/* Country */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Regional Origin</label>
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

                        {/* Year */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Release Era</label>
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
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-3"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSubmitting ? 'Synchronizing Archive...' : 'Commit Changes'}
                </button>
            </div>
        </form>
    )
}
