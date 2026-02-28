'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign, Users, CheckCircle, Clock,
  TrendingUp, UserPlus, User, Wallet,
  Plus, ArrowUpRight, Dumbbell
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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [today] = useState(() =>
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  )

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) setStats(await res.json())
    } catch (e) {
      console.error('Error fetching dashboard stats:', e)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(n)

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <PageLoader message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <p className="text-xs text-luxury-muted tracking-widest uppercase">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-black text-luxury-text mt-1">
            {getGreeting()} <span className="text-gold">✦</span>
          </h1>
          <p className="text-sm text-luxury-subtle mt-1">Here's your gym at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/attendance"
            className="flex items-center gap-2 px-4 py-2.5 bg-luxury-surface border border-luxury-border rounded-xl text-sm font-medium text-luxury-muted hover:border-gold/40 hover:text-gold transition-all">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Attendance</span>
          </Link>
          <Link href="/clients/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-luxury-black rounded-xl text-sm font-bold hover:bg-gold-light transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]">
            <Plus className="w-4 h-4" />
            New Client
          </Link>
        </div>
      </div>

      {/* ── HERO REVENUE ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Today Revenue */}
        <div className="group relative bg-luxury-surface border border-luxury-border rounded-2xl p-8 overflow-hidden hover:border-gold/35 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-52 h-52 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)' }} />
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gold" />
            </div>
            <span className="text-[11px] font-semibold tracking-widest text-luxury-muted border border-luxury-border rounded-full px-3 py-1 uppercase">Today</span>
          </div>
          <p className="text-xs font-semibold text-luxury-muted uppercase tracking-widest mb-2">Revenue Collected</p>
          <p className="text-5xl sm:text-6xl font-black text-gold leading-none tracking-tight">
            {fmt(stats?.todayRevenue ?? 0)}
          </p>
        </div>

        {/* Overall Revenue */}
        <div className="group relative bg-luxury-surface border border-luxury-border rounded-2xl p-8 overflow-hidden hover:border-gold/35 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-52 h-52 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-gold" />
            </div>
            <span className="text-[11px] font-semibold tracking-widest text-luxury-muted border border-luxury-border rounded-full px-3 py-1 uppercase">All Time</span>
          </div>
          <p className="text-xs font-semibold text-luxury-muted uppercase tracking-widest mb-2">Overall Revenue</p>
          <p className="text-5xl sm:text-6xl font-black text-gold leading-none tracking-tight">
            {fmt(stats?.overallRevenue ?? 0)}
          </p>
        </div>
      </div>

      {/* ── TODAY'S ACTIVITY ── */}
      <div>
        <p className="text-[11px] font-semibold text-luxury-subtle uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-luxury-border" /> Today's Activity
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="group bg-luxury-surface border border-luxury-border rounded-2xl p-6 hover:border-gold/25 hover:bg-luxury-card transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-luxury-elevated border border-luxury-border flex items-center justify-center mb-5">
              <Users className="w-5 h-5 text-luxury-muted group-hover:text-gold transition-colors" />
            </div>
            <p className="text-[11px] font-semibold text-luxury-muted uppercase tracking-widest mb-1">Clients Joined</p>
            <p className="text-4xl font-black text-luxury-text">{stats?.todayClients ?? 0}</p>
          </div>

          <div className="group bg-luxury-surface border border-luxury-border rounded-2xl p-6 hover:border-gold/25 hover:bg-luxury-card transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-luxury-elevated border border-luxury-border flex items-center justify-center mb-5">
              <CheckCircle className="w-5 h-5 text-luxury-muted group-hover:text-gold transition-colors" />
            </div>
            <p className="text-[11px] font-semibold text-luxury-muted uppercase tracking-widest mb-1">Attendance</p>
            <p className="text-4xl font-black text-luxury-text">{stats?.todayAttendance ?? 0}</p>
          </div>

          {/* Expiring — orange alert */}
          <Link href="/clients/expiring"
            className="group relative bg-luxury-surface border border-luxury-border rounded-2xl p-6 hover:border-orange-500/40 hover:bg-luxury-card transition-all duration-300 block overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-luxury-subtle group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-[11px] font-semibold text-luxury-muted uppercase tracking-widest mb-1">Expiring This Week</p>
            <p className="text-4xl font-black text-orange-400">{stats?.expiringClientsThisWeek ?? 0}</p>
          </Link>
        </div>
      </div>

      {/* ── WEEKLY & TOTALS ── */}
      <div>
        <p className="text-[11px] font-semibold text-luxury-subtle uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-luxury-border" /> This Week & Overall
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="group bg-luxury-surface border border-luxury-border rounded-2xl p-5 hover:border-gold/25 hover:bg-luxury-card transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <p className="text-[11px] font-semibold text-luxury-muted uppercase tracking-widest mb-1">Week Revenue</p>
            <p className="text-xl font-black text-gold">{fmt(stats?.currentWeekRevenue ?? 0)}</p>
          </div>

          <div className="group bg-luxury-surface border border-luxury-border rounded-2xl p-5 hover:border-gold/25 hover:bg-luxury-card transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-luxury-elevated border border-luxury-border flex items-center justify-center mb-4">
              <UserPlus className="w-4 h-4 text-luxury-muted group-hover:text-gold transition-colors" />
            </div>
            <p className="text-[11px] font-semibold text-luxury-muted uppercase tracking-widest mb-1">Week Clients</p>
            <p className="text-xl font-black text-luxury-text">{stats?.currentWeekClients ?? 0}</p>
          </div>

          <div className="group bg-luxury-surface border border-luxury-border rounded-2xl p-5 hover:border-gold/25 hover:bg-luxury-card transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-luxury-elevated border border-luxury-border flex items-center justify-center mb-4">
              <User className="w-4 h-4 text-luxury-muted group-hover:text-gold transition-colors" />
            </div>
            <p className="text-[11px] font-semibold text-luxury-muted uppercase tracking-widest mb-1">Total Members</p>
            <p className="text-xl font-black text-luxury-text">{stats?.totalClients ?? 0}</p>
          </div>

          {/* Quick shortcut card */}
          <Link href="/clients"
            className="group relative bg-gradient-to-br from-gold/8 to-transparent border border-gold/20 rounded-2xl p-5 hover:border-gold/45 hover:from-gold/14 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.07), transparent 70%)' }} />
            <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center mb-4">
              <Dumbbell className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gold/60 uppercase tracking-widest mb-1">Quick Access</p>
              <p className="text-sm font-bold text-gold group-hover:text-gold-light transition-colors">
                All Clients →
              </p>
            </div>
          </Link>

        </div>
      </div>

    </div>
  )
}
