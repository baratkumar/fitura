import { NextRequest, NextResponse } from 'next/server';
import {
  BalancePaymentError,
  getBalanceSummary,
  recordBalancePayment,
} from '@/lib/balancePayments';

export const dynamic = 'force-dynamic';

function clientIdFrom(id: string): number | null {
  const clientId = parseInt(id, 10);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = clientIdFrom(params.id);
    if (!clientId) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }
    const summary = await getBalanceSummary(clientId);
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof BalancePaymentError) {
      const status = error.message === 'Client not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Error loading balance payments:', error);
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = clientIdFrom(params.id);
    if (!clientId) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }
    const body = await request.json();
    const summary = await recordBalancePayment({
      clientId,
      amount: Number(body.amount),
      paymentDate: String(body.paymentDate || ''),
      paymentMode: body.paymentMode ? String(body.paymentMode) : undefined,
      transactionId: body.transactionId ? String(body.transactionId) : undefined,
    });
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof BalancePaymentError) {
      const status = error.message === 'Client not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Error recording balance payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
