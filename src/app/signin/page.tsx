'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chrome, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true)
            setError(null)
            await signIn('google', { callbackUrl })
        } catch (err) {
            setError('Failed to sign in with Google. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-12">
                <div className="text-center space-y-6">
                    <Link href="/" className="inline-block">
                        <div className="relative h-16 w-auto mx-auto">
                            <img
                                src="/logo.png"
                                alt="M-Movies Logo"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Welcome Back</h1>
                        <p className="text-zinc-500 font-medium">Sign in to access your personalized M-Movies experience</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full group relative overflow-hidden rounded-[2rem] bg-white p-[2px] transition-all hover:bg-gradient-to-r hover:from-primary hover:to-rose-600"
                    >
                        <div className="relative rounded-[2rem] bg-white px-8 py-5 flex items-center justify-center gap-4 transition-all group-hover:bg-zinc-950">
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 text-zinc-900 group-hover:text-white animate-spin transition-colors" />
                            ) : (
                                <>
                                    <Chrome className="h-6 w-6 text-zinc-900 group-hover:text-white transition-colors" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 group-hover:text-white transition-colors">
                                        Continue with Google
                                    </span>
                                </>
                            )}
                        </div>
                    </button>

                    {error && (
                        <div className="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 flex items-center gap-4 text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-950 px-4 text-zinc-600 font-black tracking-widest">Why Google?</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: 'Secure', emoji: '🔒' },
                            { label: 'Fast', emoji: '⚡' },
                            { label: 'Easy', emoji: '✨' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <div className="text-2xl mb-2">{item.emoji}</div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-zinc-600 font-medium">
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                </div>

                <div className="pt-8 flex flex-col items-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-zinc-900" />
                    <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.6em]">Secure Authentication</p>
                </div>
            </div>
        </div>
    )
}
