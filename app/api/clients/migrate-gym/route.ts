import { NextResponse } from 'next/server'
import { migrateClientsGym } from '@/lib/clientStore'

/**
 * One-time migration: set gym to "Rival Fitness Studio I" for all clients
 * that don't have gym set. Safe to call multiple times (idempotent).
 */
export async function POST() {
  try {
    const { updated } = await migrateClientsGym()
    return NextResponse.json({ updated, message: `Updated ${updated} client(s) with gym "Rival Fitness Studio I".` })
  } catch (error: unknown) {
    console.error('Error migrating client gym:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
