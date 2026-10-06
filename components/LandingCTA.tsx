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
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white/90 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        Explore features
      </a>
    )
  }

  if (variant === 'banner') {
    return (
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-fitura-night shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 hover:bg-gray-100"
      >
        {isAuthenticated ? 'Open dashboard' : 'Get started'}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-fitura px-7 py-3.5 font-semibold text-white shadow-lg shadow-fitura-purple-600/30 transition-transform hover:-translate-y-0.5"
    >
      {/* Sheen on hover */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative">{label}</span>
      <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
