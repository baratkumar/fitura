'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAuth } from './AuthProvider'

type LandingCTAProps = {
  variant?: 'hero-primary' | 'hero-secondary' | 'banner'
}

export default function LandingCTA({ variant = 'hero-primary' }: LandingCTAProps) {
  const { isAuthenticated } = useAuth()
  const href = isAuthenticated ? '/dashboard' : '/login'
  const label = isAuthenticated ? 'Go to Dashboard' : 'Sign in to Fitura'

  if (variant === 'hero-secondary') {
    return (
      <a
        href="#features"
        className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
      >
        Explore features
      </a>
    )
  }

  if (variant === 'banner') {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 bg-white text-fitura-dark px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
      >
        {isAuthenticated ? 'Open dashboard' : 'Get started'}
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 bg-white text-fitura-dark px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg shadow-black/20"
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </Link>
  )
}
