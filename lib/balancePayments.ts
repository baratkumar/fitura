import mongoose from 'mongoose';
import connectDB from './db';
import Client from './models/Client';
import Renewal from './models/Renewal';
import Payment from './models/Payment';
import { istYmd } from './istCalendar';

export class BalancePaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BalancePaymentError';
  }
}

export interface BalancePaymentRow {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMode?: string;
  transactionId?: string;
}

export interface BalanceSummary {
  charge: number;
  basePaid: number;
  installmentPaid: number;
  totalPaid: number;
  balanceDue: number;
  payments: BalancePaymentRow[];
}

export function roundMoney(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function cycleKey(clientId: number, renewalId: unknown): string {
  return `${clientId}:${renewalId ? String(renewalId) : ''}`;
}

async function latestRenewalIds(clientIds: number[]): Promise<Map<number, mongoose.Types.ObjectId>> {
  if (!clientIds.length) return new Map();
  const rows = await Renewal.aggregate([
    { $match: { clientId: { $in: clientIds } } },
    { $sort: { paymentDate: -1, createdAt: -1, _id: -1 } },
    { $group: { _id: '$clientId', renewalId: { $first: '$_id' } } },
  ]);
  const map = new Map<number, mongoose.Types.ObjectId>();
  for (const row of rows) {
    map.set(Number(row._id), row.renewalId as mongoose.Types.ObjectId);
  }
  return map;
}

async function installmentTotals(
  clientIds: number[]
): Promise<Map<string, number>> {
  if (!clientIds.length) return new Map();
  const rows = await Payment.aggregate([
    { $match: { clientId: { $in: clientIds } } },
    {
      $group: {
        _id: {
          clientId: '$clientId',
          renewalId: { $ifNull: ['$renewalId', null] },
        },
        total: { $sum: '$amount' },
      },
    },
  ]);
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(cycleKey(Number(row._id.clientId), row._id.renewalId), roundMoney(row.total || 0));
  }
  return map;
}

export function balanceFromParts(
  membershipFee: number | undefined,
  discount: number | undefined,
  paidAmount: number | undefined,
  installmentPaid: number
): { charge: number; basePaid: number; installmentPaid: number; totalPaid: number; balanceDue: number } {
  const charge = roundMoney(Math.max(0, (membershipFee ?? 0) - (discount ?? 0)));
  const basePaid = roundMoney(paidAmount ?? 0);
  const extra = roundMoney(installmentPaid);
  const totalPaid = roundMoney(basePaid + extra);
  const balanceDue = roundMoney(Math.max(0, charge - totalPaid));
  return { charge, basePaid, installmentPaid: extra, totalPaid, balanceDue };
}

export async function attachBalances<
  T extends {
    clientId: number;
    membershipFee?: number;
    discount?: number;
    paidAmount?: number;
  },
>(clients: T[]): Promise<(T & { installmentPaid: number; totalPaid: number; balanceDue: number })[]> {
  await connectDB();
  const ids = clients.map((c) => c.clientId);
  const [renewals, extras] = await Promise.all([latestRenewalIds(ids), installmentTotals(ids)]);
  return clients.map((client) => {
    const renewalId = renewals.get(client.clientId);
    const extra = extras.get(cycleKey(client.clientId, renewalId ?? null)) ?? 0;
    const parts = balanceFromParts(client.membershipFee, client.discount, client.paidAmount, extra);
    return {
      ...client,
      installmentPaid: parts.installmentPaid,
      totalPaid: parts.totalPaid,
      balanceDue: parts.balanceDue,
    };
  });
}

export async function getBalanceSummary(clientId: number): Promise<BalanceSummary> {
  await connectDB();
  const client = await Client.findOne({ clientId }).select('membershipFee discount paidAmount').lean();
  if (!client) {
    throw new BalancePaymentError('Client not found');
  }

  const renewals = await latestRenewalIds([clientId]);
  const renewalId = renewals.get(clientId) ?? null;
  const extras = await installmentTotals([clientId]);
  const extra = extras.get(cycleKey(clientId, renewalId)) ?? 0;
  const parts = balanceFromParts(client.membershipFee, client.discount, client.paidAmount, extra);

  const docs = await Payment.find({
    clientId,
    renewalId: renewalId ?? null,
  })
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean();

  return {
    ...parts,
    payments: docs.map((doc) => ({
      id: String(doc._id),
      amount: roundMoney(doc.amount),
      paymentDate: istYmd(new Date(doc.paymentDate)),
      paymentMode: doc.paymentMode || undefined,
      transactionId: doc.transactionId || undefined,
    })),
  };
}

export async function recordBalancePayment(input: {
  clientId: number;
  amount: number;
  paymentDate: string;
  paymentMode?: string;
  transactionId?: string;
}): Promise<BalanceSummary> {
  await connectDB();
  const summary = await getBalanceSummary(input.clientId);
  const amount = roundMoney(input.amount);

  if (!(amount > 0)) {
    throw new BalancePaymentError('Enter an amount greater than 0');
  }
  if (summary.balanceDue <= 0) {
    throw new BalancePaymentError('This membership is already fully paid');
  }
  if (amount > summary.balanceDue + 0.001) {
    throw new BalancePaymentError(
      `Amount cannot be more than the balance of ₹${summary.balanceDue.toFixed(2)}`
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.paymentDate)) {
    throw new BalancePaymentError('Enter a valid payment date');
  }

  const renewals = await latestRenewalIds([input.clientId]);
  const renewalId = renewals.get(input.clientId) ?? null;

  await Payment.create({
    clientId: input.clientId,
    renewalId,
    amount,
    paymentDate: new Date(`${input.paymentDate}T12:00:00+05:30`),
    paymentMode: input.paymentMode?.trim() || undefined,
    transactionId: input.transactionId?.trim() || undefined,
  });

  return getBalanceSummary(input.clientId);
}
