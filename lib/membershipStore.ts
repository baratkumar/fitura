import pool from './db'
import { getTableName } from './tableNames'

export interface Membership {
  id: number
  name: string
  description?: string
  durationDays: number
  price?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getAllMemberships(): Promise<Membership[]> {
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `SELECT * FROM ${membershipsTable} WHERE is_active = true ORDER BY name`
  )
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    price: row.price ? parseFloat(row.price) : undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getAllMembershipsIncludingInactive(): Promise<Membership[]> {
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(`SELECT * FROM ${membershipsTable} ORDER BY name`)
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    price: row.price ? parseFloat(row.price) : undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getMembership(id: number): Promise<Membership | null> {
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(`SELECT * FROM ${membershipsTable} WHERE id = $1`, [id])
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    price: row.price ? parseFloat(row.price) : undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createMembership(data: {
  name: string
  description?: string
  durationDays: number
  price?: number
  isActive?: boolean
}): Promise<Membership> {
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `INSERT INTO ${membershipsTable} (name, description, duration_days, price, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.name,
      data.description || null,
      data.durationDays,
      data.price || null,
      data.isActive !== undefined ? data.isActive : true,
    ]
  )
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    price: row.price ? parseFloat(row.price) : undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function updateMembership(
  id: number,
  data: {
    name?: string
    description?: string
    durationDays?: number
    price?: number
    isActive?: boolean
  }
): Promise<Membership | null> {
  const updates: string[] = []
  const values: any[] = []
  let paramCount = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`)
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`)
    values.push(data.description || null)
  }
  if (data.durationDays !== undefined) {
    updates.push(`duration_days = $${paramCount++}`)
    values.push(data.durationDays)
  }
  if (data.price !== undefined) {
    updates.push(`price = $${paramCount++}`)
    values.push(data.price || null)
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${paramCount++}`)
    values.push(data.isActive)
  }

  if (updates.length === 0) {
    return getMembership(id)
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `UPDATE ${membershipsTable} SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    price: row.price ? parseFloat(row.price) : undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function deleteMembership(id: number): Promise<boolean> {
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(`DELETE FROM ${membershipsTable} WHERE id = $1`, [id])
  return result.rowCount !== null && result.rowCount > 0
}








