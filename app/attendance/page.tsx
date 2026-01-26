'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle, X } from 'lucide-react'

interface ClientInfo {
  clientId: string
  firstName: string
  lastName: string
  photoUrl?: string
}

interface SuccessData {
  status: 'IN' | 'OUT'
  inTime: string
  outTime?: string
  duration?: string
  client: ClientInfo
}

export default function AttendancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    time: '',
  })

  // Pre-populate date and time with current values
  useEffect(() => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5) // HH:MM format
    
    setFormData(prev => ({
      ...prev,
      date: currentDate,
      time: currentTime,
    }))
  }, [])

  // Auto-close modal after 5 seconds
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false)
      }, 5000) // 5 seconds

      return () => clearTimeout(timer)
    }
  }, [showModal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error and success messages when user types
    if (error) setError('')
    if (successData) {
      setSuccessData(null)
      setShowModal(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessData(null)
    setShowModal(false)

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          attendanceDate: formData.date,
          attendanceTime: formData.time,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Fetch client info to show in modal
        const clientResponse = await fetch(`/api/clients/${formData.clientId}`)
        let client: ClientInfo | null = null
        
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          client = {
            clientId: clientData.clientId.toString(),
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            photoUrl: clientData.photoUrl,
          }
        }
        
        // Set success data with attendance and client info
        setSuccessData({
          status: data.status || 'IN',
          inTime: data.inTime,
          outTime: data.outTime,
          duration: data.duration,
          client: client || {
            clientId: formData.clientId,
            firstName: '',
            lastName: 'Client',
            photoUrl: undefined,
          },
        })
        setShowModal(true)
        
        // Reset form and refresh date/time to current values
        const now = new Date()
        const currentDate = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().split(' ')[0].slice(0, 5)
        
        setFormData({
          clientId: '',
          date: currentDate,
          time: currentTime,
        })
      } else {
        // Show user-friendly error message
        let errorMessage = data.error || 'Failed to record attendance'
        
        // Add hint if available
        if (data.hint) {
          errorMessage += ` ${data.hint}`
        }
        
        // Special handling for client not found
        if (response.status === 404 && data.clientId) {
          errorMessage = `Client ID ${data.clientId} not found. Please verify the client ID exists in the system.`
        }
        
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Error recording attendance:', err)
      setError('An error occurred while recording attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Record Attendance</h1>
          <p className="text-gray-600 text-sm sm:text-base">Capture client attendance with date and time</p>
        </div>
        <Link
          href="/attendance/list"
          className="text-fitura-blue hover:text-fitura-magenta font-medium flex items-center gap-2 text-sm sm:text-base"
        >
          View Attendance List →
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client ID */}
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
              placeholder="Enter client ID"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Enter the client&apos;s ID. First entry for the day = IN, second entry = OUT</p>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Attendance date (pre-populated with today&apos;s date)</p>
          </div>

          {/* Time */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Attendance time (pre-populated with current time)</p>
          </div>


          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-fitura-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              {loading ? 'Recording...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>

            {/* Client Photo */}
            <div className="flex justify-center mb-4">
              {successData.client.photoUrl ? (
                <img
                  src={successData.client.photoUrl}
                  alt={`${successData.client.firstName} ${successData.client.lastName}`}
                  className="w-[350px] h-[350px] object-cover rounded-lg border-4 border-green-200 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-[350px] h-[350px] bg-gray-200 rounded-lg border-4 border-green-200 shadow-lg flex items-center justify-center">
                  <span className="text-gray-400 text-6xl font-semibold">
                    {successData.client.firstName?.[0] || successData.client.clientId[0] || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Client Name */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {successData.client.firstName && successData.client.lastName
                  ? `${successData.client.firstName} ${successData.client.lastName}`
                  : `Client ID: ${successData.client.clientId}`}
              </h3>
              {successData.client.firstName && successData.client.lastName && (
                <p className="text-sm text-gray-500">ID: {successData.client.clientId}</p>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-4">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  successData.status === 'IN'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {successData.status === 'IN' ? '✓ Checked IN' : '✓ Checked OUT'}
              </span>
            </div>

            {/* Time Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">IN Time:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(`2000-01-01T${successData.inTime}`).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {successData.outTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">OUT Time:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(`2000-01-01T${successData.outTime}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {successData.duration && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="font-bold text-blue-600">{successData.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            <p className="text-center text-sm text-gray-600 mb-4">
              Attendance recorded successfully! The system will automatically toggle between IN and OUT for the same member on the same day.
            </p>

            {/* OK Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-fitura-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

