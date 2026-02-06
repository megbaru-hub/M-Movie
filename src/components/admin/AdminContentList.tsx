'use client'

import React, { useState } from 'react'
import { Search, Filter, MoreVertical, Edit2, Trash2, ExternalLink, Film, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useToast } from '../ui/ToastContext'
import ConfirmModal from '../ui/ConfirmModal'

interface Movie {
    id: number
    title: string
    category: string
    genre: string | null
    country: string | null
    year: string | null
    thumbnail: string | null
    uploaderId: string | null
}

interface AdminContentListProps {
    initialMovies: Movie[]
    role: 'SUPER_ADMIN' | 'CONTENT_ADMIN'
    userId: string
}

export default function AdminContentList({ initialMovies, role, userId }: AdminContentListProps) {
    const [movies, setMovies] = useState<Movie[]>(initialMovies)
    const [searchQuery, setSearchQuery] = useState('')
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, movieId: number | null }>({
        isOpen: false,
        movieId: null
    })

    const { toast } = useToast()

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.id.toString().includes(searchQuery)
    )

    const handleDelete = async (id: number) => {
        setIsDeleting(id)
        try {
            const res = await fetch(`/api/admin/content?id=${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setMovies(prev => prev.filter(m => m.id !== id))
                toast('Record purged from the archive successfully', 'success')
            } else {
                const err = await res.json()
                toast(`Purge failed: ${err.error}`, 'error')
            }
        } catch (error) {
            toast('System communication failure', 'error')
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-md">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, category, or ID..."
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:text-white transition-all">
                        <Filter className="h-4 w-4" />
                        Status: Active
                    </button>
                    <button className="px-8 py-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:text-white transition-all">
                        Sort: Newest
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-[3rem] bg-zinc-900/20 border border-white/5 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-zinc-900/40">
                            <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Archive Title</th>
                            <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Category</th>
                            <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Metadata</th>
                            <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-zinc-600">Ownership</th>
                            <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-widest text-zinc-600">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredMovies.map((movie) => (
                            <tr key={movie.id} className="group hover:bg-white/5 transition-all">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-24 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden shrink-0 shadow-2xl relative flex items-center justify-center">
                                            {movie.thumbnail ? (
                                                <>
                                                    <img
                                                        src={movie.thumbnail}
                                                        className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                </>
                                            ) : (
                                                <Film className="h-6 w-6 text-zinc-900" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{movie.title}</p>
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">ID: MM-{movie.id.toString().padStart(4, '0')}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white italic">{movie.category}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Global License</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-bold text-zinc-400">{movie.genre || 'General'}</p>
                                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{movie.country || 'Universal'} • {movie.year || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full shadow-[0_0_8px]",
                                            movie.uploaderId === userId ? "bg-primary shadow-primary/50" :
                                                !movie.uploaderId ? "bg-emerald-500 shadow-emerald-500/50" :
                                                    "bg-zinc-600 shadow-zinc-600/50"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            movie.uploaderId === userId ? "text-primary" :
                                                !movie.uploaderId ? "text-emerald-500" :
                                                    "text-zinc-600"
                                        )}>
                                            {movie.uploaderId === userId ? 'Own Record' :
                                                !movie.uploaderId ? 'System Archive' : 'Global Source'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/watch/${movie.id}`} target="_blank" title="View Record" className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>

                                        {/* Edit/Delete visibility: Only Owner or Super Admin */}
                                        {(role?.toUpperCase() === 'SUPER_ADMIN' || movie.uploaderId === userId) && (
                                            <>
                                                <Link href={`/admin/content/${movie.id}/edit`} title="Edit Integrity" className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, movieId: movie.id })}
                                                    disabled={isDeleting === movie.id}
                                                    title="Purge Record"
                                                    className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-rose-900/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                                                >
                                                    {isDeleting === movie.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <button className="group-hover:hidden text-zinc-700">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMovies.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5">
                            <Film className="h-8 w-8 text-zinc-800" />
                        </div>
                        <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No matching records found in the archive</p>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Confirm Data Purge"
                message="Are you sure you want to permanently erase this record from the central archive? This action cannot be reversed."
                confirmLabel="Purge Record"
                variant="destructive"
                onConfirm={() => deleteModal.movieId && handleDelete(deleteModal.movieId)}
                onCancel={() => setDeleteModal({ isOpen: false, movieId: null })}
            />
        </div>
    )
}
