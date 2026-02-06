'use client'

import React, { useEffect, useState } from 'react'
import { User, Mail, Shield, Check, X, Settings, Image as ImageIcon, Globe, Calendar, Edit3, Camera } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'

interface ProfileClientProps {
    id: string
}

interface UserProfile {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio: string | null
    createdAt: string
    _count: {
        shorts: number
        followedBy: number
        following: number
    }
    isFollowedByViewer: boolean
}

import { useToast } from '@/components/ui/ToastContext'

export default function ProfileClient({ id }: ProfileClientProps) {
    const { toast } = useToast()
    const { data: session } = useSession()
    const router = useRouter()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [shorts, setShorts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    const [editForm, setEditForm] = useState({
        name: '',
        username: '',
        bio: ''
    })

    const isOwner = session?.user && (session.user as any).id === id

    useEffect(() => {
        fetchProfile()
        fetchShorts()
    }, [id])

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users/${id}`)
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
                setEditForm({
                    name: data.name || '',
                    username: data.username || '',
                    bio: data.bio || ''
                })
            } else {
                const err = await res.json().catch(() => ({}))
                console.error('Profile fetch error:', res.status, err)
                if (res.status === 404) {
                    // Keep null -> User not found UI
                } else {
                    toast(`Error loading profile: ${err.error || res.statusText}`, 'error')
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast('Failed to reach neural network for profile data', 'error')
        }
    }

    const fetchShorts = async () => {
        try {
            // Using the new userId filter
            const res = await fetch(`/api/shorts?userId=${id}`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) setShorts(data)
            }
        } catch (error) {
            console.error('Error fetching user shorts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            })

            if (res.ok) {
                const updated = await res.json()
                setProfile(prev => prev ? { ...prev, ...updated } : null)
                setIsEditing(false)
                toast('Identity Matrix Updated', 'success')
            } else {
                const err = await res.json()
                toast(err.error || 'Identity update failed', 'error')
            }
        } catch (error) {
            console.error('Error updating:', error)
            toast('Critical failure during identity preservation', 'error')
        }
    }

    const handleFollow = async () => {
        if (!session) {
            router.push('/signin')
            return
        }

        const isFollowed = profile?.isFollowedByViewer
        // Optimistic
        setProfile(prev => prev ? {
            ...prev,
            isFollowedByViewer: !isFollowed,
            _count: {
                ...prev._count,
                followedBy: isFollowed ? prev._count.followedBy - 1 : prev._count.followedBy + 1
            }
        } : null)

        try {
            await fetch(`/api/users/${id}/follow`, { method: 'POST' })
            // Background re-fetch to ensure sync? Not really needed if optimistic works
        } catch (err) {
            // Revert
            setProfile(prev => prev ? {
                ...prev,
                isFollowedByViewer: !!isFollowed,
                _count: {
                    ...prev._count,
                    followedBy: isFollowed ? prev._count.followedBy : prev._count.followedBy // revert count
                }
            } : null)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>
    }

    if (!profile) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">User not found</div>
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8 lg:p-20 pt-20">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header Card */}
                <div className="relative rounded-[2.5rem] bg-zinc-900/50 border border-white/5 overflow-hidden p-8 md:p-12">
                    {/* Background blob */}
                    <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Avatar */}
                        {isOwner ? (
                            <ProfilePhotoUpload
                                currentImage={profile.image}
                                userId={id}
                                onUploadSuccess={(newImageUrl) => {
                                    setProfile(prev => prev ? { ...prev, image: newImageUrl } : null)
                                }}
                            />
                        ) : (
                            <div className="relative group shrink-0">
                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] bg-zinc-800 border-2 border-white/10 overflow-hidden shadow-2xl">
                                    {profile.image ? (
                                        <img src={profile.image} alt={profile.name || 'User'} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-white/20">
                                            {(profile.name?.[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Info & Actions */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    {isEditing ? (
                                        <div className="space-y-3 p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                                            <input
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="Display Name"
                                                className="bg-transparent text-2xl font-black text-white border-b border-white/20 focus:border-primary focus:outline-none w-full pb-1"
                                            />
                                            <div className="flex items-center gap-1 text-zinc-500">
                                                <span>@</span>
                                                <input
                                                    value={editForm.username}
                                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                                    placeholder="username"
                                                    className="bg-transparent text-sm font-bold border-b border-white/20 focus:border-primary focus:outline-none w-full"
                                                />
                                            </div>
                                            <textarea
                                                value={editForm.bio}
                                                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                                placeholder="Add a bio..."
                                                className="bg-zinc-900/50 w-full text-sm text-zinc-300 p-2 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                                rows={3}
                                            />
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={handleSave} className="px-4 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-500 flex items-center gap-2"><Check className="h-3 w-3" /> Save</button>
                                                <button onClick={() => setIsEditing(false)} className="px-4 py-1 bg-zinc-700 text-white rounded-lg text-xs font-bold hover:bg-zinc-600 flex items-center gap-2"><X className="h-3 w-3" /> Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{profile.name}</h1>
                                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">@{profile.username || 'user'}</p>
                                        </>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {!isEditing && (
                                    <div className="flex gap-3">
                                        {isOwner ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-6 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2"
                                            >
                                                <Edit3 className="h-4 w-4" /> Edit Profile
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleFollow}
                                                className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${profile.isFollowedByViewer
                                                    ? 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700'
                                                    : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                                                    }`}
                                            >
                                                {profile.isFollowedByViewer ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!isEditing && (
                                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-medium">
                                    {profile.bio || "No bio yet."}
                                </p>
                            )}

                            {/* Stats */}
                            {!isEditing && (
                                <div className="flex items-center gap-8 pt-4">
                                    <div className="text-center md:text-left">
                                        <span className="block text-xl font-black text-white">{profile._count.shorts}</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Shorts</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="block text-xl font-black text-white">{profile._count.followedBy}</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Followers</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="block text-xl font-black text-white">{profile._count.following}</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Following</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 pt-2">
                                <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shorts Grid */}
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-wider mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full" />
                        Shorts Library
                    </h2>

                    {shorts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {shorts.map(short => (
                                <Link href={`/shorts?userId=${id}&play=${short.id}`} key={short.id} className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                    <video src={`/api/stream/shorts/${short.id}`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <p className="text-white font-bold text-sm line-clamp-2">{short.title}</p>
                                        <p className="text-zinc-400 text-[10px] font-bold uppercase mt-1">{short.views} views</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 rounded-3xl border border-white/5 bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <Camera className="h-8 w-8" />
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No shorts uploaded yet.</p>
                            {isOwner && (
                                <Link href="/shorts/upload" className="btn-primary">Upload Your First Short</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
