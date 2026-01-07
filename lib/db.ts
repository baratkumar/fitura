import { Pool } from 'pg'
import { getTableName } from './tableNames'

// Extract Supabase project ref from URL if provided
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    // Extract project ref from URL like https://oyhjmwkrpdgwrbufgucg.supabase.co
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
    if (match) {
      const projectRef = match[1]
      return {
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.DB_PASSWORD || '',
      }
    }
  }
  return null
}

// Database connection pool
const supabaseConfig = getSupabaseConfig()
const poolConfig = supabaseConfig 
  ? {
      ...supabaseConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'fitura',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }

const pool = new Pool(poolConfig)

// Initialize database tables
export async function initDatabase() {
  try {
    const membershipsTable = getTableName('memberships')
    const clientsTable = getTableName('clients')
    const attendanceTable = getTableName('attendance')

    // Create memberships table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${membershipsTable} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        duration_days INTEGER NOT NULL,
        price DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${clientsTable} (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        age INTEGER,
        height DECIMAL(5, 2),
        weight DECIMAL(5, 2),
        gender VARCHAR(20),
        blood_group VARCHAR(5),
        bmi DECIMAL(5, 2),
        aadhar_number VARCHAR(12),
        photo_url TEXT,
        address TEXT,
        membership_type INTEGER REFERENCES ${membershipsTable}(id),
        joining_date DATE,
        expiry_date DATE,
        membership_fee DECIMAL(10, 2),
        discount DECIMAL(10, 2) DEFAULT 0,
        payment_date DATE,
        payment_mode VARCHAR(20),
        transaction_id VARCHAR(255),
        paid_amount DECIMAL(10, 2),
        emergency_contact_name VARCHAR(255) NOT NULL,
        emergency_contact_phone VARCHAR(50) NOT NULL,
        medical_conditions TEXT,
        fitness_goals TEXT,
        first_time_in_gym VARCHAR(10),
        previous_gym_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create index on email for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${clientsTable}_email ON ${clientsTable}(email)
    `)

    // Create attendance table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${attendanceTable} (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES ${clientsTable}(id) ON DELETE CASCADE,
        attendance_date DATE NOT NULL,
        attendance_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, attendance_date, attendance_time)
      )
    `)

    // Create indexes for attendance table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${attendanceTable}_client_id ON ${attendanceTable}(client_id)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${attendanceTable}_date ON ${attendanceTable}(attendance_date)
    `)

    // Add new columns if they don't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE ${clientsTable} 
        ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
        ADD COLUMN IF NOT EXISTS bmi DECIMAL(5, 2),
        ADD COLUMN IF NOT EXISTS photo_url TEXT,
        ADD COLUMN IF NOT EXISTS joining_date DATE,
        ADD COLUMN IF NOT EXISTS expiry_date DATE,
        ADD COLUMN IF NOT EXISTS membership_fee DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS payment_date DATE,
        ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20),
        ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2)
      `)
    } catch (error) {
      // Columns might already exist, ignore error
      console.log('Note: Some columns may already exist')
    }

    // Insert default memberships if table is empty
    const membershipCount = await pool.query(`SELECT COUNT(*) FROM ${membershipsTable}`)
    if (parseInt(membershipCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO ${membershipsTable} (name, description, duration_days, price, is_active) VALUES
        ('Monthly', 'Monthly membership', 30, 0, true),
        ('Quarterly', 'Quarterly membership (3 months)', 90, 0, true),
        ('Yearly', 'Yearly membership', 365, 0, true),
        ('Day Pass', 'Single day pass', 1, 0, true),
        ('Trial', 'Trial membership (7 days)', 7, 0, true)
      `)
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export default pool

