import connectDB from './db';
import Membership from './models/Membership';

export interface Membership {
  membershipId: number; // Primary identifier - always use this instead of MongoDB _id
  name: string;
  description?: string;
  durationDays: number;
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAllMemberships(): Promise<Membership[]> {
  await connectDB();
  const memberships = await Membership.find({ 
    isActive: true,
    membershipId: { $exists: true, $ne: null, $gte: 1 } // Only get memberships with valid IDs >= 1
  })
    .sort({ membershipId: 1 })
    .lean();
  
  // Map and filter out any invalid memberships
  return memberships
    .map(m => {
      try {
        return mapToMembership(m);
      } catch (error) {
        console.error('Skipping invalid membership:', error);
        return null;
      }
    })
    .filter((m): m is Membership => m !== null && m.membershipId >= 1);
}

export async function getAllMembershipsIncludingInactive(): Promise<Membership[]> {
  await connectDB();
  const memberships = await Membership.find({
    membershipId: { $exists: true, $ne: null, $gte: 1 } // Only get memberships with valid IDs >= 1
  })
    .sort({ membershipId: 1 })
    .lean();
  
  // Map and filter out any invalid memberships
  return memberships
    .map(m => {
      try {
        return mapToMembership(m);
      } catch (error) {
        console.error('Skipping invalid membership:', error);
        return null;
      }
    })
    .filter((m): m is Membership => m !== null && m.membershipId >= 1);
}

export async function getMembership(id: string): Promise<Membership | null> {
  await connectDB();
  // Try to find by membershipId first (if it's a number), otherwise try MongoDB _id
  const membershipId = parseInt(id);
  let membership;
  
  if (!isNaN(membershipId)) {
    membership = await Membership.findOne({ membershipId }).lean();
  } else {
    membership = await Membership.findById(id).lean();
  }
  
  if (!membership) return null;
  return mapToMembership(membership);
}

export async function getMembershipByMembershipId(membershipId: number): Promise<Membership | null> {
  await connectDB();
  const membership = await Membership.findOne({ membershipId }).lean();
  
  if (!membership) return null;
  return mapToMembership(membership);
}

/**
 * Find the next available membership ID by checking for gaps in the sequence
 * Always starts from 1 and finds the first available number
 */
async function getNextAvailableMembershipId(): Promise<number> {
  await connectDB();
  
  // Get all existing membership IDs, sorted
  const existingMemberships = await Membership.find({}, { membershipId: 1 })
    .sort({ membershipId: 1 })
    .lean();
  
  // Filter out any null/undefined/0 values and get valid membership IDs
  const existingIds = existingMemberships
    .map((m: any) => m.membershipId)
    .filter((id: any) => id != null && id > 0 && Number.isInteger(id))
    .sort((a: number, b: number) => a - b);
  
  // If no memberships exist, start with 1
  if (existingIds.length === 0) {
    return 1;
  }
  
  // Always start checking from 1
  // Find the first gap in the sequence starting from 1
  for (let i = 1; i <= existingIds.length; i++) {
    if (!existingIds.includes(i)) {
      return i;
    }
  }
  
  // No gaps found, return max + 1
  const maxId = Math.max(...existingIds);
  return maxId + 1;
}

export async function createMembership(data: {
  name: string;
  description?: string;
  durationDays: number;
  price?: number;
  isActive?: boolean;
}): Promise<Membership> {
  await connectDB();
  
  // Get the next available membership ID (always starts from 1)
  const membershipId = await getNextAvailableMembershipId();
  
  // Ensure membershipId is at least 1
  if (membershipId < 1) {
    throw new Error('Invalid membership ID generated. Membership IDs must start from 1.');
  }
  
  const membership = new Membership({
    membershipId,
    name: data.name,
    description: data.description,
    durationDays: data.durationDays,
    price: data.price,
    isActive: data.isActive !== undefined ? data.isActive : true,
  });
  
  await membership.save();
  return mapToMembership(membership.toObject());
}

export async function updateMembership(
  id: string,
  data: {
    name?: string;
    description?: string;
    durationDays?: number;
    price?: number;
    isActive?: boolean;
  }
): Promise<Membership | null> {
  await connectDB();
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.durationDays !== undefined) updateData.durationDays = data.durationDays;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  // Try to find by membershipId first (if it's a number), otherwise try MongoDB _id
  const membershipId = parseInt(id);
  let membership;
  
  if (!isNaN(membershipId)) {
    membership = await Membership.findOneAndUpdate({ membershipId }, updateData, { new: true }).lean();
  } else {
    membership = await Membership.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }
  
  if (!membership) return null;
  return mapToMembership(membership);
}

export async function deleteMembership(id: string): Promise<boolean> {
  await connectDB();
  // Try to find by membershipId first (if it's a number), otherwise try MongoDB _id
  const membershipId = parseInt(id);
  let result;
  
  if (!isNaN(membershipId)) {
    result = await Membership.findOneAndDelete({ membershipId });
  } else {
    result = await Membership.findByIdAndDelete(id);
  }
  
  return !!result;
}

function mapToMembership(membership: any): Membership {
  // Only return membershipId, not MongoDB _id
  // Ensure membershipId is always a valid number >= 1
  const membershipId = membership.membershipId;
  
  if (!membershipId || membershipId < 1 || !Number.isInteger(membershipId)) {
    console.error(`Error: Membership "${membership.name}" (MongoDB _id: ${membership._id}) has invalid membershipId: ${membershipId}. It must be >= 1.`);
    // Don't return 0, throw error - will be caught and filtered in calling functions
    throw new Error(`Membership "${membership.name}" has invalid membershipId: ${membershipId}. It must be >= 1.`);
  }
  
  return {
    membershipId: membershipId,
    name: membership.name,
    description: membership.description,
    durationDays: membership.durationDays,
    price: membership.price,
    isActive: membership.isActive,
    createdAt: membership.createdAt ? membership.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: membership.updatedAt ? membership.updatedAt.toISOString() : new Date().toISOString(),
  };
}
