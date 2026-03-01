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
  gym?: string
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
      setEditForm((prev) => ({
        ...prev,
        membershipFee: fee.toString(),
        paidAmount: (fee - disc).toString(),
      }))
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
      const res = await fetch(`/api/renewals/${renewal._id}`, {
        method: 'DELETE',
      })
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
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Client not found</h2>
          <Link
            href="/clients"
            className="text-fitura-blue hover:text-fitura-magenta"
          >
            ← Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A'
    return `₹${amount.toFixed(2)}`
  }

  const getRenewalStatus = (expiryDate?: string) => {
    if (!expiryDate) return 'No membership expiry set'

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)

    const diffMs = expiry.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`
    }

    if (diffDays === 0) {
      return 'Expires today'
    }

    const daysAgo = Math.abs(diffDays)
    return `Expired ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Client ID: {client.clientId}</p>
          </div>
        </div>
        <Link
          href={`/clients/${clientId}/edit`}
          className="bg-fitura-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Client
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Photo and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              {client.photoUrl ? (
                <img
                  src={client.photoUrl}
                  alt={`${client.firstName} ${client.lastName}`}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-gray-200 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className={`w-48 h-48 bg-gray-200 rounded-lg border-4 border-gray-200 shadow-lg flex items-center justify-center ${client.photoUrl ? 'hidden' : ''}`}
              >
                <Users className="w-24 h-24 text-gray-400" />
              </div>
            </div>

            {/* Basic Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-fitura-blue" />
                <span className="text-sm">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-fitura-blue" />
                <span className="text-sm">{client.phone}</span>
              </div>
              {client.address && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-fitura-blue mt-0.5" />
                  <span className="text-sm">{client.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-fitura-blue" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(client.gym || 'Rival Fitness Studio I') && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Gym</label>
                  <p className="text-gray-900">{client.gym || 'Rival Fitness Studio I'}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                <p className="text-gray-900">{formatDate(client.dateOfBirth)}</p>
              </div>
              {client.age && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Age</label>
                  <p className="text-gray-900">{client.age} years</p>
                </div>
              )}
              {client.gender && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                  <p className="text-gray-900">{client.gender}</p>
                </div>
              )}
              {client.bloodGroup && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Blood Group</label>
                  <p className="text-gray-900">{client.bloodGroup}</p>
                </div>
              )}
              {client.height && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Height</label>
                  <p className="text-gray-900">{client.height} cm</p>
                </div>
              )}
              {client.weight && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Weight</label>
                  <p className="text-gray-900">{client.weight} kg</p>
                </div>
              )}
              {client.bmi && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">BMI</label>
                  <p className="text-gray-900">{client.bmi.toFixed(2)}</p>
                </div>
              )}
              {client.aadharNumber && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Aadhar Number</label>
                  <p className="text-gray-900">{client.aadharNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Membership Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-fitura-blue" />
              Membership Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Membership Type</label>
                <p className="text-gray-900">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-fitura-purple-100 text-fitura-purple-800">
                    {client.membershipName || 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Joining Date</label>
                <p className="text-gray-900">{formatDate(client.joiningDate)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Expiry Date</label>
                <p className="text-gray-900">{formatDate(client.expiryDate)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Renewal Status</label>
                <p
                  className={`text-sm font-semibold ${
                    client.expiryDate
                      ? (() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const expiry = new Date(client.expiryDate!)
                          expiry.setHours(0, 0, 0, 0)
                          const diffMs = expiry.getTime() - today.getTime()
                          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
                          if (diffDays > 7) return 'text-green-600'
                          if (diffDays >= 0) return 'text-orange-600'
                          return 'text-red-600'
                        })()
                      : 'text-gray-500'
                  }`}
                >
                  {getRenewalStatus(client.expiryDate)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Membership Fee</label>
                <p className="text-gray-900">{formatCurrency(client.membershipFee)}</p>
              </div>
              {client.discount && client.discount > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Discount</label>
                  <p className="text-gray-900 text-green-600">{formatCurrency(client.discount)}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Paid Amount</label>
                <p className={`text-gray-900 ${client.paidAmount && client.membershipFee && client.paidAmount < (client.membershipFee - (client.discount || 0)) ? 'text-red-600 font-semibold' : ''}`}>
                  {formatCurrency(client.paidAmount)}
                </p>
              </div>
              {client.paymentDate && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Payment Date</label>
                  <p className="text-gray-900">{formatDate(client.paymentDate)}</p>
                </div>
              )}
              {client.paymentMode && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Payment Mode</label>
                  <p className="text-gray-900">{client.paymentMode}</p>
                </div>
              )}
              {client.transactionId && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Transaction ID</label>
                  <p className="text-gray-900 font-mono text-sm">{client.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-fitura-blue" />
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Contact Name</label>
                <p className="text-gray-900">{client.emergencyContactName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Contact Phone</label>
                <p className="text-gray-900">{client.emergencyContactPhone}</p>
              </div>
            </div>
          </div>

          {/* Renewal History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-fitura-blue" />
              Renewal History
            </h2>
            {renewalsLoading ? (
              <p className="text-sm text-gray-500">Loading renewals...</p>
            ) : renewals.length === 0 ? (
              <p className="text-sm text-gray-500">No renewals recorded for this client.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase border-b">
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Start</th>
                      <th className="py-2 pr-4">Expiry</th>
                      <th className="py-2 pr-4">Paid</th>
                      <th className="py-2 pr-4">Payment Date</th>
                      <th className="py-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewals.map((r) => (
                      <tr key={r._id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          {r.membershipName || r.membershipType || 'N/A'}
                        </td>
                        <td className="py-2 pr-4">
                          {r.joiningDate ? formatDate(r.joiningDate) : 'N/A'}
                        </td>
                        <td className="py-2 pr-4">
                          {r.expiryDate ? formatDate(r.expiryDate) : 'N/A'}
                        </td>
                        <td className="py-2 pr-4">
                          {r.paidAmount != null ? formatCurrency(r.paidAmount) : 'N/A'}
                        </td>
                        <td className="py-2 pr-4">
                          {r.paymentDate ? formatDate(r.paymentDate) : 'N/A'}
                        </td>
                        <td className="py-2 pr-0 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditRenewal(r)}
                              className="p-1 rounded hover:bg-gray-100 text-fitura-blue"
                              title="Edit renewal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRenewal(r)}
                              className="p-1 rounded hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={deletingRenewal}
                              title="Delete renewal"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Health & Fitness Information */}
          {(client.medicalConditions || client.fitnessGoals || client.firstTimeInGym || client.previousGymDetails) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-fitura-blue" />
                Health & Fitness Information
              </h2>
              <div className="space-y-4">
                {client.medicalConditions && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Medical Conditions</label>
                    <p className="text-gray-900 mt-1">{client.medicalConditions}</p>
                  </div>
                )}
                {client.fitnessGoals && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Fitness Goals</label>
                    <p className="text-gray-900 mt-1">{client.fitnessGoals}</p>
                  </div>
                )}
                {client.firstTimeInGym && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">First Time in Gym</label>
                    <p className="text-gray-900 mt-1">{client.firstTimeInGym}</p>
                  </div>
                )}
                {client.previousGymDetails && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Previous Gym Details</label>
                    <p className="text-gray-900 mt-1">{client.previousGymDetails}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-fitura-blue" />
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Registered On</label>
                <p className="text-gray-900">{formatDate(client.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Renewal Modal */}
      {editingRenewal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => !savingRenewal && setEditingRenewal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Renewal</h2>
                <button
                  type="button"
                  onClick={() => !savingRenewal && setEditingRenewal(null)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                {client.firstName} {client.lastName} (ID: {client.clientId})
              </p>
              <form onSubmit={handleEditRenewalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="membershipType"
                    value={editForm.membershipType}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                  >
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={editForm.joiningDate}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={editForm.expiryDate}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membership Fee (₹)
                    </label>
                    <input
                      type="number"
                      name="membershipFee"
                      value={editForm.membershipFee}
                      onChange={handleEditFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={editForm.discount}
                      onChange={handleEditFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="paidAmount"
                    value={editForm.paidAmount}
                    onChange={handleEditFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={editForm.paymentDate}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      name="paymentMode"
                      value={editForm.paymentMode}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={editForm.transactionId}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => !savingRenewal && setEditingRenewal(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRenewal || !editForm.membershipType}
                    className="flex-1 px-4 py-2 bg-fitura-dark text-white rounded-lg font-medium hover:bg-fitura-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingRenewal ? 'Saving…' : 'Save'}
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
