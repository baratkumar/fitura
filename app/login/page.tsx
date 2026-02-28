'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Dumbbell } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('fitura_auth', 'true')
        localStorage.setItem('fitura_user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3.5 bg-luxury-card border border-luxury-border rounded-xl text-luxury-text text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors placeholder-luxury-subtle"

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/4 blur-[120px]" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/3 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold/3 blur-[80px]" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Gold top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

          <div className="p-8 sm:p-10">

            {/* Logo */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-gold" />
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-widest text-luxury-text uppercase">FITURA</h1>
              <p className="text-xs font-semibold text-gold uppercase tracking-[0.3em] mt-1">Premium Gym Management</p>
              <div className="mt-4 h-px w-12 bg-gold/30 mx-auto" />
              <p className="text-sm text-luxury-muted mt-4">Sign in to your account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputCls}
                  placeholder="admin@fitura.com"
                  required
                  autoFocus
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputCls + ' pr-12'}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold text-luxury-black py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] mt-2"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Hint */}
            <p className="text-center text-xs text-luxury-subtle mt-6 border-t border-luxury-border pt-5">
              Default: <span className="text-luxury-muted">admin@fitura.com</span> / <span className="text-luxury-muted">admin123</span>
            </p>
          </div>
        </div>

        {/* Corner glow dots */}
        <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-gold/40" />
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold/40" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-gold/20" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-gold/20" />
      </div>
    </div>
  )
}
