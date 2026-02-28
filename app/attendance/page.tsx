'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle, X, ArrowUpRight, LogIn, LogOut } from 'lucide-react'

interface ClientInfo {
  clientId: string
  firstName: string
  lastName: string
  photoUrl?: string
}

interface SuccessData {
  status: 'IN' | 'OUT'
  inTime: string
  outTime?: string
  duration?: string
  client: ClientInfo
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(5)
  const [formData, setFormData] = useState({ clientId: '', date: '', time: '' })

  useEffect(() => {
    const now = new Date()
    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
    }))
  }, [])

  useEffect(() => {
    if (showModal && successData) {
      setCountdown(5)
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(interval); setShowModal(false); setSuccessData(null); return 0 }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showModal, successData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (successData) { setSuccessData(null); setShowModal(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccessData(null); setShowModal(false)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: formData.clientId, attendanceDate: formData.date, attendanceTime: formData.time }),
      })
      const data = await res.json()
      if (res.ok) {
        const clientRes = await fetch(`/api/clients/${formData.clientId}`)
        let client: ClientInfo | null = null
        if (clientRes.ok) {
          const cd = await clientRes.json()
          client = { clientId: cd.clientId.toString(), firstName: cd.firstName, lastName: cd.lastName, photoUrl: cd.photoUrl }
        }
        setSuccessData({
          status: data.status || 'IN',
          inTime: data.inTime, outTime: data.outTime, duration: data.duration,
          client: client || { clientId: formData.clientId, firstName: '', lastName: 'Client', photoUrl: undefined },
        })
        setShowModal(true)
        const now = new Date()
        setFormData({ clientId: '', date: now.toISOString().split('T')[0], time: now.toTimeString().split(' ')[0].slice(0, 5) })
      } else {
        let msg = data.error || 'Failed to record attendance'
        if (data.hint) msg += ` ${data.hint}`
        if (res.status === 404 && data.clientId) msg = `Client ID ${data.clientId} not found. Please verify the client ID.`
        setError(msg)
      }
    } catch (err) {
      console.error('Error recording attendance:', err)
      setError('An error occurred while recording attendance')
    } finally {
      setLoading(false)
    }
  }

  const fmtTime = (t: string) =>
    new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const inputCls = "w-full px-4 py-3 bg-luxury-card border border-luxury-border rounded-xl text-luxury-text text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors placeholder-luxury-subtle"
  const labelCls = "block text-xs font-semibold text-luxury-muted uppercase tracking-widest mb-2"

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Check In / Out</p>
          <h1 className="text-3xl sm:text-4xl font-black text-luxury-text">Attendance</h1>
          <div className="mt-3 h-px w-12 bg-gold/40" />
        </div>
        <Link href="/attendance/list"
          className="flex items-center gap-1.5 text-xs font-semibold text-luxury-muted border border-luxury-border px-3 py-2 rounded-xl hover:border-gold/40 hover:text-gold transition-all mt-1">
          View List <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Form Card */}
      <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Client ID */}
            <div>
              <label htmlFor="clientId" className={labelCls}>
                Client ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="Enter client ID"
                required
                autoFocus
                className={inputCls}
              />
              <p className="mt-2 text-xs text-luxury-subtle">
                First entry = Check IN &nbsp;·&nbsp; Second entry = Check OUT
              </p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className={labelCls}>
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="time" className={labelCls}>
                  Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gold text-luxury-black py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
            >
              <Clock className="w-4 h-4" />
              {loading ? 'Recording…' : 'Record Attendance'}
            </button>

          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && successData && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">

            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${successData.status === 'IN' ? 'via-green-400/70' : 'via-orange-400/70'} to-transparent`} />

            {/* Close + Countdown */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className="flex items-center gap-2 bg-luxury-card border border-luxury-border rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-xs font-semibold text-luxury-muted">Closing in {countdown}s</span>
              </div>
              <button onClick={() => { setShowModal(false); setSuccessData(null) }}
                className="p-1.5 rounded-lg hover:bg-luxury-elevated text-luxury-muted hover:text-luxury-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo */}
            <div className="px-5 pt-2 pb-4">
              <div className="flex justify-center mb-5">
                {successData.client.photoUrl ? (
                  <img
                    src={successData.client.photoUrl}
                    alt={`${successData.client.firstName} ${successData.client.lastName}`}
                    className={`w-64 h-64 object-cover rounded-xl border-2 shadow-lg ${successData.status === 'IN' ? 'border-green-400/40' : 'border-orange-400/40'}`}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className={`w-64 h-64 bg-luxury-card rounded-xl border-2 flex items-center justify-center ${successData.status === 'IN' ? 'border-green-400/30' : 'border-orange-400/30'}`}>
                    <span className="text-6xl font-black text-luxury-muted">
                      {successData.client.firstName?.[0] || successData.client.clientId[0] || '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + Status */}
              <div className="text-center mb-5">
                <h3 className="text-lg font-black text-luxury-text">
                  {successData.client.firstName && successData.client.lastName
                    ? `${successData.client.firstName} ${successData.client.lastName}`
                    : `Client #${successData.client.clientId}`}
                </h3>
                {successData.client.firstName && (
                  <p className="text-xs text-luxury-muted mt-0.5">ID: {successData.client.clientId}</p>
                )}
                <div className="flex justify-center mt-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border
                    ${successData.status === 'IN'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                    {successData.status === 'IN'
                      ? <><LogIn className="w-3.5 h-3.5" /> Checked IN</>
                      : <><LogOut className="w-3.5 h-3.5" /> Checked OUT</>}
                  </span>
                </div>
              </div>

              {/* Times */}
              <div className="bg-luxury-card border border-luxury-border rounded-xl p-4 mb-5 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-luxury-muted">IN Time</span>
                  <span className="font-bold text-luxury-text">{fmtTime(successData.inTime)}</span>
                </div>
                {successData.outTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-luxury-muted">OUT Time</span>
                    <span className="font-bold text-luxury-text">{fmtTime(successData.outTime)}</span>
                  </div>
                )}
                {successData.duration && (
                  <div className="flex justify-between items-center pt-2.5 border-t border-luxury-border">
                    <span className="text-luxury-muted font-medium">Duration</span>
                    <span className="font-black text-gold">{successData.duration}</span>
                  </div>
                )}
              </div>

              {/* OK Button */}
              <button
                onClick={() => { setShowModal(false); setSuccessData(null) }}
                className="w-full py-3 bg-gold text-luxury-black rounded-xl font-bold text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
