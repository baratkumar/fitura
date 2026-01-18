import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Client from '@/lib/models/Client';
import Attendance from '@/lib/models/Attendance';
import Membership from '@/lib/models/Membership';

export async function GET() {
  try {
    await connectDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get start of current week (Monday)
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    // Get end of current week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get next week end for expiring clients
    const nextWeekEnd = new Date(weekEnd);
    nextWeekEnd.setDate(weekEnd.getDate() + 7);

    // Today's clients and revenue
    const todayClients = await Client.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lte: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
        },
      },
    ]);

    // Current week clients and revenue
    const weekClients = await Client.aggregate([
      {
        $match: {
          createdAt: {
            $gte: weekStart,
            $lte: weekEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
        },
      },
    ]);

    // Total clients and overall revenue
    const totalClients = await Client.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$paidAmount', 0] } },
        },
      },
    ]);

    // Expiring clients this week
    // Calculate expiry date: joiningDate + membership duration
    const expiringClients = await Client.aggregate([
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
          expiryDate: {
            $gte: today,
            $lte: nextWeekEnd,
          },
        },
      },
      {
        $count: 'count',
      },
    ]);

    // Today's attendance
    const todayAttendance = await Attendance.countDocuments({
      attendanceDate: {
        $gte: today,
        $lte: todayEnd,
      },
    });

    const stats = {
      todayRevenue: todayClients[0]?.revenue || 0,
      todayClients: todayClients[0]?.count || 0,
      todayAttendance: todayAttendance,
      expiringClientsThisWeek: expiringClients[0]?.count || 0,
      currentWeekRevenue: weekClients[0]?.revenue || 0,
      currentWeekClients: weekClients[0]?.count || 0,
      totalClients: totalClients[0]?.count || 0,
      overallRevenue: totalClients[0]?.revenue || 0,
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
