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
  getISTCalendarYear,
  getCurrentISTCalendarYear,
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

/**
 * Sum paidAmount for clients created in [start,end] who have **no** renewal documents yet.
 * Avoids double-counting once a baseline renewal is backfilled from the client record.
 */
export async function sumOrphanRegistrationRevenueInRange(
  start: Date,
  end: Date,
  gym?: string | null
): Promise<number> {
  await connectDB();
  const match = clientMatchWithGymAnd(gym, { createdAt: { $gte: start, $lte: end } });
  const pipeline: mongoose.PipelineStage[] = [
    { $match: match as mongoose.FilterQuery<unknown> },
    {
      $lookup: {
        from: 'renewals',
        let: { cid: '$clientId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$clientId', '$$cid'] } } },
          { $limit: 1 },
        ],
        as: '_hasRenewal',
      },
    },
    { $match: { _hasRenewal: { $size: 0 } } },
    { $group: { _id: null, revenue: { $sum: { $ifNull: ['$paidAmount', 0] } } } },
  ];
  const r = await Client.aggregate(pipeline);
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

/** Renewal payments in range + new members not yet represented in renewals collection. */
export async function combinedRevenueInRange(
  start: Date,
  end: Date,
  gym?: string | null
): Promise<number> {
  const [a, b] = await Promise.all([
    sumRenewalRevenueInRange(start, end, gym),
    sumOrphanRegistrationRevenueInRange(start, end, gym),
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
  const cy = getCurrentISTCalendarYear();
  let minY = cy;
  if (c[0]?.min) minY = Math.min(minY, getISTCalendarYear(new Date(c[0].min as Date)));
  if (r[0]?.min) {
    const pd = r[0].min as Date;
    if (!Number.isNaN(pd.getTime())) minY = Math.min(minY, getISTCalendarYear(new Date(pd)));
  }
  const years: number[] = [];
  for (let y = cy; y >= minY; y--) years.push(y);
  return years;
}

export {
  getTodayRangeIST,
  getThisMonthRangeIST,
  getLastMonthRangeIST,
  getYearRangeIST,
  getCurrentISTCalendarYear,
};
