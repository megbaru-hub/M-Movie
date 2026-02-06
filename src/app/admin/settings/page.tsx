'use client'

import React from 'react'
import { Settings, Save, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-12 max-w-4xl">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">System Configuration</h1>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Global Variables & Environment Control</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* General Section */}
                <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">General Parameters</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Name</label>
                                <input type="text" defaultValue="M-Movies Nexus" className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Support Contact</label>
                                <input type="email" defaultValue="admin@m-movies.com" className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maintenance Section */}
                <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 space-y-6">
                    <div className="flex items-center gap-3 border-b border-rose-500/10 pb-4">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">Danger Zone</h3>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-wider">Maintenance Mode</p>
                            <p className="text-[10px] text-zinc-500 font-medium mt-1">Suspend public access. Admin portals remain active.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-zinc-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                        <Save className="h-4 w-4" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    )
}
