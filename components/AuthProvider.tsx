'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

const publicRoutes = ['/', '/login']

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const auth = localStorage.getItem('fitura_auth')
    const userData = localStorage.getItem('fitura_user')
    
    if (auth === 'true' && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    } else if (!publicRoutes.includes(pathname)) {
      router.push('/login')
    }
    setLoading(false)
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem('fitura_auth')
    localStorage.removeItem('fitura_user')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect to login if not authenticated and not on public route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}









