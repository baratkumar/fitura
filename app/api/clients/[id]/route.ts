import { NextRequest, NextResponse } from 'next/server'
import { getClient, deleteClient, updateClient } from '@/lib/clientStore'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const client = await getClient(id)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const success = await deleteClient(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Client deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const body = await request.json()
    console.log('[PUT /api/clients/:id] Received request body. photoUrl:', body.photoUrl, 'typeof:', typeof body.photoUrl)
    const updatedClient = await updateClient(id, body)
    console.log('[PUT /api/clients/:id] Updated client. photoUrl:', updatedClient?.photoUrl)
    
    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

