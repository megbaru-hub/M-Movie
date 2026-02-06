'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    variant?: 'destructive' | 'primary'
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm Action',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'primary'
}: ConfirmModalProps) {

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
                    >
                        {/* Header/Accents */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 h-1",
                            variant === 'destructive' ? "bg-rose-500" : "bg-primary"
                        )} />

                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <div className={cn(
                                    "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                                    variant === 'destructive' ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                                )}>
                                    <AlertTriangle className="h-7 w-7" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{title}</h3>
                                    <p className="text-zinc-400 font-medium leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                <button
                                    onClick={onCancel}
                                    className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-10">
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-3 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 hover:text-white transition-all"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm()
                                        onCancel()
                                    }}
                                    className={cn(
                                        "px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg",
                                        variant === 'destructive'
                                            ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/20"
                                            : "bg-primary hover:bg-rose-500 shadow-primary/20"
                                    )}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
