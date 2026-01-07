'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AttendancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error and success messages when user types
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(formData.clientId),
          attendanceDate: formData.date,
          attendanceTime: formData.time,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Reset form and refresh date/time to current values
        const now = new Date()
        const currentDate = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().split(' ')[0].slice(0, 5)
        
        setFormData({
          clientId: '',
          date: currentDate,
          time: currentTime,
        })
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
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
              type="number"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
              placeholder="Enter client ID"
              required
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500">Enter the client&apos;s ID number</p>
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

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Attendance recorded successfully!</p>
            </div>
          )}

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
    </div>
  )
}

