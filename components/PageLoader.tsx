'use client'

import { Loader2 } from 'lucide-react'

interface PageLoaderProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

export default function PageLoader({ message = 'Loading...', className = '', size = 'lg' }: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2
        className={`${sizeClasses[size]} text-fitura-blue animate-spin mb-4`}
        aria-hidden
      />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}
