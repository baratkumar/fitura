'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Home, LayoutDashboard, Users, Settings, LogOut, Clock, FileSpreadsheet } from 'lucide-react'
import { useAuth } from './AuthProvider'

const SCROLL_THRESHOLD = 24

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isHome) return

    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  const showSolidHeader = !isHome || scrolled

  return (
    <nav
      className={`text-white transition-all duration-300 ${
        isHome ? 'fixed top-0 left-0 right-0 z-50' : ''
      } ${
        showSolidHeader
          ? 'bg-fitura-dark shadow-lg'
          : 'bg-transparent shadow-none'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-fitura-purple-300 transition-colors flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Fitura</span>
          </Link>
          <div className="flex gap-2 sm:gap-4 lg:gap-6 items-center overflow-x-auto">
            {!isAuthenticated ? (
              <>
                <Link 
                  href="/" 
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link 
                  href="/login" 
                  className="bg-fitura-blue px-4 py-2 rounded-lg hover:bg-fitura-purple-600 transition-colors font-medium"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link 
                  href="/clients" 
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Clients</span>
                </Link>
                <Link 
                  href="/attendance/list" 
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Attendance</span>
                </Link>
                <Link 
                  href="/reports" 
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-fitura-purple-300 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
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
