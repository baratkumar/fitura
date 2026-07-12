'use client'

import { useMemo, useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  Users,
  Wallet,
  ClipboardCheck,
  CalendarClock,
  AlertCircle,
  CalendarDays,
} from 'lucide-react'

function defaultDateRange(): { from: string; to: string; month: string } {
  const now = new Date()
  const to = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const [y, m] = to.split('-')
  return { from: `${y}-${m}-01`, to, month: `${y}-${m}` }
}

const GYMS = [
  { value: '', label: 'All gyms' },
  { value: 'Rival Fitness Studio I', label: 'Rival Fitness Studio I' },
  { value: 'Rival Fitness Studio II', label: 'Rival Fitness Studio II' },
]

const REPORTS = [
  {
    type: 'monthly' as const,
    title: 'Monthly report',
    description:
      'Full month pack: joined members (paid or unpaid), renewals, attendance, and expiring — by calendar month only.',
    icon: CalendarDays,
    accent: 'bg-fitura-dark/10 text-fitura-dark',
    dateMode: 'month' as const,
    dateLabel: 'Calendar month',
  },
  {
    type: 'clients' as const,
    title: 'Clients',
    description: 'Members filtered by joining / registration date, gym, and membership status.',
    icon: Users,
    accent: 'bg-fitura-blue/10 text-fitura-blue',
    dateMode: 'range' as const,
    dateLabel: 'Joining / registration date',
  },
  {
    type: 'renewals' as const,
    title: 'Renewals & registrations',
    description:
      'Renewals and new registrations in the date range — includes unpaid (₹0) entries.',
    icon: Wallet,
    accent: 'bg-emerald-500/10 text-emerald-700',
    dateMode: 'range' as const,
    dateLabel: 'Payment / joining date',
  },
  {
    type: 'attendance' as const,
    title: 'Attendance',
    description: 'Check-in / check-out records for the selected attendance dates.',
    icon: ClipboardCheck,
    accent: 'bg-fitura-purple-600/10 text-fitura-purple-700',
    dateMode: 'range' as const,
    dateLabel: 'Attendance date',
  },
  {
    type: 'expiring' as const,
    title: 'Expiring memberships',
    description: 'Members whose expiry date falls within the selected range.',
    icon: CalendarClock,
    accent: 'bg-orange-500/10 text-orange-700',
    dateMode: 'range' as const,
    dateLabel: 'Expiry date',
  },
]

export default function ReportsPage() {
  const defaults = useMemo(() => defaultDateRange(), [])
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [month, setMonth] = useState(defaults.month)
  const [gym, setGym] = useState('')
  const [membershipStatus, setMembershipStatus] = useState<'all' | 'active' | 'lapsed'>('all')
  const [loadingType, setLoadingType] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [lastDownload, setLastDownload] = useState<{ type: string; rows: number } | null>(null)

  const downloadReport = async (type: string, dateMode: 'month' | 'range') => {
    setError('')
    setLastDownload(null)

    if (dateMode === 'month') {
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        setError('Please select a month for the monthly report.')
        return
      }
    } else {
      if (!from || !to) {
        setError('Please select both From and To dates.')
        return
      }
      if (from > to) {
        setError('From date must be on or before To date.')
        return
      }
    }

    setLoadingType(type)
    try {
      const params = new URLSearchParams({ type })
      if (dateMode === 'month') {
        params.set('month', month)
      } else {
        params.set('from', from)
        params.set('to', to)
      }
      if (gym.trim()) params.set('gym', gym.trim())
      if (type === 'clients') params.set('membershipStatus', membershipStatus)

      const res = await fetch(`/api/reports/export?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Download failed (${res.status})`)
      }

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] || `fitura-${type}-report.xlsx`
      const rowCount = parseInt(res.headers.get('X-Row-Count') || '0', 10)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setLastDownload({ type, rows: rowCount })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report')
    } finally {
      setLoadingType(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Reports</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Download Excel reports by calendar month or custom date range (Asia/Kolkata).
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-fitura-blue" />
          Filters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
              <span className="text-gray-400 font-normal"> (monthly report)</span>
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gym</label>
            <select
              value={gym}
              onChange={(e) => setGym(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
            >
              {GYMS.map((g) => (
                <option key={g.value || 'all'} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership status
              <span className="text-gray-400 font-normal"> (clients)</span>
            </label>
            <select
              value={membershipStatus}
              onChange={(e) => setMembershipStatus(e.target.value as 'all' | 'active' | 'lapsed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="lapsed">Lapsed</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        {lastDownload ? (
          <div className="mt-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            Downloaded {lastDownload.type} report
            {lastDownload.rows === 0
              ? ' (0 rows — empty sheet).'
              : ` (${lastDownload.rows} row${lastDownload.rows === 1 ? '' : 's'}).`}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map(({ type, title, description, icon: Icon, accent, dateLabel, dateMode }) => (
          <div
            key={type}
            className={`bg-white rounded-xl shadow-lg p-6 flex flex-col border transition-colors ${
              type === 'monthly'
                ? 'border-fitura-dark/20 md:col-span-2'
                : 'border-gray-100 hover:border-fitura-blue/20'
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Uses: {dateMode === 'month' ? `Month filter (${month || '—'})` : dateLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadReport(type, dateMode)}
              disabled={loadingType !== null}
              className="mt-auto inline-flex items-center justify-center gap-2 bg-fitura-dark text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-fitura-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {loadingType === type ? 'Preparing Excel…' : 'Download Excel'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
