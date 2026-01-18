'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Trash2, Plus, X } from 'lucide-react'

interface Attendance {
  id: string
  clientId: string
  clientName?: string
  attendanceDate: string
  inTime: string
  outTime?: string
  status: 'IN' | 'OUT'
  duration?: string
  createdAt: string
}

export default function AttendanceListPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterClientId, setFilterClientId] = useState('')

  useEffect(() => {
    fetchAttendance()
  }, [filterDate, filterClientId])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterDate) params.append('date', filterDate)
      if (filterClientId) params.append('clientId', filterClientId)
      
      const url = params.toString() 
        ? `/api/attendance?${params.toString()}`
        : '/api/attendance'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAttendance(attendance.filter(record => record.id !== id))
      } else {
        alert('Failed to delete attendance record')
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
      alert('An error occurred while deleting the attendance record')
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Attendance List</h1>
          <p className="text-gray-600 text-sm sm:text-base">View and manage client attendance records</p>
        </div>
        <Link
          href="/attendance"
          className="bg-fitura-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Record Attendance</span>
          <span className="sm:hidden">Record</span>
        </Link>
      </div>


      {attendance.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <div className="flex flex-col gap-2">
                      <span>Client ID</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={filterClientId}
                          onChange={(e) => setFilterClientId(e.target.value)}
                          placeholder="Filter..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-fitura-purple-500 focus:border-transparent"
                        />
                        {filterClientId && (
                          <button
                            onClick={() => setFilterClientId('')}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Clear filter"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col gap-2">
                      <span>Date</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-fitura-purple-500 focus:border-transparent"
                        />
                        {filterDate && (
                          <button
                            onClick={() => setFilterDate('')}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            title="Clear filter"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <span>Time</span>
                      <span className="text-xs font-normal text-gray-400">IN / OUT</span>
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Duration</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Recorded At</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{record.clientId}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900">
                      <div className="flex flex-col">
                        <span>{record.clientName || 'N/A'}</span>
                        <span className="text-xs text-gray-500 sm:hidden">ID: {record.clientId}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{formatDate(record.attendanceDate)}</span>
                        <span className="text-xs md:hidden">
                          <span className="text-green-600">IN: {formatTime(record.inTime)}</span>
                          {record.outTime && (
                            <span className="text-red-600 ml-2">OUT: {formatTime(record.outTime)}</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-green-600 font-medium">IN: {formatTime(record.inTime)}</span>
                        {record.outTime && (
                          <span className="text-red-600 font-medium">OUT: {formatTime(record.outTime)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {record.duration ? (
                        <span className="font-semibold text-blue-600">{record.duration}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(record.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
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
            <Clock className="w-24 h-24 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {filterDate || filterClientId 
              ? 'No attendance records found' 
              : 'No attendance records yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {filterDate || filterClientId
              ? 'Try adjusting your filters or clear them to see all records'
              : 'Get started by recording your first attendance'}
          </p>
          <Link
            href="/attendance"
            className="bg-fitura-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors inline-block"
          >
            Record Attendance
          </Link>
        </div>
      )}
    </div>
  )
}

