'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, LayoutDashboard, Users, Settings, LogOut, Clock, Home } from 'lucide-react'
import { useAuth } from './AuthProvider'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

  if (pathname === '/login') {
    return null
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/attendance/list', label: 'Attendance', icon: Clock },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="bg-luxury-dark border-b border-luxury-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <Dumbbell className="w-4 h-4 text-gold" />
            </div>
            <span className="text-lg font-bold tracking-widest text-gold hidden sm:inline">
              FITURA
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-luxury-muted hover:text-gold transition-colors rounded-lg hover:bg-gold/5"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold bg-gold text-luxury-black rounded-lg hover:bg-gold-light transition-colors"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                        ${isActive
                          ? 'text-gold bg-gold/10 border border-gold/20'
                          : 'text-luxury-muted hover:text-gold hover:bg-gold/5'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  )
                })}
                <div className="w-px h-6 bg-luxury-border mx-1 hidden sm:block" />
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-luxury-muted hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
