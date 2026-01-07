'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Client {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  membershipType: string
  membershipName?: string
  expiryDate?: string
  membershipFee?: number
  discount?: number
  paidAmount?: number
  createdAt: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/clients/${id}/edit`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setClients(clients.filter(client => client.id !== id))
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Clients</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your gym members</p>
        </div>
        <Link
          href="/clients/new"
          className="bg-fitura-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors text-center text-sm sm:text-base"
        >
          + Register New Client
        </Link>
      </div>

      {clients.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Expiry Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Membership</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Registered</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.id}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{client.email}</div>
                      <div className="text-xs text-gray-500">{client.phone}</div>
                      <div className="text-xs text-gray-500 md:hidden mt-1">
                        Expiry: {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 lg:hidden md:block mt-1">
                        {client.membershipName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const membershipFee = client.membershipFee || 0
                        const discount = client.discount || 0
                        const finalAmount = membershipFee - discount
                        const paidAmount = client.paidAmount || 0
                        const isLessThanFinal = paidAmount < finalAmount && finalAmount > 0
                        
                        return (
                          <span className={isLessThanFinal ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                            {client.paidAmount !== undefined ? `₹${client.paidAmount.toFixed(2)}` : 'N/A'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-fitura-purple-100 text-fitura-purple-800">
                        {client.membershipName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => handleEdit(client.id)}
                          className="text-fitura-blue hover:text-fitura-magenta transition-colors p-1 rounded hover:bg-fitura-blue/10"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="mb-4 flex justify-center opacity-50">
            <Users className="w-24 h-24 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-6">Get started by registering your first client</p>
          <Link
            href="/clients/new"
            className="bg-fitura-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors inline-block"
          >
            Register New Client
          </Link>
        </div>
      )}
    </div>
  )
}

