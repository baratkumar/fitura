'use client'

import { X } from 'lucide-react'
import ClientAvatar from './ClientAvatar'

type ClientPhotoModalProps = {
  url: string
  name: string
  photoUrl?: string | null
  onClose: () => void
}

export default function ClientPhotoModal({ url, name, photoUrl, onClose }: ClientPhotoModalProps) {
  const [nameParts] = [name.split(' ')]
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={url}
          alt={name}
          className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[90vh]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white px-4 py-3 rounded-lg flex items-center gap-3">
          <ClientAvatar
            photoUrl={photoUrl ?? url}
            firstName={firstName}
            lastName={lastName}
            size="sm"
          />
          <p className="text-lg font-semibold">{name}</p>
        </div>
      </div>
    </div>
  )
}
