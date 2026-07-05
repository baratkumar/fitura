'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Edit,
  Trash2,
  FileText,
  UserX,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import PageLoader from '@/components/PageLoader'
import ClientNameWithAvatar from '@/components/ClientNameWithAvatar'
import ClientPhotoModal from '@/components/ClientPhotoModal'
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

export default function LapsedClientsPage() {
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
    setPage(1)
  }, [gym])

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
      const response = await fetch(`/api/clients/lapsed?${params.toString()}`)
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
      console.error('Error fetching lapsed clients:', error)
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
        setClients(clients.filter((client) => client.clientId !== clientId))
        setTotal((prev) => prev - 1)
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

  if (loading && clients.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <PageLoader message="Loading lapsed memberships..." />
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Lapsed Memberships</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Clients whose membership expiry date is before today (IST)
          </p>
          {gym ? <p className="text-sm text-gray-500 mt-1">Gym: {gym}</p> : null}
        </div>
        <Link
          href={gym ? `/clients?gym=${encodeURIComponent(gym)}` : '/clients'}
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Expired On
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Membership
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Registered
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.clientId} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <ClientNameWithAvatar
                        photoUrl={client.photoUrl}
                        firstName={client.firstName}
                        lastName={client.lastName}
                        clientId={client.clientId}
                        href={`/clients/${client.clientId}`}
                        onPhotoClick={
                          client.photoUrl
                            ? () =>
                                setSelectedImage({
                                  url: client.photoUrl!,
                                  name: `${client.firstName} ${client.lastName}`,
                                })
                            : undefined
                        }
                      >
                        <div className="text-xs text-gray-500">ID: {client.clientId}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                        <div className="text-xs text-gray-500">{client.phone}</div>
                        <div className="text-xs text-gray-500 md:hidden mt-1">
                          Expired:{' '}
                          {client.expiryDate
                            ? new Date(client.expiryDate).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 lg:hidden md:block mt-1">
                          {client.membershipName || 'N/A'}
                        </div>
                      </ClientNameWithAvatar>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium hidden md:table-cell">
                      {client.expiryDate
                        ? new Date(client.expiryDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {client.paidAmount !== undefined ? (
                        `₹${client.paidAmount.toFixed(2)}`
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
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
            <UserX className="w-24 h-24 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No lapsed memberships</h3>
          <p className="text-gray-500 mb-6">Clients with expired memberships will appear here</p>
          <Link
            href={gym ? `/dashboard?gym=${encodeURIComponent(gym)}` : '/dashboard'}
            className="bg-fitura-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      )}

      {selectedImage ? (
        <ClientPhotoModal
          url={selectedImage.url}
          name={selectedImage.name}
          onClose={() => setSelectedImage(null)}
        />
      ) : null}
    </div>
  )
}
