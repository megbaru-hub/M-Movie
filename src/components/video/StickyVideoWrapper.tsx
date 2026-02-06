'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Minimize2, Maximize2 } from 'lucide-react'

interface StickyVideoWrapperProps {
    children: React.ReactNode
}

export default function StickyVideoWrapper({ children }: StickyVideoWrapperProps) {
    const [isSticky, setIsSticky] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const placeholderRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (!placeholderRef.current || !playerRef.current) return

            const rect = placeholderRef.current.getBoundingClientRect()
            const shouldStick = rect.bottom < 0

            setIsSticky(shouldStick)

            if (!shouldStick) {
                setIsMinimized(false)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleClose = () => {
        setIsSticky(false)
        setIsMinimized(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            {/* Placeholder to maintain layout */}
            <div
                ref={placeholderRef}
                className="relative w-full aspect-video"
                style={{ visibility: isSticky ? 'hidden' : 'visible' }}
            />

            {/* Player - moves between positions */}
            <div
                ref={playerRef}
                className={`
                    ${isSticky ? 'fixed z-40' : 'absolute top-0 left-0 right-0'}
                    transition-all duration-300 ease-out
                    ${isSticky && !isMinimized ? 'top-20 left-1/2 -translate-x-1/2 w-[92vw] md:w-[75vw] lg:w-[65vw] max-w-5xl' : ''}
                    ${isSticky && isMinimized ? 'bottom-4 right-4 w-80 scale-50 origin-bottom-right' : ''}
                    ${!isSticky ? 'w-full' : ''}
                `}
            >
                <div className="relative rounded-none md:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                    {children}

                    {/* Control Buttons - only show when sticky */}
                    {isSticky && (
                        <div className="absolute top-2 right-2 flex items-center gap-2 z-[110]">
                            {!isMinimized ? (
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className="h-9 w-9 rounded-lg bg-black/80 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black transition-all shadow-lg hover:scale-110"
                                    title="Minimize"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsMinimized(false)}
                                    className="h-9 w-9 rounded-lg bg-black/80 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black transition-all shadow-lg hover:scale-110"
                                    title="Expand"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="h-9 w-9 rounded-lg bg-black/80 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-red-500/90 hover:border-red-500/50 transition-all shadow-lg hover:scale-110"
                                title="Return to video"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
