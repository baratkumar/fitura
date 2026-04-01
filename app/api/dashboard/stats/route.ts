import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Client from '@/lib/models/Client';
import Attendance from '@/lib/models/Attendance';
import Membership from '@/lib/models/Membership';
import Renewal from '@/lib/models/Renewal';

const APP_TIMEZONE = 'Asia/Kolkata';

/** Today's start and end in app timezone (IST) as UTC Dates for DB queries. */
function getTodayRangeIST(): { start: Date; end: Date } {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE }); // YYYY-MM-DD
  const start = new Date(`${dateStr}T00:00:00+05:30`);
  const end = new Date(`${dateStr}T23:59:59.999+05:30`);
  return { start, end };
}

/** Current week (Mon–Sun) and next week end in IST for DB queries. */
function getWeekRangeIST(): { weekStart: Date; weekEnd: Date; nextWeekEnd: Date } {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
  const ref = new Date(`${dateStr}T12:00:00+05:30`);
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    ref.toLocaleDateString('en-US', { timeZone: APP_TIMEZONE, weekday: 'short' })
  );
  const [y, m, day] = dateStr.split('-').map(Number);
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const mondayDate = new Date(y, m - 1, day - mondayOffset);
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(sundayDate.getDate() + 6);
  const pad = (n: number) => String(n).padStart(2, '0');
  const mondayStr = `${mondayDate.getFullYear()}-${pad(mondayDate.getMonth() + 1)}-${pad(mondayDate.getDate())}`;
  const sundayStr = `${sundayDate.getFullYear()}-${pad(sundayDate.getMonth() + 1)}-${pad(sundayDate.getDate())}`;
  const weekStart = new Date(`${mondayStr}T00:00:00+05:30`);
  const weekEnd = new Date(`${sundayStr}T23:59:59.999+05:30`);
  const nextSunday = new Date(sundayDate);
  nextSunday.setDate(nextSunday.getDate() + 7);
  const nextSundayStr = `${nextSunday.getFullYear()}-${pad(nextSunday.getMonth() + 1)}-${pad(nextSunday.getDate())}`;
  const nextWeekEnd = new Date(`${nextSundayStr}T23:59:59.999+05:30`);
  return { weekStart, weekEnd, nextWeekEnd };
}

export async function GET() {
  try {
    await connectDB();

    const { start: today, end: todayEnd } = getTodayRangeIST();
    const { weekStart, weekEnd, nextWeekEnd } = getWeekRangeIST();

    // Run all stats queries in parallel for faster response
    const [
      todayClients,
      weekClients,
      todayClientsRevenue,
      weekClientsRevenue,
      todayRenewals,
      weekRenewals,
      totalClients,
      totalClientsRevenue,
      totalRenewalsRevenue,
      expiringClients,
      todayAttendance,
    ] = await Promise.all([
      // Today's newly registered clients
      Client.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
      // Current week newly registered clients
      Client.aggregate([
        {
          $match: {
            createdAt: { $gte: weekStart, $lte: weekEnd },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
      // Today's revenue from client documents (initial payments)
      Client.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      // Current week revenue from client documents (initial payments)
      Client.aggregate([
        {
          $match: {
            createdAt: { $gte: weekStart, $lte: weekEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      // Today's renewal revenue
      Renewal.aggregate([
        {
          $match: {
            paymentDate: { $gte: today, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      // Current week renewal revenue
      Renewal.aggregate([
        {
          $match: {
            paymentDate: { $gte: weekStart, $lte: weekEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      // Total clients
      Client.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
      // Overall revenue from initial registrations (client paid amount)
      Client.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      // Overall renewal revenue
      Renewal.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
          },
        },
      ]),
      // Expiring clients this week (joiningDate + membership duration in range)
      Client.aggregate([
        {
          $lookup: {
            from: 'memberships',
            localField: 'membershipType',
            foreignField: '_id',
            as: 'membership',
          },
        },
        {
          $unwind: {
            path: '$membership',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'membership.durationDays': { $exists: true, $ne: null },
            joiningDate: { $exists: true, $ne: null },
          },
        },
        {
          $addFields: {
            expiryDate: {
              $add: [
                '$joiningDate',
                { $multiply: ['$membership.durationDays', 24 * 60 * 60 * 1000] },
              ],
            },
          },
        },
        {
          $match: {
            expiryDate: { $gte: today, $lte: nextWeekEnd },
          },
        },
        { $count: 'count' },
      ]),
      // Today's attendance
      Attendance.countDocuments({
        attendanceDate: { $gte: today, $lte: todayEnd },
      }),
    ]);

    const stats = {
      todayRevenue: (todayClientsRevenue[0]?.revenue || 0) + (todayRenewals[0]?.revenue || 0),
      todayClients: todayClients[0]?.count || 0,
      todayAttendance: todayAttendance,
      expiringClientsThisWeek: expiringClients[0]?.count || 0,
      currentWeekRevenue: (weekClientsRevenue[0]?.revenue || 0) + (weekRenewals[0]?.revenue || 0),
      currentWeekClients: weekClients[0]?.count || 0,
      totalClients: totalClients[0]?.count || 0,
      overallRevenue: (totalClientsRevenue[0]?.revenue || 0) + (totalRenewalsRevenue[0]?.revenue || 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
