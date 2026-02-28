'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Edit, Trash2, X, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Loader2 } from 'lucide-react'
import PageLoader from '@/components/PageLoader'
import { useRouter } from 'next/navigation'
import { openReceiptPrint } from '@/lib/receipt'

const PAGE_SIZES = [10, 20, 50, 100]
const SEARCH_DEBOUNCE_MS = 2500

interface Membership {
  membershipId: number
  name: string
  description?: string
  durationDays: number
  price?: number
  isActive: boolean
}

interface Client {
  clientId: number
  firstName: string
  lastName: string
  email?: string
  phone: string
  membershipType: string
  membershipName?: string
  expiryDate?: string
  membershipFee?: number
  discount?: number
  paidAmount?: number
  joiningDate?: string
  paymentDate?: string
  paymentMode?: string
  transactionId?: string
  address?: string
  photoUrl?: string
  createdAt: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterClientId, setFilterClientId] = useState('')
  const [filterName, setFilterName] = useState('')
  const [filterPhone, setFilterPhone] = useState('')
  const [filterClientIdDebounced, setFilterClientIdDebounced] = useState('')
  const [filterNameDebounced, setFilterNameDebounced] = useState('')
  const [filterPhoneDebounced, setFilterPhoneDebounced] = useState('')
  const [renewClient, setRenewClient] = useState<Client | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [renewing, setRenewing] = useState(false)
  const [renewForm, setRenewForm] = useState({
    membershipType: '',
    joiningDate: '',
    expiryDate: '',
    membershipFee: '',
    discount: '0',
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: '',
    transactionId: '',
  })

  useEffect(() => {
    const t = setTimeout(() => {
      setFilterClientIdDebounced(filterClientId)
      setFilterNameDebounced(filterName)
      setFilterPhoneDebounced(filterPhone)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [filterClientId, filterName, filterPhone])

  useEffect(() => {
    fetchClients()
  }, [page, limit, filterClientIdDebounced, filterNameDebounced, filterPhoneDebounced])

  useEffect(() => {
    if (renewClient) {
      fetch('/api/memberships')
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setMemberships(data))
        .catch(() => setMemberships([]))
      setRenewForm({
        membershipType: '',
        joiningDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        membershipFee: '',
        discount: '0',
        paidAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: '',
        transactionId: '',
      })
    }
  }, [renewClient])

  useEffect(() => {
    if (!renewForm.membershipType || !memberships.length) return
    const m = memberships.find((x) => x.membershipId.toString() === renewForm.membershipType)
    if (m) {
      const fee = m.price ?? 0
      const disc = parseFloat(renewForm.discount) || 0
      setRenewForm((prev) => ({ ...prev, membershipFee: fee.toString(), paidAmount: (fee - disc).toString() }))
    }
  }, [renewForm.membershipType, renewForm.discount, memberships])

  const handleRenewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setRenewForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renewClient) return
    setRenewing(true)
    try {
      const res = await fetch(`/api/renewals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: renewClient.clientId,
          membershipType: renewForm.membershipType,
          joiningDate: renewForm.joiningDate || undefined,
          expiryDate: renewForm.expiryDate || undefined,
          membershipFee: renewForm.membershipFee ? parseFloat(renewForm.membershipFee) : undefined,
          discount: parseFloat(renewForm.discount) || 0,
          paidAmount: renewForm.paidAmount ? parseFloat(renewForm.paidAmount) : undefined,
          paymentDate: renewForm.paymentDate || undefined,
          paymentMode: renewForm.paymentMode || undefined,
          transactionId: renewForm.transactionId || undefined,
        }),
      })
      if (res.ok) {
        setRenewClient(null)
        fetchClients()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to renew membership')
      }
    } catch (err) {
      console.error('Renew error:', err)
      alert('Failed to renew membership')
    } finally {
      setRenewing(false)
    }
  }

  useEffect(() => {
    if (!renewForm.joiningDate || !renewForm.membershipType || !memberships.length) return
    const m = memberships.find((x) => x.membershipId.toString() === renewForm.membershipType)
    if (m?.durationDays) {
      const d = new Date(renewForm.joiningDate)
      d.setDate(d.getDate() + m.durationDays)
      setRenewForm((prev) => ({ ...prev, expiryDate: d.toISOString().split('T')[0] }))
    }
  }, [renewForm.joiningDate, renewForm.membershipType, memberships])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (filterClientIdDebounced.trim()) params.set('clientId', filterClientIdDebounced.trim())
      if (filterNameDebounced.trim()) params.set('name', filterNameDebounced.trim())
      if (filterPhoneDebounced.trim()) params.set('phone', filterPhoneDebounced.trim())
      const response = await fetch(`/api/clients?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (clientId: number) => {
    router.push(`/clients/${clientId}/edit`)
  }

  const handleDelete = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      const response = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      if (response.ok) {
        const remaining = clients.filter(client => client.clientId !== clientId)
        setClients(remaining)
        setTotal(prev => prev - 1)
        if (remaining.length === 0 && page > 1) {
          setPage(p => Math.max(1, p - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  const isPaidClient = (client: Client) => (client.paidAmount ?? 0) > 0

  const handleDownloadReceipt = (client: Client) => {
    openReceiptPrint(client)
  }

  // Shared input style for filter fields
  const filterInputCls = "w-full px-2 py-1 text-xs bg-luxury-card border border-luxury-border rounded text-luxury-text placeholder-luxury-subtle focus:outline-none focus:border-gold/50"

  const paginationBar = (
    <div className="px-4 sm:px-6 py-4 border-t border-luxury-border flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <p className="text-sm text-luxury-muted">
          Showing <span className="text-luxury-text font-medium">{startItem}</span> – <span className="text-luxury-text font-medium">{endItem}</span> of <span className="text-luxury-text font-medium">{total}</span>
        </p>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
          className="text-sm bg-luxury-card border border-luxury-border rounded-lg px-2 py-1.5 text-luxury-text focus:outline-none focus:border-gold/50"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>{n} per page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {[
          { onClick: () => setPage(1), disabled: page <= 1, icon: ChevronsLeft, title: 'First page' },
          { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page <= 1, icon: ChevronLeft, title: 'Previous page' },
          { onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page >= totalPages, icon: ChevronRight, title: 'Next page' },
          { onClick: () => setPage(totalPages), disabled: page >= totalPages, icon: ChevronsRight, title: 'Last page' },
        ].map(({ onClick, disabled, icon: Icon, title }, i) => (
          <button
            key={i}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="p-2 rounded-lg border border-luxury-border text-luxury-muted hover:border-gold/40 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <span className="text-sm text-luxury-muted px-2 min-w-[7rem] text-center">
          Page {page} of {totalPages || 1}
        </span>
      </div>
    </div>
  )

  // Modal form field styles
  const modalInputCls = "w-full px-3 py-2 bg-luxury-card border border-luxury-border rounded-lg text-luxury-text placeholder-luxury-subtle focus:outline-none focus:border-gold/50"
  const modalLabelCls = "block text-xs font-medium text-luxury-muted uppercase tracking-wider mb-1"

  if (loading && clients.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Members</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-luxury-text">Clients</h1>
          </div>
          <Link
            href="/clients/new"
            className="px-5 py-2.5 bg-gold text-luxury-black text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors text-center"
          >
            + Register New Client
          </Link>
        </div>
        <PageLoader message="Loading clients..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Members</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-luxury-text">Clients</h1>
          <div className="mt-2 h-px w-12 bg-gold/40" />
        </div>
        <Link
          href="/clients/new"
          className="px-5 py-2.5 bg-gold text-luxury-black text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors text-center"
        >
          + Register New Client
        </Link>
      </div>

      {clients.length > 0 ? (
        <div className="bg-luxury-surface border border-luxury-border rounded-xl overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-luxury-black/60 flex items-center justify-center z-10 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                <span className="text-sm text-luxury-muted">Searching...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-luxury-card border-b border-luxury-border">
                <tr>
                  {/* ID */}
                  <th className="px-4 py-3 text-left">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider">ID</span>
                      <div className="relative">
                        <input type="text" value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)}
                          placeholder="Filter..." className={filterInputCls} />
                        {filterClientId && (
                          <button type="button" onClick={() => { setFilterClientId(''); setFilterClientIdDebounced(''); setPage(1) }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-luxury-subtle hover:text-gold">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  {/* Image */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gold uppercase tracking-wider">Photo</th>
                  {/* Name */}
                  <th className="px-4 py-3 text-left">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider">Name</span>
                      <div className="relative">
                        <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)}
                          placeholder="Filter..." className={filterInputCls} />
                        {filterName && (
                          <button type="button" onClick={() => { setFilterName(''); setFilterNameDebounced(''); setPage(1) }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-luxury-subtle hover:text-gold">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  {/* Phone */}
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider">Phone</span>
                      <div className="relative">
                        <input type="text" value={filterPhone} onChange={(e) => setFilterPhone(e.target.value)}
                          placeholder="Filter..." className={filterInputCls} />
                        {filterPhone && (
                          <button type="button" onClick={() => { setFilterPhone(''); setFilterPhoneDebounced(''); setPage(1) }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-luxury-subtle hover:text-gold">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gold uppercase tracking-wider hidden md:table-cell">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gold uppercase tracking-wider">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gold uppercase tracking-wider hidden lg:table-cell">Membership</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gold uppercase tracking-wider hidden lg:table-cell">Registered</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {clients.map((client) => (
                  <tr key={client.clientId} className="hover:bg-luxury-card/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-luxury-muted">{client.clientId}</td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        {client.photoUrl ? (
                          <img
                            src={client.photoUrl}
                            alt={`${client.firstName} ${client.lastName}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gold/30 cursor-pointer hover:border-gold transition-colors"
                            onClick={() => setSelectedImage({ url: client.photoUrl!, name: `${client.firstName} ${client.lastName}` })}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`avatar-fallback w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center ${client.photoUrl ? 'hidden' : ''}`}>
                          <Users className="w-5 h-5 text-gold/60" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/clients/${client.clientId}`}
                        className="text-sm font-semibold text-luxury-text hover:text-gold transition-colors block">
                        {client.firstName} {client.lastName}
                      </Link>
                      <div className="text-xs text-luxury-muted">{client.email}</div>
                      <div className="text-xs text-luxury-subtle md:hidden mt-0.5">
                        Exp: {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-luxury-subtle lg:hidden md:block mt-0.5">
                        {client.membershipName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-luxury-muted hidden sm:table-cell">
                      {client.phone || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-luxury-muted hidden md:table-cell">
                      {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {(() => {
                        const fee = client.membershipFee || 0
                        const disc = client.discount || 0
                        const final = fee - disc
                        const paid = client.paidAmount || 0
                        const isLow = paid < final && final > 0
                        return (
                          <span className={isLow ? 'text-red-400 font-semibold' : 'text-luxury-muted'}>
                            {client.paidAmount !== undefined ? `₹${client.paidAmount.toFixed(2)}` : 'N/A'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gold/10 text-gold border border-gold/20">
                        {client.membershipName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-luxury-muted hidden lg:table-cell">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {isPaidClient(client) && (
                          <button onClick={() => handleDownloadReceipt(client)} title="Download Receipt"
                            className="p-1.5 rounded-lg text-luxury-muted hover:text-green-400 hover:bg-green-400/10 transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setRenewClient(client)} title="Renew"
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-gold hover:bg-gold/10 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(client.clientId)} title="Edit"
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client.clientId)} title="Delete"
                          className="p-1.5 rounded-lg text-luxury-muted hover:text-red-400 hover:bg-red-400/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginationBar}
        </div>
      ) : (
        <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
          {/* Top gold line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

          {/* Decorative radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)' }} />
          </div>

          {/* Decorative spinning ring */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none animate-spin-slow">
            <svg width="340" height="340" viewBox="0 0 340 340" fill="none">
              <circle cx="170" cy="170" r="165" stroke="#D4AF37" strokeWidth="1" strokeDasharray="8 14" />
              <circle cx="170" cy="170" r="120" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="4 10" />
            </svg>
          </div>

          <div className="relative z-10 py-20 px-8 text-center">
            {/* Icon cluster */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center">
                  <Users className="w-9 h-9 text-gold/70" />
                </div>
                {/* Corner dots */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold/30 border border-gold/50" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-gold/20" />
              </div>
            </div>

            {filterClientId || filterName || filterPhone ? (
              <>
                <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-2">No Results</p>
                <h3 className="text-2xl font-black text-luxury-text mb-3">No clients found</h3>
                <p className="text-luxury-muted text-sm max-w-sm mx-auto mb-8">
                  No clients match your current filters. Try adjusting your search or clear filters to see all members.
                </p>
                <button type="button"
                  onClick={() => { setFilterClientId(''); setFilterName(''); setFilterPhone(''); setFilterClientIdDebounced(''); setFilterNameDebounced(''); setFilterPhoneDebounced(''); setPage(1) }}
                  className="px-6 py-2.5 border border-gold/40 text-gold text-sm font-semibold rounded-xl hover:bg-gold/10 transition-all">
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-2">Get Started</p>
                <h3 className="text-2xl font-black text-luxury-text mb-3">No members yet</h3>
                <p className="text-luxury-muted text-sm max-w-sm mx-auto mb-8">
                  Register your first gym member to start tracking memberships, attendance, and payments.
                </p>
                <Link href="/clients/new"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-gold text-luxury-black text-sm font-bold rounded-xl hover:bg-gold-light transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]">
                  + Register First Client
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Renew Membership Modal */}
      {renewClient && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => !renewing && setRenewClient(null)}>
          <div className="bg-luxury-surface border border-luxury-border rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-bold text-luxury-text">Renew Membership</h2>
                <button type="button" onClick={() => !renewing && setRenewClient(null)}
                  className="p-1.5 rounded-lg hover:bg-luxury-elevated text-luxury-muted hover:text-luxury-text transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-luxury-muted mb-6">
                {renewClient.firstName} {renewClient.lastName} <span className="text-luxury-subtle">· ID {renewClient.clientId}</span>
              </p>
              <form onSubmit={handleRenewSubmit} className="space-y-4">
                <div>
                  <label className={modalLabelCls}>Subscription <span className="text-red-400">*</span></label>
                  <select name="membershipType" value={renewForm.membershipType} onChange={handleRenewFormChange} required className={modalInputCls}>
                    <option value="">Select subscription</option>
                    {memberships.map((m) => (
                      <option key={m.membershipId} value={m.membershipId}>
                        {m.name} {m.price != null ? `— ₹${m.price}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={modalLabelCls}>Start Date <span className="text-red-400">*</span></label>
                    <input type="date" name="joiningDate" value={renewForm.joiningDate} onChange={handleRenewFormChange} required className={modalInputCls} />
                  </div>
                  <div>
                    <label className={modalLabelCls}>Expiry Date</label>
                    <input type="date" name="expiryDate" value={renewForm.expiryDate} onChange={handleRenewFormChange} className={modalInputCls} />
                  </div>
                </div>
                <div>
                  <label className={modalLabelCls}>Payment Date</label>
                  <input type="date" name="paymentDate" value={renewForm.paymentDate} onChange={handleRenewFormChange} className={modalInputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={modalLabelCls}>Membership Fee (₹)</label>
                    <input type="number" name="membershipFee" value={renewForm.membershipFee} onChange={handleRenewFormChange} min="0" step="0.01" className={modalInputCls} />
                  </div>
                  <div>
                    <label className={modalLabelCls}>Discount (₹)</label>
                    <input type="number" name="discount" value={renewForm.discount} onChange={handleRenewFormChange} min="0" step="0.01" className={modalInputCls} />
                  </div>
                </div>
                <div>
                  <label className={modalLabelCls}>Paid Amount (₹)</label>
                  <input type="number" name="paidAmount" value={renewForm.paidAmount} onChange={handleRenewFormChange} min="0" step="0.01" placeholder="0.00" className={modalInputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={modalLabelCls}>Payment Mode</label>
                    <select name="paymentMode" value={renewForm.paymentMode} onChange={handleRenewFormChange} className={modalInputCls}>
                      <option value="">Select</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className={modalLabelCls}>Transaction ID</label>
                    <input type="text" name="transactionId" value={renewForm.transactionId} onChange={handleRenewFormChange} placeholder="Optional" className={modalInputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => !renewing && setRenewClient(null)}
                    className="flex-1 px-4 py-2.5 border border-luxury-border rounded-lg text-sm font-medium text-luxury-muted hover:border-luxury-elevated hover:text-luxury-text transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={renewing || !renewForm.membershipType}
                    className="flex-1 px-4 py-2.5 bg-gold text-luxury-black rounded-lg text-sm font-semibold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {renewing ? 'Renewing…' : 'Renew'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-luxury-surface border border-luxury-border text-luxury-text rounded-full p-2 hover:border-gold/40 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <img src={selectedImage.url} alt={selectedImage.name}
              className="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[90vh]"
              onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <div className="absolute bottom-4 left-4 right-4 bg-luxury-black/80 border border-gold/20 text-luxury-text px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold text-gold">{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
