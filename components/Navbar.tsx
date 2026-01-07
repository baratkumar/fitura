'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Home, LayoutDashboard, Users, Settings, LogOut, Clock } from 'lucide-react'
import { useAuth } from './AuthProvider'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="bg-fitura-dark text-white shadow-lg">
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
