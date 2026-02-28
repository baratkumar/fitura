'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Edit, Trash2, X, FileText, Clock, ArrowLeft } from 'lucide-react'
import PageLoader from '@/components/PageLoader'
import { useRouter } from 'next/navigation'
import { openReceiptPrint } from '@/lib/receipt'

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
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients/expiring')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching expiring clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (clientId: number) => router.push(`/clients/${clientId}/edit`)

  const handleDelete = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      const response = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      if (response.ok) setClients(clients.filter(c => c.clientId !== clientId))
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const isPaidClient = (client: Client) => (client.paidAmount ?? 0) > 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <PageLoader message="Loading expiring clients..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <Link href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-muted hover:text-gold transition-colors mb-3 uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">Renewals Due</p>
          <h1 className="text-3xl sm:text-4xl font-black text-luxury-text">Expiring Clients</h1>
          <div className="mt-3 h-px w-12 bg-gold/40" />
          <p className="text-xs text-luxury-muted mt-2">Memberships expiring this week or next</p>
        </div>
        <Link href="/clients"
          className="flex items-center gap-2 bg-luxury-surface border border-luxury-border text-luxury-text px-4 py-2.5 rounded-xl font-bold text-sm hover:border-gold/40 hover:text-gold transition-all mt-1">
          All Clients
        </Link>
      </div>

      {clients.length > 0 ? (
        <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-border">
                  {['ID', 'Photo', 'Client', 'Expiry Date', 'Paid Amount', 'Membership', 'Registered', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-4 sm:px-5 py-3.5 text-left text-xs font-bold text-gold uppercase tracking-widest whitespace-nowrap ${
                      i === 5 ? 'hidden lg:table-cell' :
                      i === 6 ? 'hidden lg:table-cell' :
                      i === 3 ? 'hidden md:table-cell' : ''
                    }`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {clients.map((client) => {
                  const membershipFee = client.membershipFee || 0
                  const discount = client.discount || 0
                  const finalAmount = membershipFee - discount
                  const paidAmount = client.paidAmount || 0
                  const isShort = paidAmount < finalAmount && finalAmount > 0

                  return (
                    <tr key={client.clientId} className="hover:bg-luxury-elevated transition-colors group">
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm font-mono text-luxury-muted">{client.clientId}</td>
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                        <div className="relative">
                          {client.photoUrl ? (
                            <img
                              src={client.photoUrl}
                              alt={`${client.firstName} ${client.lastName}`}
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-luxury-border cursor-pointer hover:border-gold/40 transition-all"
                              onClick={() => setSelectedImage({ url: client.photoUrl!, name: `${client.firstName} ${client.lastName}` })}
                              onError={(e) => {
                                const t = e.target as HTMLImageElement
                                t.style.display = 'none'
                                const fb = t.parentElement?.querySelector('.avatar-fallback') as HTMLElement
                                if (fb) fb.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`avatar-fallback w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center ${client.photoUrl ? 'hidden' : ''}`}>
                            <Users className="w-5 h-5 text-luxury-muted" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <Link href={`/clients/${client.clientId}`}
                          className="text-sm font-bold text-luxury-text hover:text-gold transition-colors block">
                          {client.firstName} {client.lastName}
                        </Link>
                        {client.email && <div className="text-xs text-luxury-muted">{client.email}</div>}
                        <div className="text-xs text-luxury-muted">{client.phone}</div>
                        <div className="text-xs text-orange-400 md:hidden mt-0.5">
                          Exp: {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-luxury-subtle lg:hidden md:block mt-0.5">
                          {client.membershipName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm font-semibold text-orange-400 hidden md:table-cell">
                        {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={isShort ? 'text-red-400' : 'text-luxury-text'}>
                          {client.paidAmount !== undefined ? `₹${client.paidAmount.toFixed(0)}` : <span className="text-luxury-subtle">—</span>}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gold/10 text-gold border border-gold/20">
                          {client.membershipName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-xs text-luxury-muted hidden lg:table-cell">
                        {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isPaidClient(client) && (
                            <button
                              onClick={() => openReceiptPrint(client)}
                              className="p-2 rounded-lg text-luxury-muted hover:text-green-400 hover:bg-green-500/10 border border-transparent hover:border-green-500/20 transition-all"
                              title="Download Receipt"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(client.clientId)}
                            className="p-2 rounded-lg text-luxury-muted hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.clientId)}
                            className="p-2 rounded-lg text-luxury-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="relative bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-xl bg-gold/5 border border-gold/20 flex items-center justify-center">
                <Clock className="w-9 h-9 text-gold/50" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-luxury-text mb-2">All memberships are current</h3>
            <p className="text-luxury-muted text-sm mb-6">Memberships expiring in the next two weeks will appear here</p>
            <Link href="/dashboard"
              className="flex items-center gap-2 bg-gold text-luxury-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text rounded-full p-2 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto rounded-2xl shadow-2xl object-contain max-h-[85vh] border border-luxury-border"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div className="absolute bottom-3 left-3 right-3 bg-luxury-black/80 backdrop-blur-sm text-luxury-text px-4 py-2.5 rounded-xl border border-luxury-border">
              <p className="text-sm font-bold">{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
