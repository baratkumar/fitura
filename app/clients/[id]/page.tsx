'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Users, Mail, Phone, Calendar, MapPin, CreditCard, User, Heart, Activity, FileText } from 'lucide-react'
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

export default function ViewClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      } else if (response.status === 404) {
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    } finally {
      setLoading(false)
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
    </div>
  )
}
