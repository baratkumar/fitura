import pool from './db'
import { Client } from './clientStore.types'
import { getTableName } from './tableNames'

export * from './clientStore.types'

export async function getAllClients(): Promise<Client[]> {
  const clientsTable = getTableName('clients')
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `SELECT c.*, m.name as membership_name FROM ${clientsTable} c LEFT JOIN ${membershipsTable} m ON c.membership_type = m.id ORDER BY c.created_at DESC`
  )
  return result.rows.map(row => mapRowToClient(row))
}

export async function getClient(id: number): Promise<Client | null> {
  const clientsTable = getTableName('clients')
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `SELECT c.*, m.name as membership_name FROM ${clientsTable} c LEFT JOIN ${membershipsTable} m ON c.membership_type = m.id WHERE c.id = $1`,
    [id]
  )
  if (result.rows.length === 0) return null
  return mapRowToClient(result.rows[0])
}

export async function addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  const clientsTable = getTableName('clients')
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `INSERT INTO ${clientsTable} (
      first_name, last_name, email, phone, date_of_birth, age, height, weight,
      gender, blood_group, bmi, aadhar_number, photo_url, address, membership_type, 
      joining_date, expiry_date, membership_fee, discount, payment_date, payment_mode, transaction_id, paid_amount,
      emergency_contact_name, emergency_contact_phone, medical_conditions, fitness_goals,
      first_time_in_gym, previous_gym_details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
    RETURNING *`,
    [
      clientData.firstName,
      clientData.lastName,
      clientData.email,
      clientData.phone,
      clientData.dateOfBirth,
      clientData.age || null,
      clientData.height || null,
      clientData.weight || null,
      clientData.gender || null,
      clientData.bloodGroup || null,
      clientData.bmi || null,
      clientData.aadharNumber || null,
      clientData.photoUrl || null,
      clientData.address,
      clientData.membershipType ? parseInt(clientData.membershipType) : null,
      clientData.joiningDate || null,
      clientData.expiryDate || null,
      clientData.membershipFee || null,
      clientData.discount || null,
      clientData.paymentDate || null,
      clientData.paymentMode || null,
      clientData.transactionId || null,
      clientData.paidAmount || null,
      clientData.emergencyContactName,
      clientData.emergencyContactPhone,
      clientData.medicalConditions || null,
      clientData.fitnessGoals || null,
      clientData.firstTimeInGym || null,
      clientData.previousGymDetails || null,
    ]
  )
  const row = result.rows[0]
  const membershipResult = await pool.query(`SELECT name FROM ${membershipsTable} WHERE id = $1`, [row.membership_type])
  row.membership_name = membershipResult.rows[0]?.name || null
  return mapRowToClient(row)
}

export async function deleteClient(id: number): Promise<boolean> {
  const clientsTable = getTableName('clients')
  const result = await pool.query(`DELETE FROM ${clientsTable} WHERE id = $1`, [id])
  return result.rowCount !== null && result.rowCount > 0
}

export async function updateClient(id: number, clientData: Partial<Client>): Promise<Client | null> {
  const updates: string[] = []
  const values: any[] = []
  let paramCount = 1

  if (clientData.firstName !== undefined) {
    updates.push(`first_name = $${paramCount++}`)
    values.push(clientData.firstName)
  }
  if (clientData.lastName !== undefined) {
    updates.push(`last_name = $${paramCount++}`)
    values.push(clientData.lastName)
  }
  if (clientData.email !== undefined) {
    updates.push(`email = $${paramCount++}`)
    values.push(clientData.email)
  }
  if (clientData.phone !== undefined) {
    updates.push(`phone = $${paramCount++}`)
    values.push(clientData.phone)
  }
  if (clientData.membershipType !== undefined) {
    updates.push(`membership_type = $${paramCount++}`)
    values.push(clientData.membershipType ? parseInt(clientData.membershipType) : null)
  }
  if (clientData.joiningDate !== undefined) {
    updates.push(`joining_date = $${paramCount++}`)
    values.push(clientData.joiningDate || null)
  }
  if (clientData.expiryDate !== undefined) {
    updates.push(`expiry_date = $${paramCount++}`)
    values.push(clientData.expiryDate || null)
  }
  if (clientData.membershipFee !== undefined) {
    updates.push(`membership_fee = $${paramCount++}`)
    values.push(clientData.membershipFee || null)
  }
  if (clientData.discount !== undefined) {
    updates.push(`discount = $${paramCount++}`)
    values.push(clientData.discount || null)
  }
  if (clientData.paymentDate !== undefined) {
    updates.push(`payment_date = $${paramCount++}`)
    values.push(clientData.paymentDate || null)
  }
  if (clientData.paymentMode !== undefined) {
    updates.push(`payment_mode = $${paramCount++}`)
    values.push(clientData.paymentMode || null)
  }
  if (clientData.transactionId !== undefined) {
    updates.push(`transaction_id = $${paramCount++}`)
    values.push(clientData.transactionId || null)
  }
  if (clientData.paidAmount !== undefined) {
    updates.push(`paid_amount = $${paramCount++}`)
    values.push(clientData.paidAmount || null)
  }
  if (clientData.photoUrl !== undefined) {
    updates.push(`photo_url = $${paramCount++}`)
    values.push(clientData.photoUrl || null)
  }
  if (clientData.address !== undefined) {
    updates.push(`address = $${paramCount++}`)
    values.push(clientData.address)
  }
  if (clientData.age !== undefined) {
    updates.push(`age = $${paramCount++}`)
    values.push(clientData.age || null)
  }
  if (clientData.height !== undefined) {
    updates.push(`height = $${paramCount++}`)
    values.push(clientData.height || null)
  }
  if (clientData.weight !== undefined) {
    updates.push(`weight = $${paramCount++}`)
    values.push(clientData.weight || null)
  }
  if (clientData.gender !== undefined) {
    updates.push(`gender = $${paramCount++}`)
    values.push(clientData.gender || null)
  }
  if (clientData.bloodGroup !== undefined) {
    updates.push(`blood_group = $${paramCount++}`)
    values.push(clientData.bloodGroup || null)
  }
  if (clientData.bmi !== undefined) {
    updates.push(`bmi = $${paramCount++}`)
    values.push(clientData.bmi || null)
  }
  if (clientData.aadharNumber !== undefined) {
    updates.push(`aadhar_number = $${paramCount++}`)
    values.push(clientData.aadharNumber || null)
  }
  if (clientData.emergencyContactName !== undefined) {
    updates.push(`emergency_contact_name = $${paramCount++}`)
    values.push(clientData.emergencyContactName)
  }
  if (clientData.emergencyContactPhone !== undefined) {
    updates.push(`emergency_contact_phone = $${paramCount++}`)
    values.push(clientData.emergencyContactPhone)
  }
  if (clientData.medicalConditions !== undefined) {
    updates.push(`medical_conditions = $${paramCount++}`)
    values.push(clientData.medicalConditions || null)
  }
  if (clientData.fitnessGoals !== undefined) {
    updates.push(`fitness_goals = $${paramCount++}`)
    values.push(clientData.fitnessGoals || null)
  }
  if (clientData.firstTimeInGym !== undefined) {
    updates.push(`first_time_in_gym = $${paramCount++}`)
    values.push(clientData.firstTimeInGym || null)
  }
  if (clientData.previousGymDetails !== undefined) {
    updates.push(`previous_gym_details = $${paramCount++}`)
    values.push(clientData.previousGymDetails || null)
  }

  if (updates.length === 0) {
    return getClient(id)
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const clientsTable = getTableName('clients')
  const membershipsTable = getTableName('memberships')
  const result = await pool.query(
    `UPDATE ${clientsTable} SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  const membershipResult = await pool.query(`SELECT name FROM ${membershipsTable} WHERE id = $1`, [row.membership_type])
  row.membership_name = membershipResult.rows[0]?.name || null
  return mapRowToClient(row)
}

function mapRowToClient(row: any): Client {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    height: row.height ? parseFloat(row.height) : undefined,
    weight: row.weight ? parseFloat(row.weight) : undefined,
    gender: row.gender,
    bloodGroup: row.blood_group,
    bmi: row.bmi ? parseFloat(row.bmi) : undefined,
    aadharNumber: row.aadhar_number,
    photoUrl: row.photo_url,
    address: row.address,
    membershipType: row.membership_type ? row.membership_type.toString() : '',
    membershipName: row.membership_name,
    joiningDate: row.joining_date || undefined,
    expiryDate: row.expiry_date || undefined,
    membershipFee: row.membership_fee ? parseFloat(row.membership_fee) : undefined,
    discount: row.discount ? parseFloat(row.discount) : undefined,
    paymentDate: row.payment_date || undefined,
    paymentMode: row.payment_mode || undefined,
    transactionId: row.transaction_id || undefined,
    paidAmount: row.paid_amount ? parseFloat(row.paid_amount) : undefined,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    medicalConditions: row.medical_conditions,
    fitnessGoals: row.fitness_goals,
    firstTimeInGym: row.first_time_in_gym,
    previousGymDetails: row.previous_gym_details,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
