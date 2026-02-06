'use client'

import React from 'react'
import { Bell, Shield, Eye, Globe, Zap, Info } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 p-8 md:p-20 lg:p-32">
            <div className="max-w-4xl mx-auto space-y-20">
                <header className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter">System Configuration</h1>
                    <p className="text-zinc-500 font-medium text-lg max-w-2xl">Optimize your cinematic experience and manage global account preferences through our encrypted control center.</p>
                </header>

                <div className="space-y-16">
                    {/* Performance & Quality */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-8 rounded-full bg-primary" />
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Engine & Performance</h2>
                        </div>
                        <div className="glass rounded-[2.5rem] overflow-hidden divide-y divide-white/5 border border-white/5">
                            {[
                                { icon: Zap, label: 'Turbo Streaming', desc: 'Pre-allocate bandwidth for zero-latency 4K playback', active: true },
                                { icon: Eye, label: 'Atmospheric UI', desc: 'Enable hardware-accelerated blur and transparency effects', active: true },
                                { icon: Shield, label: 'Encrypted Fetch', desc: 'Secure all metadata requests through our private proxy', active: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-8 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors border border-white/5 shadow-inner">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight">{item.label}</p>
                                            <p className="text-xs text-zinc-500 font-medium mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className={`h-8 w-16 rounded-full p-1 transition-all cursor-pointer ${item.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-zinc-800'}`}>
                                        <div className={`h-6 w-6 rounded-full bg-white transition-transform duration-300 shadow-xl ${item.active ? 'translate-x-8' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Regional & Accessibility */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-8 rounded-full bg-primary" />
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Regional & Accessibility</h2>
                        </div>
                        <div className="glass rounded-[2.5rem] overflow-hidden divide-y divide-white/5 border border-white/5">
                            {[
                                { icon: Globe, label: 'Interface Language', val: 'English (US)' },
                                { icon: Bell, label: 'Notification Center', val: 'Critical Only' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-8 hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors border border-white/5 shadow-inner">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight">{item.label}</p>
                                            <p className="text-xs text-zinc-500 font-medium mt-1">Currently set to {item.val}</p>
                                        </div>
                                    </div>
                                    <span className="text-zinc-700 font-black text-2xl group-hover:text-white transition-colors">→</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* System Information */}
                    <div className="p-10 rounded-[3rem] bg-gradient-to-tr from-zinc-900/50 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6 text-center md:text-left">
                            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10">
                                <Info className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Nexus Engine v1.0.4</h3>
                                <p className="text-xs text-zinc-500 font-medium mt-1">Build: 2026.02.05.stable_release</p>
                            </div>
                        </div>
                        <button className="btn-premium">Check Manifest Updates</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
