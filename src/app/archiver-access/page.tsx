'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Lock, User, ShieldAlert, Archive } from 'lucide-react'

export default function ArchiverAccess() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/admin/authorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, portalType: 'CONTENT' })
            })

            const data = await res.json()
            if (res.ok) {
                router.push('/admin')
            } else {
                setError(data.error || 'Identity verification failed')
            }
        } catch (err) {
            setError('Vault connectivity failure')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full space-y-10">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-zinc-900/50 border border-emerald-500/10 shadow-[0_20px_40px_rgba(16,185,129,0.05)]">
                        <Archive className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Archiver Access</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Secure Content Management Gateway</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder=""
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-zinc-950/50 border border-white/5 rounded-[2rem] py-6 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                            <input
                                required
                                type="password"
                                placeholder=""
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-zinc-950/50 border border-white/5 rounded-[2rem] py-6 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full py-6 rounded-[2.5rem] bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.5em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-emerald-500/20"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Database className="h-4 w-4" />
                                Unlock Vault
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="p-5 rounded-[1.5rem] border border-rose-500/10 bg-rose-500/5 text-rose-500 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            {error}
                        </p>
                    </div>
                )}

                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-800">Protected by M-Movies Secure Encryption</p>
                </div>
            </div>
        </div>
    )
}
