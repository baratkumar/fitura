'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Edit, Trash2 } from 'lucide-react'

interface Membership {
  membershipId: number // Primary identifier - no MongoDB _id exposed
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
          durationDays: parseInt(formData.durationMonths) * 30, // Convert months to days
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
      durationMonths: Math.round(membership.durationDays / 30).toString(), // Convert days to months
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
    setFormData({
      name: '',
      description: '',
      durationMonths: '',
      price: '',
      isActive: true,
    })
    setEditingMembership(null)
    setShowForm(false)
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('membership')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'membership'
                ? 'border-fitura-purple-500 text-fitura-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Membership
          </button>
        </nav>
      </div>

      {/* Membership Tab Content */}
      {activeTab === 'membership' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Membership Types</h2>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-fitura-dark text-white px-4 py-2 rounded-lg font-semibold hover:bg-fitura-blue transition-colors"
            >
              + Add Membership
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingMembership ? 'Edit Membership' : 'Add New Membership'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={formData.durationMonths}
                      onChange={(e) =>
                        setFormData({ ...formData, durationMonths: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === 'active',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                    placeholder="Enter membership description..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-fitura-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-fitura-blue transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingMembership ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Memberships List */}
          {loading && !showForm ? (
            <div className="text-center py-12">Loading...</div>
          ) : memberships.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="mb-4 flex justify-center opacity-50">
                <CreditCard className="w-24 h-24 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No memberships yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first membership</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberships.map((membership) => (
                      <tr key={membership.membershipId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {membership.membershipId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {membership.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {membership.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(membership.durationDays / 30)} months
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {membership.price !== undefined
                            ? `₹${membership.price.toFixed(2)}`
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              membership.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {membership.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(membership)}
                              className="text-fitura-blue hover:text-fitura-magenta transition-colors p-1 rounded hover:bg-fitura-blue/10"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(membership.membershipId)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
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

