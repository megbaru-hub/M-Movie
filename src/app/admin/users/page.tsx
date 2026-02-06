'use client'

import React, { useState, useEffect } from 'react'
import {
    Users,
    UserPlus,
    ShieldCheck,
    Archive,
    Trash2,
    MoreVertical,
    Loader2,
    Plus,
    X,
    User,
    Lock
} from 'lucide-react'

interface AdminUser {
    id: string
    username: string
    name: string | null
    role: string
    createdAt: string
}

export default function UserDirectory() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '', name: '' })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/personnel')
            const data = await res.json()
            if (res.ok) setAdmins(data)
        } catch (err) {
            console.error('Failed to fetch admins')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            const res = await fetch('/api/admin/personnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin)
            })
            if (res.ok) {
                setIsAdding(false)
                setNewAdmin({ username: '', password: '', name: '' })
                fetchAdmins()
            } else {
                const data = await res.json()
                setError(data.error || 'Identity deployment failed')
            }
        } catch (err) {
            setError('System communication failure')
        }
    }

    return (
        <div className="space-y-12">
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Personnel Registry</h1>
                    <p className="text-zinc-500 font-medium">Manage administrative identities and access tiers.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-premium flex items-center gap-3"
                >
                    <UserPlus className="h-5 w-5" />
                    Enlist Personnel
                </button>
            </header>

            {/* Admin Table */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-zinc-900/50">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Administrator</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Security Tier</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Enlistment Date</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-800" />
                                </td>
                            </tr>
                        ) : admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group text-sm">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-primary">
                                            {admin.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{admin.name || admin.username}</p>
                                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">ID: {admin.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${admin.role === 'SUPER_ADMIN'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                        }`}>
                                        {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
                                        {admin.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-zinc-500 font-medium whitespace-nowrap">
                                    {new Date(admin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-zinc-700 hover:text-white transition-colors">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Personnel Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Enlist Agent</h2>
                            <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800" />
                                    <input
                                        required
                                        type="text"
                                        placeholder=""
                                        value={newAdmin.username}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                        className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800" />
                                    <input
                                        required
                                        type="password"
                                        placeholder=""
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Archive className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800" />
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={newAdmin.name}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-primary/40 transition-all"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest text-center">{error}</p>}

                            <button className="w-full py-5 rounded-[2rem] bg-white text-black text-[10px] font-black uppercase tracking-[.4em] hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5">
                                Initiate Enlistment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
