'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  UserPlus, 
  User, 
  Wallet 
} from 'lucide-react'
import PageLoader from '@/components/PageLoader'

interface DashboardStats {
  todayRevenue: number
  todayClients: number
  todayAttendance: number
  expiringClientsThisWeek: number
  currentWeekRevenue: number
  currentWeekClients: number
  totalClients: number
  overallRevenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const cards: Array<{
    title: string
    value: string | number
    icon: typeof DollarSign
    color: string
    href?: string
  }> = [
    {
      title: "Today's Revenue",
      value: stats ? formatCurrency(stats.todayRevenue) : '₹0',
      icon: DollarSign,
      color: 'bg-fitura-blue',
    },
    {
      title: "Today's Clients",
      value: stats?.todayClients || 0,
      icon: Users,
      color: 'bg-fitura-purple-600',
    },
    {
      title: "Today's Attendance",
      value: stats?.todayAttendance || 0,
      icon: CheckCircle,
      color: 'bg-fitura-magenta',
    },
    {
      title: 'Expiring Clients This Week',
      value: stats?.expiringClientsThisWeek || 0,
      icon: Clock,
      color: 'bg-orange-500',
      href: '/clients/expiring',
    },
    {
      title: 'Current Week Revenue',
      value: stats ? formatCurrency(stats.currentWeekRevenue) : '₹0',
      icon: TrendingUp,
      color: 'bg-fitura-blue',
    },
    {
      title: 'Current Week Clients',
      value: stats?.currentWeekClients || 0,
      icon: UserPlus,
      color: 'bg-fitura-purple-600',
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: User,
      color: 'bg-fitura-magenta',
    },
    {
      title: 'Overall Revenue',
      value: stats ? formatCurrency(stats.overallRevenue) : '₹0',
      icon: Wallet,
      color: 'bg-green-500',
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <PageLoader message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Overview of your gym statistics</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon
          const href = card.href
          const content = (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </>
          )
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${href ? 'cursor-pointer' : ''}`}
            >
              {href ? (
                <Link href={href} className="block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
