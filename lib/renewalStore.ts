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

  return {
    _id: renewal._id.toString(),
    clientId: renewal.clientId,
    membershipType: membershipId,
    membershipName: membership?.name,
    joiningDate: renewal.joiningDate ? renewal.joiningDate.toISOString().split('T')[0] : undefined,
    expiryDate: renewal.expiryDate ? renewal.expiryDate.toISOString().split('T')[0] : undefined,
    membershipFee: renewal.membershipFee,
    discount: renewal.discount,
    paidAmount: renewal.paidAmount,
    paymentDate: renewal.paymentDate ? renewal.paymentDate.toISOString().split('T')[0] : undefined,
    paymentMode: renewal.paymentMode,
    transactionId: renewal.transactionId,
    createdAt: renewal.createdAt ? renewal.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: renewal.updatedAt ? renewal.updatedAt.toISOString() : undefined,
  };
}

export async function getRenewalsForClient(clientId: number): Promise<RenewalType[]> {
  await connectDB();
  const renewals = await Renewal.find({ clientId })
    .populate('membershipType', 'name membershipId')
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean();

  return renewals.map(mapToRenewalType);
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

