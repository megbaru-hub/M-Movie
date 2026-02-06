'use client'

import React from 'react'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaDownloadButtonProps {
    videoUrl: string
    subtitleUrl?: string
    title: string
    variant?: 'icon' | 'labeled'
    className?: string
    quality?: number | string
}

export default function MediaDownloadButton({
    videoUrl,
    subtitleUrl,
    title,
    variant = 'labeled',
    className,
    quality
}: MediaDownloadButtonProps) {

    const triggerDownload = (url: string, filename: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault()

        // 1. Download Video
        const downloadUrl = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}download=true${quality ? `&quality=${quality}` : ''}`
        const videoFilename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${quality ? `_${quality}p` : ''}.mp4`
        triggerDownload(downloadUrl, videoFilename)

        // 2. Download Subtitles if available
        if (subtitleUrl) {
            // Small delay to ensure browser doesn't block second download
            setTimeout(() => {
                const subExt = subtitleUrl.split('.').pop() || 'vtt'
                const subFilename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${subExt}`
                triggerDownload(subtitleUrl, subFilename)
            }, 500)
        }
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleDownload}
                className={cn("text-white/70 hover:text-primary transition-colors", className)}
                title="Download Content (Video + Subtitles)"
            >
                <Download className="h-5 w-5" />
            </button>
        )
    }

    return (
        <button
            onClick={handleDownload}
            className={cn("flex flex-col items-center gap-2 group transition-all", className)}
        >
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-800 group-hover:text-white transition-all transform group-hover:scale-110">
                <Download className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Download</span>
        </button>
    )
}
