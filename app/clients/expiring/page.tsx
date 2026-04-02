'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Edit,
  Trash2,
  X,
  FileText,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import PageLoader from '@/components/PageLoader'
import { useRouter, useSearchParams } from 'next/navigation'
import { openReceiptPrint } from '@/lib/receipt'

const PAGE_SIZES = [20, 50, 100]

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

export default function ExpiringClientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gym = searchParams.get('gym') || ''
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)

  useEffect(() => {
    fetchClients()
  }, [page, limit, gym])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (gym.trim()) params.set('gym', gym.trim())
      const response = await fetch(`/api/clients/expiring?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 0)
      } else {
        setClients([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Error fetching expiring clients:', error)
      setClients([])
      setTotal(0)
      setTotalPages(0)
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
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setClients(clients.filter(client => client.clientId !== clientId))
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const isPaidClient = (client: Client) => {
    const paidAmount = client.paidAmount ?? 0
    return paidAmount > 0
  }

  const handleDownloadReceipt = (client: Client) => {
    openReceiptPrint(client)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <PageLoader message="Loading expiring clients..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Link
            href={gym ? `/dashboard?gym=${encodeURIComponent(gym)}` : '/dashboard'}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Expiring Clients</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Memberships expiring in the current calendar month (IST)
          </p>
          {gym ? (
            <p className="text-sm text-gray-500 mt-1">Gym: {gym}</p>
          ) : null}
        </div>
        <Link
          href="/clients"
          className="bg-fitura-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors text-center text-sm sm:text-base"
        >
          All Clients
        </Link>
      </div>

      {clients.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 sm:px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
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
                  <tr key={client.clientId} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.clientId}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        {client.photoUrl ? (
                          <img
                            src={client.photoUrl}
                            alt={`${client.firstName} ${client.lastName}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage({
                              url: client.photoUrl!,
                              name: `${client.firstName} ${client.lastName}`
                            })}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = parent.querySelector('.avatar-fallback') as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`avatar-fallback w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-fitura-blue/10 flex items-center justify-center ${client.photoUrl ? 'hidden' : ''}`}
                        >
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-fitura-blue" />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <Link
                        href={`/clients/${client.clientId}`}
                        className="text-sm font-semibold text-gray-900 hover:text-fitura-blue transition-colors cursor-pointer block"
                      >
                        {client.firstName} {client.lastName}
                      </Link>
                      <div className="text-xs text-gray-500">{client.email}</div>
                      <div className="text-xs text-gray-500">{client.phone}</div>
                      <div className="text-xs text-gray-500 md:hidden mt-1">
                        Expiry: {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 lg:hidden md:block mt-1">
                        {client.membershipName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium hidden md:table-cell">
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
                        {isPaidClient(client) && (
                          <button
                            onClick={() => handleDownloadReceipt(client)}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                            title="Download Receipt"
                          >
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(client.clientId)}
                          className="text-fitura-blue hover:text-fitura-magenta transition-colors p-1 rounded hover:bg-fitura-blue/10"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.clientId)}
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
          <div className="px-3 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={page >= (totalPages || 1)}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages || 1)}
              disabled={page >= (totalPages || 1)}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="mb-4 flex justify-center opacity-50">
            <Clock className="w-24 h-24 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No clients expiring this month</h3>
          <p className="text-gray-500 mb-6">Clients with expiry in the current month will appear here</p>
          <Link
            href={gym ? `/dashboard?gym=${encodeURIComponent(gym)}` : '/dashboard'}
            className="bg-fitura-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[90vh]"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white px-4 py-2 rounded-lg">
              <p className="text-lg font-semibold">{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
