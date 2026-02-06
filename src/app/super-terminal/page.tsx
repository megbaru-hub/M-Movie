'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Terminal, Lock, User, ShieldAlert, Cpu } from 'lucide-react'

export default function SuperTerminal() {
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
                body: JSON.stringify({ ...formData, portalType: 'SUPER' })
            })

            const data = await res.json()
            if (res.ok) {
                router.push('/admin')
            } else {
                setError(data.error || 'Authentication rejected')
            }
        } catch (err) {
            setError('System communication failure')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-mono">
            <div className="max-w-md w-full space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        <Cpu className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white uppercase tracking-[0.5em]">Nexus Terminal</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Level 0: Super-Administrator Access Only</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-white transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder=""
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-900 focus:outline-none focus:border-white/20 transition-all shadow-inner"
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-white transition-colors" />
                            <input
                                required
                                type="password"
                                placeholder=""
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-900 focus:outline-none focus:border-white/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full py-5 rounded-2xl bg-zinc-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.6em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Terminal className="h-4 w-4" />
                                Execute Auth
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            {error}
                        </p>
                    </div>
                )}

                <div className="flex justify-center border-t border-white/5 pt-12">
                    <div className="h-1 w-12 rounded-full bg-zinc-900" />
                </div>
            </div>
        </div>
    )
}
