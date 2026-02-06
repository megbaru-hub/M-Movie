'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { id, message, type }])

        // Auto remove after 5 seconds
        setTimeout(() => removeToast(id), 5000)
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <ToastComponent
                            key={t.id}
                            toast={t}
                            onClose={() => removeToast(t.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

function ToastComponent({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        error: <AlertCircle className="h-5 w-5 text-rose-400" />,
        info: <Info className="h-5 w-5 text-blue-400" />
    }

    const gradients = {
        success: "from-emerald-500/10 to-transparent border-emerald-500/20",
        error: "from-rose-500/10 to-transparent border-rose-500/20",
        info: "from-blue-500/10 to-transparent border-blue-500/20"
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border bg-zinc-950/80 backdrop-blur-xl shadow-2xl min-w-[320px] max-w-md bg-gradient-to-r",
                gradients[toast.type]
            )}
        >
            <div className="flex-shrink-0">
                {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-bold text-zinc-100 leading-tight">
                {toast.message}
            </p>
            <button
                onClick={onClose}
                className="ml-4 text-zinc-500 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full overflow-hidden rounded-full">
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className={cn(
                        "h-full",
                        toast.type === 'success' ? "bg-emerald-500" :
                            toast.type === 'error' ? "bg-rose-500" : "bg-blue-500"
                    )}
                />
            </div>
        </motion.div>
    )
}
