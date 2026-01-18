import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Membership from '@/lib/models/Membership';

/**
 * API endpoint to fix memberships with invalid IDs (0, null, or missing)
 * This will assign proper membership IDs starting from 1
 */
export async function POST() {
  try {
    await connectDB();
    
    // Find all memberships with invalid IDs (null, undefined, 0, or missing)
    const invalidMemberships = await Membership.find({
      $or: [
        { membershipId: { $exists: false } },
        { membershipId: null },
        { membershipId: 0 },
        { membershipId: { $lt: 1 } }
      ]
    }).lean();
    
    if (invalidMemberships.length === 0) {
      return NextResponse.json({ 
        message: 'No memberships with invalid IDs found',
        fixed: 0 
      });
    }
    
    // Get all existing valid membership IDs
    const existingMemberships = await Membership.find({ 
      membershipId: { $exists: true, $gte: 1 } 
    }, { membershipId: 1 })
      .sort({ membershipId: 1 })
      .lean();
    
    const existingIds = existingMemberships
      .map((m: any) => m.membershipId)
      .filter((id: any) => id != null && id > 0 && Number.isInteger(id))
      .sort((a: number, b: number) => a - b);
    
    let nextId = 1;
    if (existingIds.length > 0) {
      // Find first gap or use max + 1
      for (let i = 1; i <= existingIds.length; i++) {
        if (!existingIds.includes(i)) {
          nextId = i;
          break;
        }
      }
      if (nextId === 1 && existingIds.includes(1)) {
        nextId = Math.max(...existingIds) + 1;
      }
    }
    
    // Fix each invalid membership
    const fixed = [];
    for (const membership of invalidMemberships) {
      await Membership.findByIdAndUpdate(membership._id, { 
        membershipId: nextId 
      });
      fixed.push({
        _id: membership._id.toString(),
        name: membership.name,
        oldId: membership.membershipId || 'missing',
        newId: nextId
      });
      nextId++;
      
      // Update existingIds for next iteration
      existingIds.push(nextId - 1);
      existingIds.sort((a, b) => a - b);
    }
    
    return NextResponse.json({ 
      message: `Fixed ${fixed.length} membership(s) with invalid IDs`,
      fixed: fixed.length,
      details: fixed
    });
  } catch (error: any) {
    console.error('Error fixing membership IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fix membership IDs', details: error.message },
      { status: 500 }
    );
  }
}


