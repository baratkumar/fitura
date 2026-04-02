import connectDB from './db';
import Client from './models/Client';
import Membership from './models/Membership';
import Renewal from './models/Renewal';
import mongoose from 'mongoose';

export interface RenewalType {
  _id: string;
  clientId: number;
  membershipType: string; // membershipId as string for frontend
  membershipName?: string;
  joiningDate?: string;
  expiryDate?: string;
  membershipFee?: number;
  discount?: number;
  paidAmount?: number;
  paymentDate?: string;
  paymentMode?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

async function resolveMembershipObjectId(
  membershipType: string
): Promise<mongoose.Types.ObjectId> {
  // Convert membershipId to MongoDB ObjectId if it's a number
  let membershipTypeId: string | undefined = membershipType;
  if (membershipTypeId) {
    const membershipId = parseInt(membershipTypeId);
    if (!isNaN(membershipId) && membershipId > 0 && membershipId < 100000) {
      const membership = await Membership.findOne({ membershipId });
      if (membership) {
        return membership._id;
      }
      throw new Error(`Membership with ID ${membershipId} not found`);
    }

    if (membershipTypeId.length === 24) {
      const membership = await Membership.findById(membershipTypeId);
      if (membership) {
        return membership._id;
      }
      throw new Error('Membership not found');
    }
  }

  throw new Error(`Invalid membership ID: ${membershipType}. Please select a valid membership.`);
}

async function syncClientFromRenewals(clientId: number): Promise<void> {
  await connectDB();

  const latestRenewal = await Renewal.findOne({ clientId })
    .sort({ paymentDate: -1, createdAt: -1, _id: -1 })
    .lean();

  const client = await Client.findOne({ clientId });
  if (!client) return;

  if (!latestRenewal) {
    // No renewals left - clear membership-related fields
    client.membershipType = undefined as any;
    client.joiningDate = undefined as any;
    client.expiryDate = undefined as any;
    client.membershipFee = undefined as any;
    client.discount = 0;
    client.paidAmount = undefined as any;
    client.paymentDate = undefined as any;
    client.paymentMode = undefined as any;
    client.transactionId = undefined as any;
    await client.save();
    return;
  }

  client.membershipType = latestRenewal.membershipType;
  client.joiningDate = latestRenewal.joiningDate as any;
  client.expiryDate = latestRenewal.expiryDate as any;
  client.membershipFee = latestRenewal.membershipFee;
  client.discount = latestRenewal.discount ?? 0;
  client.paidAmount = latestRenewal.paidAmount;
  client.paymentDate = latestRenewal.paymentDate as any;
  client.paymentMode = latestRenewal.paymentMode;
  client.transactionId = latestRenewal.transactionId;

  await client.save();
}

function mapToRenewalType(renewal: any): RenewalType {
  const membership =
    renewal.membershipType && (renewal.membershipType.membershipId || renewal.membershipType._id)
      ? renewal.membershipType
      : null;

  const membershipId = membership?.membershipId
    ? membership.membershipId.toString()
    : membership?._id?.toString() || renewal.membershipType?.toString() || '';

  const toIsoDateOnly = (value: unknown): string | undefined => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString().split('T')[0];
  };

  const toIsoDateTime = (value: unknown): string | undefined => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  };

  return {
    _id: renewal._id.toString(),
    clientId: renewal.clientId,
    membershipType: membershipId,
    membershipName: membership?.name,
    joiningDate: toIsoDateOnly(renewal.joiningDate),
    expiryDate: toIsoDateOnly(renewal.expiryDate),
    membershipFee: renewal.membershipFee,
    discount: renewal.discount,
    paidAmount: renewal.paidAmount,
    paymentDate: toIsoDateOnly(renewal.paymentDate),
    paymentMode: renewal.paymentMode,
    transactionId: renewal.transactionId,
    createdAt: toIsoDateTime(renewal.createdAt) || new Date().toISOString(),
    updatedAt: toIsoDateTime(renewal.updatedAt),
  };
}

/**
 * List renewals for a client. New client registration does not create renewal rows;
 * payments are stored on the Client record until an admin adds a renewal via POST /api/renewals.
 */
export async function getRenewalsForClient(clientId: number): Promise<RenewalType[]> {
  await connectDB();
  const renewals = await Renewal.find({ clientId })
    .populate('membershipType', 'name membershipId')
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean();

  return renewals
    .map((renewal) => {
      try {
        return mapToRenewalType(renewal);
      } catch (error) {
        console.error('Skipping invalid renewal record:', error);
        return null;
      }
    })
    .filter((renewal): renewal is RenewalType => renewal !== null);
}

export async function createRenewal(data: {
  clientId: number;
  membershipType: string;
  joiningDate?: string;
  expiryDate?: string;
  membershipFee?: number;
  discount?: number;
  paidAmount?: number;
  paymentDate?: string;
  paymentMode?: string;
  transactionId?: string;
}): Promise<RenewalType> {
  await connectDB();

  const client = await Client.findOne({ clientId: data.clientId });
  if (!client) {
    throw new Error(`Client with ID ${data.clientId} not found`);
  }

  const membershipObjectId = await resolveMembershipObjectId(data.membershipType);

  const renewal = await Renewal.create({
    clientId: data.clientId,
    membershipType: membershipObjectId,
    joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    membershipFee: data.membershipFee,
    discount: data.discount ?? 0,
    paidAmount: data.paidAmount,
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    paymentMode: data.paymentMode,
    transactionId: data.transactionId,
  });

  await syncClientFromRenewals(data.clientId);

  const populated = await Renewal.findById(renewal._id)
    .populate('membershipType', 'name membershipId')
    .lean();

  if (!populated) {
    throw new Error('Failed to load created renewal');
  }

  return mapToRenewalType(populated);
}

export async function updateRenewal(
  id: string,
  data: {
    membershipType?: string;
    joiningDate?: string | null;
    expiryDate?: string | null;
    membershipFee?: number;
    discount?: number;
    paidAmount?: number;
    paymentDate?: string | null;
    paymentMode?: string;
    transactionId?: string;
  }
): Promise<RenewalType | null> {
  await connectDB();

  const existing = await Renewal.findById(id);
  if (!existing) {
    return null;
  }

  if (data.membershipType !== undefined) {
    existing.membershipType = await resolveMembershipObjectId(data.membershipType);
  }
  if (data.joiningDate !== undefined) {
    existing.joiningDate = data.joiningDate ? new Date(data.joiningDate) : undefined;
  }
  if (data.expiryDate !== undefined) {
    existing.expiryDate = data.expiryDate ? new Date(data.expiryDate) : undefined;
  }
  if (data.membershipFee !== undefined) existing.membershipFee = data.membershipFee;
  if (data.discount !== undefined) existing.discount = data.discount;
  if (data.paidAmount !== undefined) existing.paidAmount = data.paidAmount;
  if (data.paymentDate !== undefined) {
    existing.paymentDate = data.paymentDate ? new Date(data.paymentDate) : undefined;
  }
  if (data.paymentMode !== undefined) existing.paymentMode = data.paymentMode;
  if (data.transactionId !== undefined) existing.transactionId = data.transactionId;

  await existing.save();

  await syncClientFromRenewals(existing.clientId);

  const populated = await Renewal.findById(existing._id)
    .populate('membershipType', 'name membershipId')
    .lean();

  if (!populated) {
    return null;
  }

  return mapToRenewalType(populated);
}

/** Same calendar day in UTC for date-only payment comparisons. */
function sameUtcDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

/**
 * Deletes renewals whose `paymentDate` matches the client's `paymentDate` (same UTC day).
 * If the client still has other renewals, syncs membership from the latest renewal.
 * If none remain, leaves the Client document unchanged (signup payment stays on the client).
 */
export async function deleteRenewalsMatchingClientPaymentDate(): Promise<{
  deleted: number;
  affectedClientIds: number[];
}> {
  await connectDB();
  const clients = await Client.find({}).select('clientId paymentDate').lean();
  let deleted = 0;
  const affected = new Set<number>();

  for (const c of clients) {
    const cid = c.clientId;
    if (cid == null || cid < 1) continue;
    const cpRaw = (c as { paymentDate?: Date }).paymentDate;
    if (!cpRaw) continue;
    const cp = new Date(cpRaw);
    if (Number.isNaN(cp.getTime())) continue;

    const renewals = await Renewal.find({ clientId: cid }).select('_id paymentDate').lean();
    for (const r of renewals) {
      if (!r.paymentDate) continue;
      const rp = new Date(r.paymentDate as Date);
      if (!sameUtcDay(cp, rp)) continue;

      await Renewal.deleteOne({ _id: r._id });
      deleted++;
      affected.add(cid);
    }
  }

  for (const clientId of Array.from(affected)) {
    const remaining = await Renewal.countDocuments({ clientId });
    if (remaining > 0) {
      await syncClientFromRenewals(clientId);
    }
  }

  return { deleted, affectedClientIds: Array.from(affected) };
}

export async function countRenewalsMatchingClientPaymentDate(): Promise<number> {
  await connectDB();
  const clients = await Client.find({}).select('clientId paymentDate').lean();
  let n = 0;

  for (const c of clients) {
    const cid = c.clientId;
    if (cid == null || cid < 1) continue;
    const cpRaw = (c as { paymentDate?: Date }).paymentDate;
    if (!cpRaw) continue;
    const cp = new Date(cpRaw);
    if (Number.isNaN(cp.getTime())) continue;

    const renewals = await Renewal.find({ clientId: cid }).select('paymentDate').lean();
    for (const r of renewals) {
      if (!r.paymentDate) continue;
      const rp = new Date(r.paymentDate as Date);
      if (sameUtcDay(cp, rp)) n++;
    }
  }

  return n;
}

export async function deleteRenewal(id: string): Promise<boolean> {
  await connectDB();

  const existing = await Renewal.findById(id);
  if (!existing) {
    return false;
  }

  const clientId = existing.clientId;
  await existing.deleteOne();

  await syncClientFromRenewals(clientId);

  return true;
}

