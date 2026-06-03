'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
  hero: 'w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] text-5xl',
} as const

const ICON_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5 sm:w-6 sm:h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  hero: 'w-20 h-20',
} as const

export type ClientAvatarSize = keyof typeof SIZE_CLASSES

type ClientAvatarProps = {
  photoUrl?: string | null
  firstName?: string
  lastName?: string
  clientId?: number | string
  size?: ClientAvatarSize
  onClick?: () => void
  className?: string
}

function getInitials(firstName?: string, lastName?: string, clientId?: number | string): string {
  const first = firstName?.trim()?.[0]
  const last = lastName?.trim()?.[0]
  if (first || last) return `${first || ''}${last || ''}`.toUpperCase()
  if (clientId != null && String(clientId).length > 0) return String(clientId)[0]
  return ''
}

export default function ClientAvatar({
  photoUrl,
  firstName,
  lastName,
  clientId,
  size = 'md',
  onClick,
  className = '',
}: ClientAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = getInitials(firstName, lastName, clientId)
  const showImage = Boolean(photoUrl?.trim()) && !imageFailed
  const sizeClass = SIZE_CLASSES[size]
  const iconClass = ICON_CLASSES[size]
  const interactive = Boolean(onClick)
  const roundClass = `${sizeClass} rounded-full border-2 border-gray-200 ${className}`.trim()

  return (
    <div
      className="relative shrink-0"
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {showImage ? (
        <img
          src={photoUrl!.trim()}
          alt={[firstName, lastName].filter(Boolean).join(' ') || 'Client'}
          className={`${roundClass} object-cover ${
            interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          }`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`${roundClass} bg-fitura-blue/10 flex items-center justify-center ${
            interactive ? 'cursor-pointer hover:bg-fitura-blue/20 transition-colors' : ''
          }`}
        >
          {initials ? (
            <span className="font-semibold text-fitura-blue">{initials}</span>
          ) : (
            <User className={`${iconClass} text-fitura-blue`} aria-hidden />
          )}
        </div>
      )}
    </div>
  )
}
