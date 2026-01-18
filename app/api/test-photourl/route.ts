import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Client from '@/lib/models/Client'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all clients and check their photoUrl - use raw MongoDB query to see everything
    const clients = await Client.find({})
      .lean()
      .limit(10)
    
    // Also get raw document for clientId 1
    const client1 = await Client.findOne({ clientId: 1 }).lean()
    
    return NextResponse.json({
      message: 'Client photoUrl check',
      clients: clients.map(c => ({
        clientId: c.clientId,
        name: `${c.firstName} ${c.lastName}`,
        photoUrl: c.photoUrl,
        hasPhotoUrl: !!c.photoUrl,
        photoUrlType: typeof c.photoUrl,
        allFields: Object.keys(c),
      })),
      client1Raw: client1 ? {
        clientId: client1.clientId,
        photoUrl: client1.photoUrl,
        hasPhotoUrl: !!client1.photoUrl,
        allFields: Object.keys(client1),
        rawDocument: client1,
      } : null,
      total: clients.length,
    })
  } catch (error: any) {
    console.error('Error checking photoUrl:', error)
    return NextResponse.json(
      { error: 'Failed to check photoUrl', details: error.message },
      { status: 500 }
    )
  }
}

