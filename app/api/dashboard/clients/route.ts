import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import {
  getDashboardRevenueClientsPaginated,
  getClientsTodayExpiryPaginated,
  getClientsExpiringThisMonthPaginated,
} from '@/lib/clientStore';

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type');
    const gym = request.nextUrl.searchParams.get('gym')?.trim() || undefined;
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '50', 10) || 50)
    );

    switch (type) {
      case 'last-month-revenue':
        return NextResponse.json(
          await getDashboardRevenueClientsPaginated('last-month', page, limit, gym)
        );
      case 'this-month-revenue':
        return NextResponse.json(
          await getDashboardRevenueClientsPaginated('this-month', page, limit, gym)
        );
      case 'today-expiry':
        return NextResponse.json(await getClientsTodayExpiryPaginated(page, limit, gym));
      case 'expiring-this-month':
        return NextResponse.json(await getClientsExpiringThisMonthPaginated(page, limit, gym));
      default:
        return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error fetching dashboard clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
