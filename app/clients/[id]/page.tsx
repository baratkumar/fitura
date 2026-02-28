'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Users, Mail, Phone, Calendar, MapPin, CreditCard, User, Heart, Activity, FileText, Trash2, X } from 'lucide-react'
import PageLoader from '@/components/PageLoader'

interface Client {
  clientId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  age?: number
  height?: number
  weight?: number
  gender?: string
  bloodGroup?: string
  bmi?: number
  aadharNumber?: string
  photoUrl?: string
  address: string
  membershipType: string
  membershipName?: string
  joiningDate?: string
  expiryDate?: string
  membershipFee?: number
  discount?: number
  paymentDate?: string
  paymentMode?: string
  transactionId?: string
  paidAmount?: number
  emergencyContactName: string
  emergencyContactPhone: string
  medicalConditions?: string
  fitnessGoals?: string
  firstTimeInGym?: string
  previousGymDetails?: string
  createdAt: string
}

interface Renewal {
  _id: string
  clientId: number
  membershipType: string
  membershipName?: string
  joiningDate?: string
  expiryDate?: string
  membershipFee?: number
  discount?: number
  paidAmount?: number
  paymentDate?: string
  paymentMode?: string
  transactionId?: string
  createdAt: string
  updatedAt?: string
}

interface Membership {
  membershipId: number
  name: string
  durationDays: number
  price?: number
}

export default function ViewClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [renewalsLoading, setRenewalsLoading] = useState(true)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [membershipsLoading, setMembershipsLoading] = useState(false)
  const [editingRenewal, setEditingRenewal] = useState<Renewal | null>(null)
  const [savingRenewal, setSavingRenewal] = useState(false)
  const [deletingRenewal, setDeletingRenewal] = useState(false)
  const [editForm, setEditForm] = useState({
    membershipType: '',
    joiningDate: '',
    expiryDate: '',
    membershipFee: '',
    discount: '0',
    paidAmount: '',
    paymentDate: '',
    paymentMode: '',
    transactionId: '',
  })

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
        fetchRenewals(data.clientId)
      } else if (response.status === 404) {
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRenewals = async (cid: number) => {
    setRenewalsLoading(true)
    try {
      const res = await fetch(`/api/renewals?clientId=${cid}`)
      if (res.ok) {
        const data = await res.json()
        setRenewals(data)
      } else {
        setRenewals([])
      }
    } catch (err) {
      console.error('Error fetching renewals:', err)
      setRenewals([])
    } finally {
      setRenewalsLoading(false)
    }
  }

  const ensureMembershipsLoaded = async () => {
    if (memberships.length || membershipsLoading) return
    setMembershipsLoading(true)
    try {
      const res = await fetch('/api/memberships')
      if (res.ok) {
        const data = await res.json()
        setMemberships(data)
      } else {
        setMemberships([])
      }
    } catch (err) {
      console.error('Error fetching memberships for renewals:', err)
      setMemberships([])
    } finally {
      setMembershipsLoading(false)
    }
  }

  const openEditRenewal = async (renewal: Renewal) => {
    await ensureMembershipsLoaded()
    setEditingRenewal(renewal)
    setEditForm({
      membershipType: renewal.membershipType || '',
      joiningDate: renewal.joiningDate || '',
      expiryDate: renewal.expiryDate || '',
      membershipFee: renewal.membershipFee != null ? String(renewal.membershipFee) : '',
      discount: renewal.discount != null ? String(renewal.discount) : '0',
      paidAmount: renewal.paidAmount != null ? String(renewal.paidAmount) : '',
      paymentDate: renewal.paymentDate || '',
      paymentMode: renewal.paymentMode || '',
      transactionId: renewal.transactionId || '',
    })
  }

  useEffect(() => {
    if (!editingRenewal) return
    if (!editForm.membershipType || !memberships.length) return
    const m = memberships.find((x) => x.membershipId.toString() === editForm.membershipType)
    if (m) {
      const fee = m.price ?? 0
      const disc = parseFloat(editForm.discount) || 0
      setEditForm((prev) => ({ ...prev, membershipFee: fee.toString(), paidAmount: (fee - disc).toString() }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm.membershipType, editForm.discount, memberships])

  useEffect(() => {
    if (!editingRenewal) return
    if (!editForm.joiningDate || !editForm.membershipType || !memberships.length) return
    const m = memberships.find((x) => x.membershipId.toString() === editForm.membershipType)
    if (m?.durationDays) {
      const d = new Date(editForm.joiningDate)
      d.setDate(d.getDate() + m.durationDays)
      setEditForm((prev) => ({ ...prev, expiryDate: d.toISOString().split('T')[0] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm.joiningDate, editForm.membershipType, memberships])

  const handleEditFormChange = (e: any) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditRenewalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRenewal || !client) return
    setSavingRenewal(true)
    try {
      const res = await fetch(`/api/renewals/${editingRenewal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipType: editForm.membershipType,
          joiningDate: editForm.joiningDate || undefined,
          expiryDate: editForm.expiryDate || undefined,
          membershipFee: editForm.membershipFee ? parseFloat(editForm.membershipFee) : undefined,
          discount: parseFloat(editForm.discount) || 0,
          paidAmount: editForm.paidAmount ? parseFloat(editForm.paidAmount) : undefined,
          paymentDate: editForm.paymentDate || undefined,
          paymentMode: editForm.paymentMode || undefined,
          transactionId: editForm.transactionId || undefined,
        }),
      })
      if (res.ok) {
        await fetchRenewals(client.clientId)
        await fetchClient()
        setEditingRenewal(null)
      } else {
        const err = await res.json().catch(() => null)
        alert(err?.error || 'Failed to update renewal')
      }
    } catch (err) {
      console.error('Error updating renewal:', err)
      alert('Failed to update renewal')
    } finally {
      setSavingRenewal(false)
    }
  }

  const handleDeleteRenewal = async (renewal: Renewal) => {
    if (!client) return
    if (!confirm('Are you sure you want to delete this renewal?')) return
    setDeletingRenewal(true)
    try {
      const res = await fetch(`/api/renewals/${renewal._id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchRenewals(client.clientId)
        await fetchClient()
        if (editingRenewal && editingRenewal._id === renewal._id) {
          setEditingRenewal(null)
        }
      } else {
        const err = await res.json().catch(() => null)
        alert(err?.error || 'Failed to delete renewal')
      }
    } catch (err) {
      console.error('Error deleting renewal:', err)
      alert('Failed to delete renewal')
    } finally {
      setDeletingRenewal(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <PageLoader message="Loading client..." />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-luxury-surface border border-luxury-border rounded-xl p-12 text-center">
          <h2 className="text-xl font-semibold text-luxury-text mb-4">Client not found</h2>
          <Link href="/clients" className="text-gold hover:text-gold-light text-sm">← Back to Clients</Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A'
    return `₹${amount.toFixed(2)}`
  }

  const getRenewalStatus = (expiryDate?: string) => {
    if (!expiryDate) return 'No membership expiry set'
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0)
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`
    if (diffDays === 0) return 'Expires today'
    return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`
  }

  const getRenewalStatusColor = (expiryDate?: string) => {
    if (!expiryDate) return 'text-luxury-muted'
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0)
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 7) return 'text-green-400'
    if (diffDays >= 0) return 'text-orange-400'
    return 'text-red-400'
  }

  // Shared styles
  const cardCls = "bg-luxury-surface border border-luxury-border rounded-xl p-6"
  const sectionTitleCls = "text-sm font-bold text-gold uppercase tracking-widest mb-4 flex items-center gap-2"
  const labelCls = "text-xs font-medium text-luxury-muted uppercase tracking-wider"
  const valueCls = "text-luxury-text text-sm mt-0.5"
  const modalInputCls = "w-full px-3 py-2 bg-luxury-card border border-luxury-border rounded-lg text-luxury-text placeholder-luxury-subtle focus:outline-none focus:border-gold/50 text-sm"
  const modalLabelCls = "block text-xs font-medium text-luxury-muted uppercase tracking-wider mb-1"

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-start gap-4">
          <Link href="/clients"
            className="mt-1 p-2 rounded-lg border border-luxury-border text-luxury-muted hover:border-gold/40 hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Client Profile</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-luxury-text">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-luxury-muted text-sm mt-1">ID: {client.clientId}</p>
          </div>
        </div>
        <Link href={`/clients/${clientId}/edit`}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-luxury-black text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors">
          <Edit className="w-4 h-4" />
          Edit Client
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className={cardCls}>
            {/* Photo */}
            <div className="flex justify-center mb-6">
              {client.photoUrl ? (
                <img
                  src={client.photoUrl}
                  alt={`${client.firstName} ${client.lastName}`}
                  className="w-44 h-44 object-cover rounded-xl border-2 border-gold/30 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-44 h-44 bg-gold/10 rounded-xl border-2 border-gold/20 flex items-center justify-center ${client.photoUrl ? 'hidden' : ''}`}>
                <Users className="w-20 h-20 text-gold/30" />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold/60 shrink-0" />
                  <span className="text-sm text-luxury-muted">{client.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold/60 shrink-0" />
                <span className="text-sm text-luxury-muted">{client.phone}</span>
              </div>
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-luxury-muted">{client.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className={cardCls}>
            <h2 className={sectionTitleCls}>
              <User className="w-4 h-4" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className={labelCls}>Date of Birth</p><p className={valueCls}>{formatDate(client.dateOfBirth)}</p></div>
              {client.age && <div><p className={labelCls}>Age</p><p className={valueCls}>{client.age} years</p></div>}
              {client.gender && <div><p className={labelCls}>Gender</p><p className={valueCls}>{client.gender}</p></div>}
              {client.bloodGroup && <div><p className={labelCls}>Blood Group</p><p className={valueCls}>{client.bloodGroup}</p></div>}
              {client.height && <div><p className={labelCls}>Height</p><p className={valueCls}>{client.height} cm</p></div>}
              {client.weight && <div><p className={labelCls}>Weight</p><p className={valueCls}>{client.weight} kg</p></div>}
              {client.bmi && <div><p className={labelCls}>BMI</p><p className={valueCls}>{client.bmi.toFixed(2)}</p></div>}
              {client.aadharNumber && <div><p className={labelCls}>Aadhar Number</p><p className={valueCls}>{client.aadharNumber}</p></div>}
            </div>
          </div>

          {/* Membership Information */}
          <div className={cardCls}>
            <h2 className={sectionTitleCls}>
              <CreditCard className="w-4 h-4" /> Membership Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={labelCls}>Membership Type</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-gold/10 text-gold border border-gold/20">
                  {client.membershipName || 'N/A'}
                </span>
              </div>
              <div><p className={labelCls}>Joining Date</p><p className={valueCls}>{formatDate(client.joiningDate)}</p></div>
              <div><p className={labelCls}>Expiry Date</p><p className={valueCls}>{formatDate(client.expiryDate)}</p></div>
              <div>
                <p className={labelCls}>Renewal Status</p>
                <p className={`text-sm font-semibold mt-0.5 ${getRenewalStatusColor(client.expiryDate)}`}>
                  {getRenewalStatus(client.expiryDate)}
                </p>
              </div>
              <div><p className={labelCls}>Membership Fee</p><p className={valueCls}>{formatCurrency(client.membershipFee)}</p></div>
              {client.discount && client.discount > 0 && (
                <div><p className={labelCls}>Discount</p><p className="text-green-400 text-sm mt-0.5">{formatCurrency(client.discount)}</p></div>
              )}
              <div>
                <p className={labelCls}>Paid Amount</p>
                <p className={`text-sm mt-0.5 ${client.paidAmount && client.membershipFee && client.paidAmount < (client.membershipFee - (client.discount || 0)) ? 'text-red-400 font-semibold' : 'text-luxury-text'}`}>
                  {formatCurrency(client.paidAmount)}
                </p>
              </div>
              {client.paymentDate && <div><p className={labelCls}>Payment Date</p><p className={valueCls}>{formatDate(client.paymentDate)}</p></div>}
              {client.paymentMode && <div><p className={labelCls}>Payment Mode</p><p className={valueCls}>{client.paymentMode}</p></div>}
              {client.transactionId && (
                <div><p className={labelCls}>Transaction ID</p><p className="text-luxury-muted text-sm font-mono mt-0.5">{client.transactionId}</p></div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={cardCls}>
            <h2 className={sectionTitleCls}>
              <Phone className="w-4 h-4" /> Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className={labelCls}>Contact Name</p><p className={valueCls}>{client.emergencyContactName}</p></div>
              <div><p className={labelCls}>Contact Phone</p><p className={valueCls}>{client.emergencyContactPhone}</p></div>
            </div>
          </div>

          {/* Renewal History */}
          <div className={cardCls}>
            <h2 className={sectionTitleCls}>
              <CreditCard className="w-4 h-4" /> Renewal History
            </h2>
            {renewalsLoading ? (
              <p className="text-sm text-luxury-muted">Loading renewals...</p>
            ) : renewals.length === 0 ? (
              <p className="text-sm text-luxury-muted">No renewals recorded for this client.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-luxury-border">
                      <th className="py-2 pr-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">Plan</th>
                      <th className="py-2 pr-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">Start</th>
                      <th className="py-2 pr-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">Expiry</th>
                      <th className="py-2 pr-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">Paid</th>
                      <th className="py-2 pr-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">Payment Date</th>
                      <th className="py-2 text-right text-xs font-semibold text-gold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-border">
                    {renewals.map((r) => (
                      <tr key={r._id} className="hover:bg-luxury-card/40 transition-colors">
                        <td className="py-3 pr-4 text-luxury-text">{r.membershipName || r.membershipType || 'N/A'}</td>
                        <td className="py-3 pr-4 text-luxury-muted">{r.joiningDate ? formatDate(r.joiningDate) : 'N/A'}</td>
                        <td className="py-3 pr-4 text-luxury-muted">{r.expiryDate ? formatDate(r.expiryDate) : 'N/A'}</td>
                        <td className="py-3 pr-4 text-luxury-muted">{r.paidAmount != null ? formatCurrency(r.paidAmount) : 'N/A'}</td>
                        <td className="py-3 pr-4 text-luxury-muted">{r.paymentDate ? formatDate(r.paymentDate) : 'N/A'}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button type="button" onClick={() => openEditRenewal(r)} title="Edit renewal"
                              className="p-1.5 rounded-lg text-luxury-muted hover:text-gold hover:bg-gold/10 transition-colors">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => handleDeleteRenewal(r)} disabled={deletingRenewal} title="Delete renewal"
                              className="p-1.5 rounded-lg text-luxury-muted hover:text-red-400 hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Health & Fitness */}
          {(client.medicalConditions || client.fitnessGoals || client.firstTimeInGym || client.previousGymDetails) && (
            <div className={cardCls}>
              <h2 className={sectionTitleCls}>
                <Activity className="w-4 h-4" /> Health & Fitness
              </h2>
              <div className="space-y-4">
                {client.medicalConditions && (
                  <div><p className={labelCls}>Medical Conditions</p><p className="text-luxury-text text-sm mt-1">{client.medicalConditions}</p></div>
                )}
                {client.fitnessGoals && (
                  <div><p className={labelCls}>Fitness Goals</p><p className="text-luxury-text text-sm mt-1">{client.fitnessGoals}</p></div>
                )}
                {client.firstTimeInGym && (
                  <div><p className={labelCls}>First Time in Gym</p><p className="text-luxury-text text-sm mt-1">{client.firstTimeInGym}</p></div>
                )}
                {client.previousGymDetails && (
                  <div><p className={labelCls}>Previous Gym Details</p><p className="text-luxury-text text-sm mt-1">{client.previousGymDetails}</p></div>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className={cardCls}>
            <h2 className={sectionTitleCls}>
              <FileText className="w-4 h-4" /> Account Information
            </h2>
            <div>
              <p className={labelCls}>Registered On</p>
              <p className={valueCls}>{formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Renewal Modal */}
      {editingRenewal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => !savingRenewal && setEditingRenewal(null)}>
          <div className="bg-luxury-surface border border-luxury-border rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-bold text-luxury-text">Edit Renewal</h2>
                <button type="button" onClick={() => !savingRenewal && setEditingRenewal(null)}
                  className="p-1.5 rounded-lg hover:bg-luxury-elevated text-luxury-muted hover:text-luxury-text transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-luxury-muted mb-6">
                {client.firstName} {client.lastName} <span className="text-luxury-subtle">· ID {client.clientId}</span>
              </p>
              <form onSubmit={handleEditRenewalSubmit} className="space-y-4">
                <div>
                  <label className={modalLabelCls}>Subscription <span className="text-red-400">*</span></label>
                  <select name="membershipType" value={editForm.membershipType} onChange={handleEditFormChange} required className={modalInputCls}>
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
                    <label className={modalLabelCls}>Start Date</label>
                    <input type="date" name="joiningDate" value={editForm.joiningDate} onChange={handleEditFormChange} className={modalInputCls} />
                  </div>
                  <div>
                    <label className={modalLabelCls}>Expiry Date</label>
                    <input type="date" name="expiryDate" value={editForm.expiryDate} onChange={handleEditFormChange} className={modalInputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={modalLabelCls}>Membership Fee (₹)</label>
                    <input type="number" name="membershipFee" value={editForm.membershipFee} onChange={handleEditFormChange} min="0" step="0.01" className={modalInputCls} />
                  </div>
                  <div>
                    <label className={modalLabelCls}>Discount (₹)</label>
                    <input type="number" name="discount" value={editForm.discount} onChange={handleEditFormChange} min="0" step="0.01" className={modalInputCls} />
                  </div>
                </div>
                <div>
                  <label className={modalLabelCls}>Paid Amount (₹)</label>
                  <input type="number" name="paidAmount" value={editForm.paidAmount} onChange={handleEditFormChange} min="0" step="0.01" placeholder="0.00" className={modalInputCls} />
                </div>
                <div>
                  <label className={modalLabelCls}>Payment Date</label>
                  <input type="date" name="paymentDate" value={editForm.paymentDate} onChange={handleEditFormChange} className={modalInputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={modalLabelCls}>Payment Mode</label>
                    <select name="paymentMode" value={editForm.paymentMode} onChange={handleEditFormChange} className={modalInputCls}>
                      <option value="">Select</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className={modalLabelCls}>Transaction ID</label>
                    <input type="text" name="transactionId" value={editForm.transactionId} onChange={handleEditFormChange} placeholder="Optional" className={modalInputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => !savingRenewal && setEditingRenewal(null)}
                    className="flex-1 px-4 py-2.5 border border-luxury-border rounded-lg text-sm font-medium text-luxury-muted hover:border-luxury-elevated hover:text-luxury-text transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingRenewal || !editForm.membershipType}
                    className="flex-1 px-4 py-2.5 bg-gold text-luxury-black rounded-lg text-sm font-semibold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {savingRenewal ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
