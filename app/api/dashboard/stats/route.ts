import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import {
  combinedRevenueInRange,
  countTodayExpiry,
  countExpiringThisMonth,
  countTodayAttendanceWithGym,
  countClientsWithGym,
  getDashboardAvailableYears,
  getTodayRangeIST,
  getThisMonthRangeIST,
  getLastMonthRangeIST,
  getYearRangeIST,
  getCurrentISTCalendarYear,
} from '@/lib/dashboardQueries';

export async function GET(request: NextRequest) {
  try {
    const gym = request.nextUrl.searchParams.get('gym')?.trim() || undefined;
    const yearParam = request.nextUrl.searchParams.get('year');
    const cy = getCurrentISTCalendarYear();
    const revenueYear = Math.min(
      cy + 1,
      Math.max(1970, parseInt(yearParam || String(cy), 10) || cy)
    );

    const { start: today, end: todayEnd } = getTodayRangeIST();
    const thisMonth = getThisMonthRangeIST();
    const lastMonth = getLastMonthRangeIST();
    const yRange = getYearRangeIST(revenueYear);

    const [
      todayRevenue,
      lastMonthRevenue,
      thisMonthRevenue,
      todayExpiry,
      expiringThisMonth,
      todayAttendance,
      totalClients,
      overallRevenue,
      availableYears,
    ] = await Promise.all([
      combinedRevenueInRange(today, todayEnd, gym),
      combinedRevenueInRange(lastMonth.start, lastMonth.end, gym),
      combinedRevenueInRange(thisMonth.start, thisMonth.end, gym),
      countTodayExpiry(gym),
      countExpiringThisMonth(gym),
      countTodayAttendanceWithGym(gym),
      countClientsWithGym(gym),
      combinedRevenueInRange(yRange.start, yRange.end, gym),
      getDashboardAvailableYears(),
    ]);

    return NextResponse.json({
      todayRevenue,
      lastMonthRevenue,
      thisMonthRevenue,
      todayExpiry,
      expiringThisMonth,
      todayAttendance,
      totalClients,
      overallRevenue,
      revenueYear,
      availableYears,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
