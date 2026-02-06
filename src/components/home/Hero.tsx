'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Info, Calendar, Clock, Star, Plus, MonitorPlay } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero() {
    return (
        <div className="relative h-[80vh] w-full overflow-hidden">
            {/* Background with Ambient Atmosphere */}
            <div className="absolute inset-0 bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />

                {/* Atmospheric Glows */}
                <div className="absolute top-[-20%] right-[-10%] h-[120%] w-[70%] rounded-full bg-primary/10 blur-[150px] animate-pulse duration-[5000ms]" />
                <div className="absolute bottom-[-20%] left-[10%] h-[80%] w-[50%] rounded-full bg-rose-600/5 blur-[120px]" />
            </div>

            {/* Content */}
            <div className="relative z-20 flex h-full flex-col justify-center px-8 md:px-20 lg:px-32 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-6 mb-8 mt-12">
                        <div className="relative h-16 w-auto">
                            <img src="/logo.png" alt="M-Movies Logo" className="h-full w-auto object-contain animate-float" />
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Premium Anthology</p>
                            <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-primary fill-current" /> 4.9 Average Rating</span>
                                <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                <span className="text-zinc-400">Next-Gen Streaming</span>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black text-white mb-8 leading-[0.85] tracking-tighter drop-shadow-2xl">
                        EVERY STORY. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-500 to-rose-400 italic">VIVIDLY TOLD.</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-3xl leading-relaxed font-medium">
                        Explore a world-class collection of cinematic masterpieces. From high-octane
                        action to profound documentaries, M-Movies delivers a seamless, ad-free
                        streaming experience powered by edge-optimized technology.
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mb-16">
                        <Link href="/explore" className="group flex items-center gap-4 rounded-[1.25rem] bg-white px-10 py-5 text-zinc-950 font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5">
                            <Play className="h-5 w-5 fill-current" />
                            Discover the Vault
                        </Link>
                        <Link href="/my-list" className="flex items-center gap-3 rounded-[1.25rem] bg-zinc-900/50 px-10 py-5 text-white font-black uppercase tracking-widest text-xs backdrop-blur-2xl border border-white/5 hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-5 w-5" />
                            My Watchlist
                        </Link>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-12 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white tracking-tighter">5k+</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Premium Titles</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white tracking-tighter">4K</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Ultra-HD Quality</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white tracking-tighter">24/7</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Global Accessibility</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Bottom Fade */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20" />
        </div>
    )
}
