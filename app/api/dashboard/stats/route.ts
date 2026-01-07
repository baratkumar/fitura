import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getTableName } from '@/lib/tableNames'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    // Get start of current week (Monday)
    const weekStart = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust when day is Sunday
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)

    // Get end of current week (Sunday)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Get next week end for expiring clients
    const nextWeekEnd = new Date(weekEnd)
    nextWeekEnd.setDate(weekEnd.getDate() + 7)

    const clientsTable = getTableName('clients')
    const membershipsTable = getTableName('memberships')
    const attendanceTable = getTableName('attendance')

    // Today's clients
    const todayClientsResult = await pool.query(
      `SELECT COUNT(*) as count, 
       COALESCE(SUM(COALESCE(c.paid_amount, 0)), 0) as revenue
       FROM ${clientsTable} c
       LEFT JOIN ${membershipsTable} m ON c.membership_type = m.id
       WHERE c.created_at >= $1 AND c.created_at <= $2`,
      [today, todayEnd]
    )

    // Current week clients
    const weekClientsResult = await pool.query(
      `SELECT COUNT(*) as count, 
       COALESCE(SUM(COALESCE(c.paid_amount, 0)), 0) as revenue
       FROM ${clientsTable} c
       LEFT JOIN ${membershipsTable} m ON c.membership_type = m.id
       WHERE c.created_at >= $1 AND c.created_at <= $2`,
      [weekStart, weekEnd]
    )

    // Total clients and overall revenue
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count, 
       COALESCE(SUM(COALESCE(c.paid_amount, 0)), 0) as revenue
       FROM ${clientsTable} c
       LEFT JOIN ${membershipsTable} m ON c.membership_type = m.id`
    )

    // Expiring clients this week (membership created_at + duration_days falls within next 7 days)
    const expiringResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM ${clientsTable} c
       LEFT JOIN ${membershipsTable} m ON c.membership_type = m.id
       WHERE m.duration_days IS NOT NULL
       AND (c.created_at::date + INTERVAL '1 day' * m.duration_days) >= $1
       AND (c.created_at::date + INTERVAL '1 day' * m.duration_days) <= $2`,
      [today, nextWeekEnd]
    )

    // Today's attendance
    const todayAttendanceResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM ${attendanceTable}
       WHERE attendance_date = $1`,
      [today.toISOString().split('T')[0]]
    )

    const todayAttendance = parseInt(todayAttendanceResult.rows[0].count || 0)

    const stats = {
      todayRevenue: parseFloat(todayClientsResult.rows[0].revenue || 0),
      todayClients: parseInt(todayClientsResult.rows[0].count || 0),
      todayAttendance: todayAttendance,
      expiringClientsThisWeek: parseInt(expiringResult.rows[0].count || 0),
      currentWeekRevenue: parseFloat(weekClientsResult.rows[0].revenue || 0),
      currentWeekClients: parseInt(weekClientsResult.rows[0].count || 0),
      totalClients: parseInt(totalResult.rows[0].count || 0),
      overallRevenue: parseFloat(totalResult.rows[0].revenue || 0),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}




