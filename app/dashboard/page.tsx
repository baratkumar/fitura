'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Wallet,
  User,
  CalendarClock,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import PageLoader from '@/components/PageLoader'
import { getCurrentISTCalendarYear } from '@/lib/istCalendar'

const GYMS = [
  { value: '', label: 'All gyms' },
  { value: 'Rival Fitness Studio I', label: 'Rival Fitness Studio I' },
  { value: 'Rival Fitness Studio II', label: 'Rival Fitness Studio II' },
]

interface DashboardStats {
  todayRevenue: number
  lastMonthRevenue: number
  thisMonthRevenue: number
  todayExpiry: number
  expiringThisMonth: number
  todayAttendance: number
  totalClients: number
  overallRevenue: number
  revenueYear: number
  availableYears: number[]
}

function gymQuery(gym: string): string {
  return gym.trim() ? `?gym=${encodeURIComponent(gym.trim())}` : ''
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gym, setGym] = useState('')
  const [revenueYear, setRevenueYear] = useState(() => getCurrentISTCalendarYear())
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attLoading, setAttLoading] = useState(false)
  const [attError, setAttError] = useState('')
  const [attForm, setAttForm] = useState({ clientId: '', date: '', time: '' })
  const [attSuccess, setAttSuccess] = useState<{
    status: string
    inTime: string
    outTime?: string
    duration?: string
    clientName: string
    clientId: string
    expiryDate?: string
  } | null>(null)

  useEffect(() => {
    const g = searchParams.get('gym') || ''
    const y = searchParams.get('year')
    setGym(g)
    if (y) {
      const yi = parseInt(y, 10)
      if (!isNaN(yi)) setRevenueYear(yi)
    }
  }, [searchParams])

  const syncUrl = useCallback(
    (nextGym: string, nextYear: number) => {
      const params = new URLSearchParams()
      if (nextGym.trim()) params.set('gym', nextGym.trim())
      const cy = new Date().getFullYear()
      if (nextYear !== cy) params.set('year', String(nextYear))
      const q = params.toString()
      router.replace(q ? `/dashboard?${q}` : '/dashboard', { scroll: false })
    },
    [router]
  )

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (gym.trim()) params.set('gym', gym.trim())
      params.set('year', String(revenueYear))
      const response = await fetch(`/api/dashboard/stats?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setStats(null)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [gym, revenueYear])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (!showAttendanceModal) return
    const now = new Date()
    setAttForm((prev) => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
    }))
  }, [showAttendanceModal])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleGymChange = (value: string) => {
    setGym(value)
    syncUrl(value, revenueYear)
  }

  const handleYearChange = (y: number) => {
    setRevenueYear(y)
    syncUrl(gym, y)
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttLoading(true)
    setAttError('')
    setAttSuccess(null)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: attForm.clientId,
          attendanceDate: attForm.date,
          attendanceTime: attForm.time,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setAttError(data.error || 'Failed to record attendance')
        return
      }
      let expiryDate: string | undefined
      let clientName = `Client ${attForm.clientId}`
      const cr = await fetch(`/api/clients/${attForm.clientId}`)
      if (cr.ok) {
        const c = await cr.json()
        clientName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || clientName
        expiryDate = c.expiryDate
      }
      setAttSuccess({
        status: data.status || 'IN',
        inTime: data.inTime,
        outTime: data.outTime,
        duration: data.duration,
        clientName,
        clientId: attForm.clientId,
        expiryDate,
      })
      setAttForm((prev) => ({ ...prev, clientId: '' }))
      fetchStats()
    } catch {
      setAttError('An error occurred while recording attendance')
    } finally {
      setAttLoading(false)
    }
  }

  const gq = gymQuery(gym)
  const yearOptions = useMemo(() => {
    const base =
      stats?.availableYears?.length && stats.availableYears.length > 0
        ? [...stats.availableYears]
        : [new Date().getFullYear()]
    if (!base.includes(revenueYear)) base.push(revenueYear)
    return Array.from(new Set(base)).sort((a, b) => b - a)
  }, [stats?.availableYears, revenueYear])

  if (loading && !stats) {
    return (
      <div className="container mx-auto px-4 py-10">
        <PageLoader message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Overview of your gym statistics (Asia/Kolkata)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="text-sm font-medium text-gray-700 flex flex-col gap-1">
            Gym
            <select
              value={gym}
              onChange={(e) => handleGymChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[220px]"
            >
              {GYMS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-fitura-blue text-white p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today&apos;s Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats ? formatCurrency(stats.todayRevenue) : '₹0'}
          </p>
        </div>

        <Link
          href={`/dashboard/clients/last-month-revenue${gq}`}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer block"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-fitura-purple-600 text-white p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Last month revenue</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats ? formatCurrency(stats.lastMonthRevenue) : '₹0'}
          </p>
          <p className="text-xs text-fitura-blue mt-2">View clients →</p>
        </Link>

        <Link
          href={`/dashboard/clients/this-month-revenue${gq}`}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer block"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-fitura-blue text-white p-3 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">This month revenue</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats ? formatCurrency(stats.thisMonthRevenue) : '₹0'}
          </p>
          <p className="text-xs text-fitura-blue mt-2">View clients →</p>
        </Link>

        <Link
          href={`/dashboard/clients/today-expiry${gq}`}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer block"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <CalendarClock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today expiry</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.todayExpiry ?? 0}</p>
          <p className="text-xs text-fitura-blue mt-2">View clients →</p>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-fitura-magenta text-white p-3 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today&apos;s Attendance</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.todayAttendance ?? 0}</p>
          <button
            type="button"
            onClick={() => {
              setShowAttendanceModal(true)
              setAttError('')
              setAttSuccess(null)
            }}
            className="mt-3 w-full text-sm font-semibold text-white bg-fitura-dark py-2 rounded-lg hover:bg-fitura-blue"
          >
            Record attendance
          </button>
        </div>

        <Link
          href={`/dashboard/clients/expiring-this-month${gq}`}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer block"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Expiring this month</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.expiringThisMonth ?? 0}</p>
          <p className="text-xs text-fitura-blue mt-2">View clients →</p>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-fitura-magenta text-white p-3 rounded-lg">
              <User className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Clients</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalClients ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Overall revenue (year)</h3>
            </div>
            <label className="text-sm flex items-center gap-2">
              <span className="text-gray-600">Year</span>
              <select
                value={revenueYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats ? formatCurrency(stats.overallRevenue) : '₹0'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            IST {stats?.revenueYear ?? revenueYear}: renewal payments by payment date, plus first payment for
            members with no renewal row yet (avoids double-counting).
          </p>
        </div>
      </div>

      {/* Record attendance modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => {
                setShowAttendanceModal(false)
                setAttSuccess(null)
                setAttError('')
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              {!attSuccess ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Record attendance</h2>
                  <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={attForm.clientId}
                        onChange={(e) => setAttForm((p) => ({ ...p, clientId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Numeric client ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={attForm.date}
                        onChange={(e) => setAttForm((p) => ({ ...p, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={attForm.time}
                        onChange={(e) => setAttForm((p) => ({ ...p, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {attError ? (
                      <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {attError}
                      </div>
                    ) : null}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAttendanceModal(false)}
                        className="flex-1 border border-gray-300 py-2 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={attLoading}
                        className="flex-1 bg-fitura-dark text-white py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        {attLoading ? 'Recording…' : 'Submit'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center pt-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{attSuccess.clientName}</h3>
                  <p className="text-sm text-gray-500 mb-4">ID: {attSuccess.clientId}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                      attSuccess.status === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {attSuccess.status === 'IN' ? 'Checked IN' : 'Checked OUT'}
                  </span>
                  {attSuccess.expiryDate ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-left">
                      <p className="text-xs font-semibold text-amber-800 uppercase">Membership expiry</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(attSuccess.expiryDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">No expiry date on file for this client.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAttSuccess(null)
                      setAttError('')
                    }}
                    className="w-full bg-fitura-dark text-white py-2 rounded-lg font-medium"
                  >
                    Record another
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttendanceModal(false)
                      setAttSuccess(null)
                    }}
                    className="w-full mt-2 border border-gray-300 py-2 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
