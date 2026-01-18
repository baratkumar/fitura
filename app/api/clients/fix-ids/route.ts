import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Client from '@/lib/models/Client';

/**
 * API endpoint to fix clients with invalid IDs (0, null, or missing)
 * This will assign proper client IDs starting from 1
 */
export async function POST() {
  try {
    await connectDB();
    
    // Find all clients with invalid IDs (null, undefined, 0, or missing)
    const invalidClients = await Client.find({
      $or: [
        { clientId: { $exists: false } },
        { clientId: null },
        { clientId: 0 },
        { clientId: { $lt: 1 } }
      ]
    }).lean();
    
    if (invalidClients.length === 0) {
      return NextResponse.json({ 
        message: 'No clients with invalid IDs found',
        fixed: 0 
      });
    }
    
    // Get all existing valid client IDs
    const existingClients = await Client.find({ 
      clientId: { $exists: true, $gte: 1 } 
    }, { clientId: 1 })
      .sort({ clientId: 1 })
      .lean();
    
    const existingIds = existingClients
      .map((c: any) => c.clientId)
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
    
    // Fix each invalid client
    const fixed = [];
    for (const client of invalidClients) {
      await Client.findByIdAndUpdate(client._id, { 
        clientId: nextId 
      });
      fixed.push({
        _id: client._id.toString(),
        name: `${client.firstName} ${client.lastName}`,
        oldId: client.clientId || 'missing',
        newId: nextId
      });
      nextId++;
      
      // Update existingIds for next iteration
      existingIds.push(nextId - 1);
      existingIds.sort((a, b) => a - b);
    }
    
    return NextResponse.json({ 
      message: `Fixed ${fixed.length} client(s) with invalid IDs`,
      fixed: fixed.length,
      details: fixed
    });
  } catch (error: any) {
    console.error('Error fixing client IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fix client IDs', details: error.message },
      { status: 500 }
    );
  }
}


