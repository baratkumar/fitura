'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import PageLoader from '@/components/PageLoader'

const VALID_TYPES = [
  'last-month-revenue',
  'this-month-revenue',
  'today-expiry',
  'expiring-this-month',
] as const

type ValidType = (typeof VALID_TYPES)[number]

interface Row {
  clientId: number
  firstName: string
  lastName: string
  email?: string
  phone: string
  expiryDate?: string
  membershipName?: string
  paidAmount?: number
  periodRevenue?: number
}

const TITLES: Record<ValidType, { title: string; subtitle: string }> = {
  'last-month-revenue': {
    title: 'Last month revenue',
    subtitle: 'Clients who registered or renewed in the previous calendar month (IST)',
  },
  'this-month-revenue': {
    title: 'This month revenue',
    subtitle: 'Clients who registered or renewed in the current calendar month (IST)',
  },
  'today-expiry': {
    title: 'Expiring today',
    subtitle: 'Membership expiry date is today (IST)',
  },
  'expiring-this-month': {
    title: 'Expiring this month',
    subtitle: 'Membership expiry falls in the current calendar month (IST)',
  },
}

export default function DashboardClientsListPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const rawType = params.type as string
  const gym = searchParams.get('gym') || ''

  const type = useMemo(() => {
    return VALID_TYPES.includes(rawType as ValidType) ? (rawType as ValidType) : null
  }, [rawType])

  const [clients, setClients] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 50

  useEffect(() => {
    setPage(1)
  }, [type, gym])

  useEffect(() => {
    if (!type) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const gymQ = gym.trim() ? `&gym=${encodeURIComponent(gym.trim())}` : ''
        const res = await fetch(
          `/api/dashboard/clients?type=${encodeURIComponent(type)}&page=${page}&limit=${limit}${gymQ}`
        )
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (cancelled) return
        setClients(data.clients ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
      } catch {
        if (!cancelled) {
          setClients([])
          setTotal(0)
          setTotalPages(1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [type, page, gym])

  if (!type) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-gray-600">Invalid list type.</p>
        <Link href="/dashboard" className="text-fitura-blue mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const meta = TITLES[type]
  const showPeriodRevenue =
    type === 'last-month-revenue' || type === 'this-month-revenue'

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href={gym ? `/dashboard?gym=${encodeURIComponent(gym)}` : '/dashboard'}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{meta.title}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{meta.subtitle}</p>
        {gym ? (
          <p className="text-sm text-gray-500 mt-2">Gym filter: {gym}</p>
        ) : null}
      </div>

      {loading ? (
        <PageLoader message="Loading…" />
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No clients found</h3>
          <p className="text-gray-500">Try another gym filter or time range from the dashboard.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  {showPeriodRevenue ? (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Period revenue
                    </th>
                  ) : null}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((c) => (
                  <tr key={c.clientId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.clientId}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${c.clientId}`}
                        className="font-semibold text-fitura-blue hover:underline"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                      {c.email ? <div className="text-xs text-gray-500">{c.email}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    {showPeriodRevenue ? (
                      <td className="px-4 py-3 font-medium">
                        ₹{(c.periodRevenue ?? 0).toFixed(2)}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      {c.expiryDate
                        ? new Date(c.expiryDate).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{c.membershipName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="p-2 rounded border border-gray-300 disabled:opacity-40"
                title="First"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded border border-gray-300 disabled:opacity-40"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded border border-gray-300 disabled:opacity-40"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-2 rounded border border-gray-300 disabled:opacity-40"
                title="Last"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
