import mongoose from 'mongoose';
import connectDB from './db';
import Client from './models/Client';
import Renewal from './models/Renewal';
import Attendance from './models/Attendance';
import {
  getTodayRangeIST,
  getThisMonthRangeIST,
  getLastMonthRangeIST,
  getYearRangeIST,
} from './istCalendar';

const clientListFilter = { clientId: { $exists: true, $ne: null, $gte: 1 } };

export function gymMatchClause(gym?: string | null): Record<string, unknown> {
  const g = String(gym || '').trim();
  if (!g) return {};
  if (g === 'Rival Fitness Studio I') {
    return {
      $or: [
        { gym: 'Rival Fitness Studio I' },
        { gym: null },
        { gym: '' },
        { gym: { $exists: false } },
      ],
    };
  }
  return { gym: g };
}

export function clientMatchWithGymAnd(
  gym: string | null | undefined,
  extra: Record<string, unknown>
): Record<string, unknown> {
  const g = gymMatchClause(gym);
  const parts: Record<string, unknown>[] = [clientListFilter];
  if (Object.keys(g).length) parts.push(g);
  parts.push(extra);
  return { $and: parts };
}

/** Match on nested client doc after $lookup, e.g. prefix `cl` */
export function gymMatchOnNestedClient(
  prefix: string,
  gym?: string | null
): Record<string, unknown> {
  const g = String(gym || '').trim();
  if (!g) return {};
  const p = `${prefix}.`;
  if (g === 'Rival Fitness Studio I') {
    return {
      $or: [
        { [`${p}gym`]: 'Rival Fitness Studio I' },
        { [`${p}gym`]: null },
        { [`${p}gym`]: '' },
        { [`${p}gym`]: { $exists: false } },
      ],
    };
  }
  return { [`${p}gym`]: g };
}

export async function sumRegistrationRevenueInRange(
  start: Date,
  end: Date,
  gym?: string | null
): Promise<number> {
  await connectDB();
  const match = clientMatchWithGymAnd(gym, { createdAt: { $gte: start, $lte: end } });
  const r = await Client.aggregate([
    { $match: match },
    { $group: { _id: null, revenue: { $sum: { $ifNull: ['$paidAmount', 0] } } } },
  ]);
  return r[0]?.revenue || 0;
}

export async function sumRenewalRevenueInRange(
  start: Date,
  end: Date,
  gym?: string | null
): Promise<number> {
  await connectDB();
  const g = String(gym || '').trim();
  const pipeline: mongoose.PipelineStage[] = [
    { $match: { paymentDate: { $gte: start, $lte: end } } },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: 'clientId',
        as: 'cl',
      },
    },
    { $unwind: { path: '$cl' } },
  ];
  if (g) {
    pipeline.push({ $match: gymMatchOnNestedClient('cl', g) as Record<string, unknown> });
  }
  pipeline.push({
    $group: { _id: null, revenue: { $sum: { $ifNull: ['$paidAmount', 0] } } },
  });
  const r = await Renewal.aggregate(pipeline);
  return r[0]?.revenue || 0;
}

export async function combinedRevenueInRange(
  start: Date,
  end: Date,
  gym?: string | null
): Promise<number> {
  const [a, b] = await Promise.all([
    sumRegistrationRevenueInRange(start, end, gym),
    sumRenewalRevenueInRange(start, end, gym),
  ]);
  return a + b;
}

export async function countClientsWithGym(gym?: string | null): Promise<number> {
  await connectDB();
  const g = gymMatchClause(gym);
  const match =
    Object.keys(g).length === 0
      ? clientListFilter
      : { $and: [clientListFilter, g] };
  return Client.countDocuments(match as mongoose.FilterQuery<unknown>);
}

export async function countTodayExpiry(gym?: string | null): Promise<number> {
  await connectDB();
  const { start, end } = getTodayRangeIST();
  const match = clientMatchWithGymAnd(gym, { expiryDate: { $gte: start, $lte: end } });
  return Client.countDocuments(match as mongoose.FilterQuery<unknown>);
}

export async function countExpiringThisMonth(gym?: string | null): Promise<number> {
  await connectDB();
  const { start, end } = getThisMonthRangeIST();
  const match = clientMatchWithGymAnd(gym, { expiryDate: { $gte: start, $lte: end } });
  return Client.countDocuments(match as mongoose.FilterQuery<unknown>);
}

export async function countTodayAttendanceWithGym(gym?: string | null): Promise<number> {
  await connectDB();
  const { start, end } = getTodayRangeIST();
  const g = String(gym || '').trim();
  const pipeline: mongoose.PipelineStage[] = [
    { $match: { attendanceDate: { $gte: start, $lte: end } } },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'cl',
      },
    },
    { $unwind: { path: '$cl' } },
  ];
  if (g) {
    pipeline.push({ $match: gymMatchOnNestedClient('cl', g) as Record<string, unknown> });
  }
  pipeline.push({ $count: 'c' });
  const r = await Attendance.aggregate(pipeline);
  return r[0]?.c || 0;
}

export async function getDashboardAvailableYears(): Promise<number[]> {
  await connectDB();
  const [c, r] = await Promise.all([
    Client.aggregate([{ $group: { _id: null, min: { $min: '$createdAt' } } }]),
    Renewal.aggregate([{ $group: { _id: null, min: { $min: '$paymentDate' } } }]),
  ]);
  const cy = new Date().getFullYear();
  let minY = cy;
  if (c[0]?.min) minY = Math.min(minY, new Date(c[0].min as Date).getFullYear());
  if (r[0]?.min) minY = Math.min(minY, new Date(r[0].min as Date).getFullYear());
  const years: number[] = [];
  for (let y = cy; y >= minY; y--) years.push(y);
  return years;
}

export { getTodayRangeIST, getThisMonthRangeIST, getLastMonthRangeIST, getYearRangeIST };
