'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Trash2, Plus, X, Users, Loader2, LogIn, LogOut } from 'lucide-react'
import PageLoader from '@/components/PageLoader'

const SEARCH_DEBOUNCE_MS = 2500

interface Attendance {
  id: string
  clientId: string
  clientName?: string
  photoUrl?: string
  attendanceDate: string
  inTime: string
  outTime?: string
  status: 'IN' | 'OUT'
  duration?: string
  createdAt: string
}

export default function AttendanceListPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterClientId, setFilterClientId] = useState('')
  const [filterDateDebounced, setFilterDateDebounced] = useState('')
  const [filterClientIdDebounced, setFilterClientIdDebounced] = useState('')
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setFilterDateDebounced(filterDate)
      setFilterClientIdDebounced(filterClientId)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [filterDate, filterClientId])

  useEffect(() => {
    fetchAttendance()
  }, [filterDateDebounced, filterClientIdDebounced])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterDateDebounced) params.append('date', filterDateDebounced)
      if (filterClientIdDebounced) params.append('clientId', filterClientIdDebounced)
      const url = params.toString() ? `/api/attendance?${params.toString()}` : '/api/attendance'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return
    try {
      const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setAttendance(attendance.filter(record => record.id !== id))
      } else {
        alert('Failed to delete attendance record')
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
      alert('An error occurred while deleting the attendance record')
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${hour % 12 || 12}:${minutes} ${ampm}`
  }

  const filterInputCls = "w-full px-2 py-1.5 text-xs bg-luxury-card border border-luxury-border rounded-lg text-luxury-text focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/10 transition-colors placeholder-luxury-subtle"

  if (loading && attendance.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Records</p>
            <h1 className="text-3xl sm:text-4xl font-black text-luxury-text">Attendance List</h1>
            <div className="mt-3 h-px w-12 bg-gold/40" />
          </div>
          <Link href="/attendance"
            className="flex items-center gap-2 bg-gold text-luxury-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-1">
            <Plus className="w-4 h-4" /> Record Attendance
          </Link>
        </div>
        <PageLoader message="Loading attendance..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Records</p>
          <h1 className="text-3xl sm:text-4xl font-black text-luxury-text">Attendance List</h1>
          <div className="mt-3 h-px w-12 bg-gold/40" />
        </div>
        <Link href="/attendance"
          className="flex items-center gap-2 bg-gold text-luxury-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-1">
          <Plus className="w-4 h-4" /> Record Attendance
        </Link>
      </div>

      {attendance.length > 0 ? (
        <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          {/* Search loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-luxury-black/50 flex items-center justify-center z-10 rounded-2xl">
              <div className="flex flex-col items-center gap-3 bg-luxury-surface border border-luxury-border rounded-xl px-6 py-4">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                <span className="text-xs font-semibold text-luxury-muted">Searching…</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-border">
                  <th className="px-4 sm:px-5 py-3 text-left hidden sm:table-cell">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-gold uppercase tracking-widest">Client ID</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={filterClientId}
                          onChange={(e) => setFilterClientId(e.target.value)}
                          placeholder="Filter…"
                          className={filterInputCls}
                        />
                        {filterClientId && (
                          <button type="button"
                            onClick={() => { setFilterClientId(''); setFilterClientIdDebounced('') }}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Photo</span>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Client</span>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-gold uppercase tracking-widest">Date</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className={filterInputCls}
                        />
                        {filterDate && (
                          <button type="button"
                            onClick={() => { setFilterDate(''); setFilterDateDebounced('') }}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left hidden md:table-cell">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">IN / OUT</span>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Status</span>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left hidden lg:table-cell">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Duration</span>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left hidden lg:table-cell">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Recorded At</span>
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-luxury-elevated transition-colors group">
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm font-mono text-luxury-muted hidden sm:table-cell">
                      {record.clientId}
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <div className="relative">
                        {record.photoUrl ? (
                          <img
                            src={record.photoUrl}
                            alt={record.clientName || 'Client'}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-luxury-border cursor-pointer hover:border-gold/40 transition-all"
                            onClick={() => setSelectedImage({ url: record.photoUrl!, name: record.clientName || `Client ID: ${record.clientId}` })}
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              t.style.display = 'none'
                              const fb = t.parentElement?.querySelector('.avatar-fallback') as HTMLElement
                              if (fb) fb.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`avatar-fallback w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center ${record.photoUrl ? 'hidden' : ''}`}>
                          <Users className="w-5 h-5 text-luxury-muted" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm font-semibold text-luxury-text">
                      <div className="flex flex-col">
                        <span>{record.clientName || 'N/A'}</span>
                        <span className="text-xs text-luxury-muted sm:hidden">ID: {record.clientId}</span>
                        <span className="text-xs text-luxury-subtle md:hidden mt-0.5">
                          <span className="text-green-400">IN: {formatTime(record.inTime)}</span>
                          {record.outTime && <span className="text-orange-400 ml-2">OUT: {formatTime(record.outTime)}</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm text-luxury-muted">
                      {formatDate(record.attendanceDate)}
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-green-400 font-medium">IN: {formatTime(record.inTime)}</span>
                        {record.outTime && <span className="text-orange-400 font-medium">OUT: {formatTime(record.outTime)}</span>}
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        record.status === 'IN'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      }`}>
                        {record.status === 'IN' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                      {record.duration
                        ? <span className="font-bold text-gold">{record.duration}</span>
                        : <span className="text-luxury-subtle">—</span>}
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-xs text-luxury-muted hidden lg:table-cell">
                      {new Date(record.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 rounded-lg text-luxury-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-xl bg-gold/5 border border-gold/20 flex items-center justify-center">
                <Clock className="w-9 h-9 text-gold/50" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-luxury-text mb-2">
              {filterDateDebounced || filterClientIdDebounced
                ? 'No records found'
                : 'No attendance records yet'}
            </h3>
            <p className="text-luxury-muted text-sm mb-6">
              {filterDateDebounced || filterClientIdDebounced
                ? 'Try adjusting or clearing your filters'
                : 'Start recording attendance to see records here'}
            </p>
            <Link href="/attendance"
              className="flex items-center gap-2 bg-gold text-luxury-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Plus className="w-4 h-4" /> Record Attendance
            </Link>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text rounded-full p-2 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto rounded-2xl shadow-2xl object-contain max-h-[85vh] border border-luxury-border"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div className="absolute bottom-3 left-3 right-3 bg-luxury-black/80 backdrop-blur-sm text-luxury-text px-4 py-2.5 rounded-xl border border-luxury-border">
              <p className="text-sm font-bold">{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
