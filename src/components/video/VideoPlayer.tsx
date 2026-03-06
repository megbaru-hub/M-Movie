'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, ScanFace, Settings, Check, Download, Captions, CaptionsOff, ChevronRight, ChevronLeft, FastForward, Rewind } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import MediaDownloadButton from './MediaDownloadButton'

interface VideoPlayerProps {
    url: string
    title: string
    thumbnail?: string
    subtitleUrl?: string
    availableQualities?: number[] // e.g. [1080, 720, 480]
    onNext?: () => void
    onPrev?: () => void
    autoPlay?: boolean
}

export default function VideoPlayer({
    url,
    title,
    thumbnail,
    subtitleUrl,
    availableQualities = [],
    onNext,
    onPrev,
    autoPlay
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // State
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [controlsVisible, setControlsVisible] = useState(true)
    const [zoomLevel, setZoomLevel] = useState<'contain' | 'cover'>('contain')
    const [hasError, setHasError] = useState(false)
    const [showSubtitles, setShowSubtitles] = useState(true)

    // Quality State
    const [currentQuality, setCurrentQuality] = useState<'auto' | number>('auto')
    const [activeQuality, setActiveQuality] = useState<number | null>(null) // The actual quality being played in 'auto' mode
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    // HUD State
    const [hud, setHud] = useState<{ visible: boolean; icon: React.ReactNode; label: string } | null>(null)
    const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cumulative Seeking State
    const [cumulativeSeek, setCumulativeSeek] = useState<number>(0)
    const seekResetRef = useRef<NodeJS.Timeout | null>(null)
    const [ripple, setRipple] = useState<{ x: number; y: number; side: 'left' | 'right' } | null>(null)

    const triggerHUD = (icon: React.ReactNode, label: string) => {
        if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current)
        setHud({ visible: true, icon, label })
        hudTimeoutRef.current = setTimeout(() => {
            setHud(null)
        }, 800)
    }

    // Refs for persistence across source changes
    const lastTimeRef = useRef(0)
    const wasPlayingRef = useRef(false)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Detect initial quality if 'auto'
    useEffect(() => {
        if (currentQuality === 'auto') {
            const connection = (navigator as any).connection
            if (connection) {
                const type = connection.effectiveType
                if (type === '4g') setActiveQuality(availableQualities[0] || null)
                else if (type === '3g') setActiveQuality(availableQualities.find(q => q <= 480) || availableQualities[availableQualities.length - 1] || null)
                else setActiveQuality(availableQualities[availableQualities.length - 1] || null)
            } else {
                setActiveQuality(availableQualities[0] || null)
            }
        } else {
            setActiveQuality(currentQuality)
        }
    }, [currentQuality, availableQualities])

    // Construct Video Source URL
    const videoSrc = useMemo(() => {
        if (!activeQuality) return url
        return `${url}${url.includes('?') ? '&' : '?'}quality=${activeQuality}`
    }, [url, activeQuality])

    // Effect to sync time and state when source changes
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Capture current state before we lose it
        const savedTime = lastTimeRef.current
        const savedPlaying = wasPlayingRef.current

        // Handle reloading logic
        const handleReSync = () => {
            if (savedTime > 0) {
                video.currentTime = savedTime
            }
            if (savedPlaying || autoPlay) {
                video.play().catch(() => { })
            }
            setIsLoading(false)
        }

        // Subtitle Reset: Toggle mode to force clear stuck cues
        const track = video.textTracks[0]
        if (track) {
            const currentMode = track.mode
            track.mode = 'disabled'
            setTimeout(() => {
                if (track) track.mode = currentMode
            }, 50)
        }

        video.addEventListener('loadedmetadata', handleReSync)
        return () => video.removeEventListener('loadedmetadata', handleReSync)
    }, [videoSrc])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const updateProgress = () => {
            const time = video.currentTime
            setProgress(time)
            setDuration(video.duration || 0)
            if (time > 0) lastTimeRef.current = time
        }

        const handlePlayState = () => {
            wasPlayingRef.current = !video.paused
            setIsPlaying(!video.paused)
        }

        const handleBuffering = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)

        const handleEnded = () => {
            if (onNext) onNext()
        }

        video.addEventListener('timeupdate', updateProgress)
        video.addEventListener('play', handlePlayState)
        video.addEventListener('pause', handlePlayState)
        video.addEventListener('waiting', handleBuffering)
        video.addEventListener('playing', () => setIsLoading(false))
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('loadedmetadata', handleCanPlay)
        video.addEventListener('ended', handleEnded)

        return () => {
            video.removeEventListener('timeupdate', updateProgress)
            video.removeEventListener('play', handlePlayState)
            video.removeEventListener('pause', handlePlayState)
            video.removeEventListener('waiting', handleBuffering)
            video.removeEventListener('playing', () => setIsLoading(false))
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('loadedmetadata', handleCanPlay)
            video.removeEventListener('ended', handleEnded)
        }
    }, [onNext])

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    const togglePlay = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play().catch(e => {
                console.error("Play failed:", e)
                setHasError(true)
            })
        }
        setIsPlaying(!isPlaying)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = time
            setProgress(time)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        setVolume(val)
        if (videoRef.current) {
            videoRef.current.volume = val
            setIsMuted(val === 0)
        }
    }

    const toggleFullscreen = () => {
        if (!containerRef.current) return
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const toggleZoom = () => setZoomLevel(prev => prev === 'contain' ? 'cover' : 'contain')

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if no input/textarea is focused
            if (['input', 'textarea'].includes(document.activeElement?.tagName.toLowerCase() || '')) return

            const video = videoRef.current
            if (!video) return

            switch (e.key) {
                case ' ':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    const newVolUp = Math.min(1, video.volume + 0.1)
                    setVolume(newVolUp)
                    video.volume = newVolUp
                    setIsMuted(newVolUp === 0)
                    triggerHUD(<Volume2 className="h-12 w-12" />, `${Math.round(newVolUp * 100)}%`)
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    const newVolDown = Math.max(0, video.volume - 0.1)
                    setVolume(newVolDown)
                    video.volume = newVolDown
                    setIsMuted(newVolDown === 0)
                    triggerHUD(<Volume2 className="h-12 w-12" />, `${Math.round(newVolDown * 100)}%`)
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    video.currentTime = Math.min(video.duration, video.currentTime + 10)
                    triggerHUD(<FastForward className="h-12 w-12" />, "+10s")
                    break
                case 'ArrowLeft':
                    e.preventDefault()
                    video.currentTime = Math.max(0, video.currentTime - 10)
                    triggerHUD(<Rewind className="h-12 w-12" />, "-10s")
                    break
                case 'f':
                case 'F':
                    e.preventDefault()
                    toggleFullscreen()
                    triggerHUD(<Maximize className="h-12 w-12" />, document.fullscreenElement ? "Window" : "Full Screen")
                    break
                case 'm':
                case 'M':
                    e.preventDefault()
                    toggleMute()
                    triggerHUD(isMuted ? <Volume2 className="h-12 w-12" /> : <VolumeX className="h-12 w-12" />, isMuted ? "Unmuted" : "Muted")
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [togglePlay, volume, isMuted, isPlaying, toggleFullscreen, toggleMute])

    // Subtitles Effect
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const track = video.textTracks[0]
        if (track) {
            track.mode = showSubtitles ? 'showing' : 'hidden'
        }
    }, [showSubtitles, subtitleUrl])



    const handleSeekClick = (side: 'left' | 'right', e: React.MouseEvent) => {
        // Double-click detection: check detail from native event
        if (e.detail < 2) return

        const video = videoRef.current
        if (!video) return

        // Clear existing reset timer
        if (seekResetRef.current) clearTimeout(seekResetRef.current)

        const seekAmount = side === 'right' ? 10 : -10
        const newCumulative = cumulativeSeek + seekAmount
        setCumulativeSeek(newCumulative)

        // Apply seek
        video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + seekAmount))

        // Trigger HUD and Ripple
        const absVal = Math.abs(newCumulative)
        const sign = newCumulative > 0 ? '+' : '-'
        triggerHUD(
            side === 'right' ? <FastForward className="h-12 w-12" /> : <Rewind className="h-12 w-12" />,
            `${sign}${absVal}s`
        )

        setRipple({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, side })
        setTimeout(() => setRipple(null), 600)

        // Set reset timer
        seekResetRef.current = setTimeout(() => {
            setCumulativeSeek(0)
        }, 1500)
    }

    const handleMouseMove = () => {
        setControlsVisible(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                if (!isSettingsOpen) setControlsVisible(false)
            }, 3000)
        }
    }

    return (
        <div
            ref={containerRef}
            className="group relative aspect-video w-full bg-black overflow-hidden shadow-2xl rounded-xl ring-1 ring-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && !isSettingsOpen && setControlsVisible(false)}
        >
            {/* Native Video Element */}
            <video
                ref={videoRef}
                src={videoSrc}
                className={cn(
                    "h-full w-full transition-all duration-500",
                    zoomLevel === 'contain' ? 'object-contain' : 'object-cover'
                )}
                playsInline
                onClick={togglePlay}
                poster={thumbnail}
                onContextMenu={(e) => e.preventDefault()}
                onError={() => setHasError(true)}
            >
                {subtitleUrl && (
                    <track
                        kind="subtitles"
                        src={subtitleUrl}
                        srcLang="en"
                        label="English"
                        default
                    />
                )}
            </video>

            {/* Interaction Zones */}
            <div className="absolute inset-0 z-30 flex">
                {/* Left Zone - Prev/Rewind */}
                <div
                    className="h-full w-[30%] cursor-pointer group/zone relative"
                    onClick={(e) => handleSeekClick('left', e)}
                >
                    {ripple?.side === 'left' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            className="absolute bg-white/10 rounded-full h-32 w-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: ripple.x, top: ripple.y }}
                        />
                    )}
                </div>

                {/* Center Zone - Play/Pause */}
                <div
                    className="h-full flex-1 cursor-pointer"
                    onClick={() => {
                        // Small delay to ensure we're not double clicking
                        setTimeout(() => {
                            if (cumulativeSeek === 0) togglePlay()
                        }, 250)
                    }}
                />

                {/* Right Zone - Next/Forward */}
                <div
                    className="h-full w-[30%] cursor-pointer group/zone relative"
                    onClick={(e) => handleSeekClick('right', e)}
                >
                    {ripple?.side === 'right' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            className="absolute bg-white/10 rounded-full h-32 w-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: ripple.x, top: ripple.y }}
                        />
                    )}
                </div>
            </div>

            {/* HUD (Heads-Up Display) */}
            <AnimatePresence>
                {hud && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none"
                    >
                        <div className="flex flex-col items-center justify-center h-40 w-40 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl">
                            <div className="text-white mb-4">
                                {hud.icon}
                            </div>
                            <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{hud.label}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Overlay */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                    <p className="text-red-500 font-bold bg-black/50 px-4 py-2 rounded">Video Playback Error</p>
                </div>
            )}

            {/* Loading Spinner */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
            )}

            {/* Quality Settings Menu */}
            {isSettingsOpen && (
                <div className="absolute bottom-24 right-6 w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-[60] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="p-3 border-b border-white/5 bg-white/5">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Video Quality</span>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => { setCurrentQuality('auto'); setIsSettingsOpen(false) }}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                        >
                            <span className={cn(currentQuality === 'auto' ? "text-primary font-bold" : "text-zinc-400")}>
                                Auto {currentQuality === 'auto' && activeQuality && `(${activeQuality}p)`}
                            </span>
                            {currentQuality === 'auto' && <Check className="h-4 w-4 text-primary" />}
                        </button>
                        {availableQualities.map(q => (
                            <button
                                key={q}
                                onClick={() => { setCurrentQuality(q); setIsSettingsOpen(false) }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                            >
                                <span className={cn(currentQuality === q ? "text-primary font-bold" : "text-zinc-400")}>{q}p</span>
                                {currentQuality === q && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                    </div>

                    <div className="p-3 border-t border-white/5 bg-white/5">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Appearance</span>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => setShowSubtitles(!showSubtitles)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                        >
                            <span className={cn(showSubtitles ? "text-primary font-bold" : "text-zinc-400")}>
                                Captions
                            </span>
                            {showSubtitles ? <Captions className="h-4 w-4 text-primary" /> : <CaptionsOff className="h-4 w-4 text-zinc-600" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 transition-opacity duration-300 z-50",
                controlsVisible || !isPlaying || isSettingsOpen ? "opacity-100" : "opacity-0"
            )}>
                {/* Progress Bar */}
                <div className="group/slider relative h-1 mb-4 cursor-pointer">
                    <input
                        type="range" min={0} max={duration || 100} value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all rounded-full group-hover/slider:bg-rose-500"
                            style={{ width: `${(progress / duration) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-2">
                            <button
                                onClick={onPrev}
                                disabled={!onPrev}
                                className={cn(
                                    "text-white/70 transition-colors",
                                    onPrev ? "hover:text-primary" : "opacity-30 cursor-not-allowed"
                                )}
                                title="Previous Episode"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 6h2v12H6zm3.5 6L18 18V6z" /></svg>
                            </button>
                            <button onClick={togglePlay} className="text-white hover:text-primary transition-all transform active:scale-95">
                                {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current" />}
                            </button>
                            <button
                                onClick={onNext}
                                disabled={!onNext}
                                className={cn(
                                    "text-white/70 transition-colors",
                                    onNext ? "hover:text-primary" : "opacity-30 cursor-not-allowed"
                                )}
                                title="Next Episode"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 18l8.5-6L6 6zM16 6v12h2V6z" /></svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                <input
                                    type="range" min={0} max={1} step={0.1} value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="h-1 w-full bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-white/70 tracking-wider">
                            {formatTime(progress)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleZoom}
                            className="text-white/70 hover:text-white transition-colors"
                            title={zoomLevel === 'contain' ? "Fill Screen" : "Fit to Screen"}
                        >
                            <ScanFace className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={cn("transition-all", isSettingsOpen ? "text-primary rotate-45" : "text-white/70 hover:text-white hover:rotate-45")}
                        >
                            <Settings className="h-5 w-5" />
                        </button>

                        <MediaDownloadButton
                            videoUrl={url}
                            subtitleUrl={subtitleUrl}
                            title={title}
                            variant="icon"
                            quality={currentQuality !== 'auto' ? currentQuality : undefined}
                        />

                        {subtitleUrl && (
                            <button
                                onClick={() => setShowSubtitles(!showSubtitles)}
                                className={cn("transition-all", showSubtitles ? "text-primary" : "text-white/70 hover:text-white")}
                                title={showSubtitles ? "Hide Subtitles" : "Show Subtitles"}
                            >
                                {showSubtitles ? <Captions className="h-5 w-5" /> : <CaptionsOff className="h-5 w-5" />}
                            </button>
                        )}

                        <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                            <Maximize className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
