'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Edit, Trash2, Plus, X, CheckCircle, Clock } from 'lucide-react'
import PageLoader from '@/components/PageLoader'

interface Membership {
  membershipId: number
  name: string
  description?: string
  durationDays: number
  price?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('membership')
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMonths: '',
    price: '',
    isActive: true,
  })

  useEffect(() => {
    fetchMemberships()
  }, [])

  const fetchMemberships = async () => {
    try {
      const response = await fetch('/api/memberships?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setMemberships(data)
      }
    } catch (error) {
      console.error('Error fetching memberships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingMembership
        ? `/api/memberships/${editingMembership.membershipId}`
        : '/api/memberships'
      const method = editingMembership ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          durationDays: parseInt(formData.durationMonths) * 30,
          price: formData.price ? parseFloat(formData.price) : null,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        await fetchMemberships()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save membership')
      }
    } catch (error) {
      console.error('Error saving membership:', error)
      alert('An error occurred while saving the membership')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership)
    setFormData({
      name: membership.name,
      description: membership.description || '',
      durationMonths: Math.round(membership.durationDays / 30).toString(),
      price: membership.price?.toString() || '',
      isActive: membership.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (membershipId: number) => {
    if (!confirm('Are you sure you want to delete this membership?')) return

    try {
      const response = await fetch(`/api/memberships/${membershipId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMemberships()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete membership')
      }
    } catch (error) {
      console.error('Error deleting membership:', error)
      alert('An error occurred while deleting the membership')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', durationMonths: '', price: '', isActive: true })
    setEditingMembership(null)
    setShowForm(false)
  }

  const inputCls = "w-full px-4 py-3 bg-luxury-card border border-luxury-border rounded-xl text-luxury-text text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors placeholder-luxury-subtle"
  const labelCls = "block text-xs font-semibold text-luxury-muted uppercase tracking-widest mb-2"

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Configuration</p>
          <h1 className="text-3xl sm:text-4xl font-black text-luxury-text">Settings</h1>
          <div className="mt-3 h-px w-12 bg-gold/40" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-luxury-border">
        <button
          onClick={() => setActiveTab('membership')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === 'membership'
              ? 'border-gold text-gold'
              : 'border-transparent text-luxury-muted hover:text-luxury-text'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Membership Types
        </button>
      </div>

      {/* Membership Tab */}
      {activeTab === 'membership' && (
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-luxury-text">Membership Plans</h2>
              <p className="text-xs text-luxury-muted mt-0.5">{memberships.length} plan{memberships.length !== 1 ? 's' : ''} configured</p>
            </div>
            {!showForm && (
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="flex items-center gap-2 bg-gold text-luxury-black px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Add Plan
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden mb-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-luxury-text">
                    {editingMembership ? 'Edit Membership Plan' : 'New Membership Plan'}
                  </h3>
                  <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-luxury-elevated text-luxury-muted hover:text-luxury-text transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Plan Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. Gold Monthly"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Duration (Months) <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={formData.durationMonths}
                        onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. 1"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <div className="flex gap-2 mt-1">
                        {(['active', 'inactive'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: s === 'active' })}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all capitalize ${
                              (s === 'active') === formData.isActive
                                ? 'bg-gold/10 border-gold/40 text-gold'
                                : 'bg-luxury-card border-luxury-border text-luxury-muted hover:border-luxury-muted'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={inputCls + ' resize-none'}
                      placeholder="Enter membership description..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-gold text-luxury-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all disabled:opacity-50 hover:shadow-[0_0_16px_rgba(212,175,55,0.3)]"
                    >
                      {loading ? 'Saving…' : editingMembership ? 'Update Plan' : 'Create Plan'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-luxury-muted border border-luxury-border hover:border-luxury-muted hover:text-luxury-text transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List */}
          {loading && !showForm ? (
            <PageLoader message="Loading memberships..." className="py-12" />
          ) : memberships.length === 0 ? (
            <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-xl bg-gold/5 border border-gold/20 flex items-center justify-center">
                    <CreditCard className="w-9 h-9 text-gold/50" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-luxury-text mb-2">No membership plans yet</h3>
                <p className="text-luxury-muted text-sm mb-6">Add your first membership plan to get started</p>
                <button
                  onClick={() => { resetForm(); setShowForm(true) }}
                  className="flex items-center gap-2 bg-gold text-luxury-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-luxury-border">
                      {['ID', 'Plan Name', 'Description', 'Duration', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gold uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-border">
                    {memberships.map((membership) => (
                      <tr key={membership.membershipId} className="hover:bg-luxury-elevated transition-colors group">
                        <td className="px-5 py-4 text-sm font-mono text-luxury-muted">{membership.membershipId}</td>
                        <td className="px-5 py-4 text-sm font-bold text-luxury-text">{membership.name}</td>
                        <td className="px-5 py-4 text-sm text-luxury-muted max-w-xs">
                          {membership.description || <span className="text-luxury-subtle">—</span>}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-luxury-text">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold/60" />
                            {Math.round(membership.durationDays / 30)} month{Math.round(membership.durationDays / 30) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-luxury-text">
                          {membership.price !== undefined
                            ? <span className="text-gold">₹{membership.price.toFixed(0)}</span>
                            : <span className="text-luxury-subtle">—</span>}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            membership.isActive
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-luxury-card text-luxury-muted border-luxury-border'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${membership.isActive ? 'bg-green-400' : 'bg-luxury-muted'}`} />
                            {membership.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(membership)}
                              className="p-2 rounded-lg text-luxury-muted hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(membership.membershipId)}
                              className="p-2 rounded-lg text-luxury-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                              title="Delete"
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
