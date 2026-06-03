'use client'

import Link from 'next/link'
import ClientAvatar from './ClientAvatar'
import type { ClientAvatarSize } from './ClientAvatar'

type ClientNameWithAvatarProps = {
  photoUrl?: string | null
  firstName: string
  lastName: string
  clientId?: number | string
  href?: string
  size?: ClientAvatarSize
  onPhotoClick?: () => void
  nameClassName?: string
  children?: React.ReactNode
}

export default function ClientNameWithAvatar({
  photoUrl,
  firstName,
  lastName,
  clientId,
  href,
  size = 'md',
  onPhotoClick,
  nameClassName = 'text-sm font-semibold text-gray-900 hover:text-fitura-blue transition-colors',
  children,
}: ClientNameWithAvatarProps) {
  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <div className="flex items-start gap-3 min-w-0">
      <ClientAvatar
        photoUrl={photoUrl}
        firstName={firstName}
        lastName={lastName}
        clientId={clientId}
        size={size}
        onClick={onPhotoClick}
      />
      <div className="min-w-0 flex-1">
        {href ? (
          <Link href={href} className={`block ${nameClassName}`}>
            {fullName}
          </Link>
        ) : (
          <span className={`block ${nameClassName}`}>{fullName}</span>
        )}
        {children}
      </div>
    </div>
  )
}
