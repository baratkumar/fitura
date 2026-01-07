import pool from './db'
import { getTableName } from './tableNames'

export interface Attendance {
  id: number
  clientId: number
  clientName?: string
  attendanceDate: string
  attendanceTime: string
  createdAt: string
}

function mapRowToAttendance(row: any): Attendance {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name ? `${row.client_name}` : undefined,
    attendanceDate: row.attendance_date,
    attendanceTime: row.attendance_time,
    createdAt: row.created_at,
  }
}

export async function getAllAttendance(): Promise<Attendance[]> {
  const attendanceTable = getTableName('attendance')
  const clientsTable = getTableName('clients')
  const result = await pool.query(`
    SELECT 
      a.id,
      a.client_id,
      a.attendance_date,
      a.attendance_time,
      a.created_at,
      CONCAT(c.first_name, ' ', c.last_name) as client_name
    FROM ${attendanceTable} a
    LEFT JOIN ${clientsTable} c ON a.client_id = c.id
    ORDER BY a.attendance_date DESC, a.attendance_time DESC
  `)
  return result.rows.map(mapRowToAttendance)
}

export async function getAttendanceByClientId(clientId: number): Promise<Attendance[]> {
  const attendanceTable = getTableName('attendance')
  const clientsTable = getTableName('clients')
  const result = await pool.query(`
    SELECT 
      a.id,
      a.client_id,
      a.attendance_date,
      a.attendance_time,
      a.created_at,
      CONCAT(c.first_name, ' ', c.last_name) as client_name
    FROM ${attendanceTable} a
    LEFT JOIN ${clientsTable} c ON a.client_id = c.id
    WHERE a.client_id = $1
    ORDER BY a.attendance_date DESC, a.attendance_time DESC
  `, [clientId])
  return result.rows.map(mapRowToAttendance)
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  const attendanceTable = getTableName('attendance')
  const clientsTable = getTableName('clients')
  const result = await pool.query(`
    SELECT 
      a.id,
      a.client_id,
      a.attendance_date,
      a.attendance_time,
      a.created_at,
      CONCAT(c.first_name, ' ', c.last_name) as client_name
    FROM ${attendanceTable} a
    LEFT JOIN ${clientsTable} c ON a.client_id = c.id
    WHERE a.attendance_date = $1
    ORDER BY a.attendance_time DESC
  `, [date])
  return result.rows.map(mapRowToAttendance)
}

export async function addAttendance(attendanceData: {
  clientId: number
  attendanceDate: string
  attendanceTime: string
}): Promise<Attendance> {
  const attendanceTable = getTableName('attendance')
  const clientsTable = getTableName('clients')
  
  // Verify client exists
  const clientCheck = await pool.query(`SELECT id FROM ${clientsTable} WHERE id = $1`, [attendanceData.clientId])
  if (clientCheck.rows.length === 0) {
    throw new Error('Client not found')
  }

  const result = await pool.query(
    `INSERT INTO ${attendanceTable} (client_id, attendance_date, attendance_time)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [attendanceData.clientId, attendanceData.attendanceDate, attendanceData.attendanceTime]
  )
  
  const row = result.rows[0]
  const clientResult = await pool.query(
    `SELECT first_name, last_name FROM ${clientsTable} WHERE id = $1`,
    [row.client_id]
  )
  if (clientResult.rows.length > 0) {
    row.client_name = `${clientResult.rows[0].first_name} ${clientResult.rows[0].last_name}`
  }
  
  return mapRowToAttendance(row)
}

export async function deleteAttendance(id: number): Promise<boolean> {
  const attendanceTable = getTableName('attendance')
  const result = await pool.query(`DELETE FROM ${attendanceTable} WHERE id = $1`, [id])
  return result.rowCount !== null && result.rowCount > 0
}


