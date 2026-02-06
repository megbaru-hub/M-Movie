'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Cpu, Terminal, Lock, User, Key } from 'lucide-react'

export default function NexusGenesis() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        genesisCode: ''
    })
    const [isDeploying, setIsDeploying] = useState(false)
    const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null)
    const router = useRouter()

    const handleGenesis = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsDeploying(true)
        setStatus(null)

        try {
            const res = await fetch('/api/admin/genesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (res.ok) {
                setStatus({ type: 'success', msg: 'Super Admin Identity Established. Redirecting to Terminal...' })
                setTimeout(() => router.push('/super-terminal'), 2500)
            } else {
                setStatus({ type: 'error', msg: data.error || 'Identity rejection detected' })
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'System communication failure' })
        } finally {
            setIsDeploying(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono text-zinc-400">
            <div className="max-w-md w-full space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/50 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                        <Cpu className="h-10 w-10 text-emerald-500 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-[0.4em]">Genesis Protocol</h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed max-w-[80%] mx-auto">
                        Initiating first-tier administrative deployment. Knowledge of the Genesis Code is required for core system access.
                    </p>
                </div>

                <form onSubmit={handleGenesis} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder=""
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all"
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
                                className="w-full bg-black border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                            <input
                                required
                                type="password"
                                placeholder=""
                                value={formData.genesisCode}
                                onChange={(e) => setFormData({ ...formData, genesisCode: e.target.value })}
                                className="w-full bg-black border border-emerald-500/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-emerald-500/80 placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isDeploying}
                        className="w-full py-5 rounded-2xl bg-zinc-900 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-emerald-500/5"
                    >
                        {isDeploying ? (
                            <div className="h-4 w-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                <Terminal className="h-4 w-4" />
                                Deploy Identity
                            </>
                        )}
                    </button>
                </form>

                {status && (
                    <div className={`p-4 rounded-xl border text-center ${status.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest">{status.msg}</p>
                    </div>
                )}

                <div className="pt-8 flex flex-col items-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-zinc-900" />
                    <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.6em] whitespace-nowrap">Core Authentication Layer v4.0</p>
                </div>
            </div>
        </div>
    )
}
