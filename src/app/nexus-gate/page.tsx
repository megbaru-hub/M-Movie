'use client'

import React, { useState } from 'react'
import { ShieldAlert, Terminal, Lock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NexusGate() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState(false)
    const router = useRouter()

    const handleAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsVerifying(true)
        setError(false)

        try {
            // Secure API call to set the high-security cookie
            const res = await fetch('/api/admin/authorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    portalType: 'CONTENT'
                })
            })

            if (res.ok) {
                // Redirect on success
                window.location.href = '/admin'
            } else {
                setError(true)
            }
        } catch (err) {
            setError(true)
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl">
                        <ShieldAlert className="h-8 w-8 text-rose-500 animate-pulse" />
                    </div>
                    <h1 className="text-xl font-black text-white uppercase tracking-[0.3em]">Restricted Access</h1>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                        Unauthorized entry into the Nexus Core is a violation of protocol.
                        Your IP and hardware ID have been logged.
                    </p>
                </div>

                <form onSubmit={handleAccess} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-primary transition-colors" />
                            <input
                                required
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Agent ID..."
                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-900 focus:outline-none focus:border-rose-500/50 transition-all shadow-inner"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-hover:text-primary transition-colors" />
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Access Key..."
                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-900 focus:outline-none focus:border-rose-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isVerifying}
                        className="w-full py-5 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-500 text-xs font-black uppercase tracking-[0.4em] hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isVerifying ? (
                            <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Terminal className="h-4 w-4" />
                                Initiate Sequence
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Access Denied: Invalidation detected</p>
                    </div>
                )}

                <div className="pt-8 flex flex-col items-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-zinc-900" />
                    <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">M-Movies Security Node 01</p>
                </div>
            </div>
        </div>
    )
}
