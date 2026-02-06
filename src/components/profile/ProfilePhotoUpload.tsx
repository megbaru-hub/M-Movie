'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload, Loader2, X, Check } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'
import Image from 'next/image'

interface ProfilePhotoUploadProps {
    currentImage: string | null
    userId: string
    onUploadSuccess: (newImageUrl: string) => void
}

export default function ProfilePhotoUpload({ currentImage, userId, onUploadSuccess }: ProfilePhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const validateFile = (file: File): string | null => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return 'Please upload a JPG, PNG, or WebP image'
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return 'Image must be less than 5MB'
        }

        return null
    }

    const handleFileSelect = (file: File) => {
        const error = validateFile(file)
        if (error) {
            toast(error, 'error')
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        uploadFile(file)
    }

    const uploadFile = async (file: File) => {
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('avatar', file)

            const res = await fetch('/api/users/avatar', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                onUploadSuccess(data.imageUrl)
                setPreview(null)
                toast('Profile photo updated successfully!', 'success')

                // Refresh the page to update session
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            } else {
                const error = await res.json()
                toast(error.error || 'Upload failed', 'error')
                setPreview(null)
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast('Failed to upload image', 'error')
            setPreview(null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    return (
        <div className="relative group shrink-0">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] bg-zinc-800 border-2 border-white/10 overflow-hidden shadow-2xl relative">
                {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : currentImage ? (
                    <img src={currentImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-white/20">
                        U
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Upload Button Overlay */}
            <div
                className={`absolute inset-0 rounded-[2rem] bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer ${isDragging ? 'opacity-100 bg-primary/30' : ''
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                            <Camera className="h-6 w-6 text-white" />
                        )}
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                        {isUploading ? 'Uploading...' : 'Change Photo'}
                    </p>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
            />
        </div>
    )
}
