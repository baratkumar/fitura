/**
 * Get table name with environment-based prefix
 * - local: FT_LCL
 * - staging: FT_STG
 * - production: FT_PRD
 */
function getTablePrefix(): string {
  const nodeEnv = process.env.NODE_ENV || 'local'
  
  if (nodeEnv === 'production') {
    return 'FT_PRD'
  } else if (nodeEnv === 'staging') {
    return 'FT_STG'
  } else {
    return 'FT_LCL'
  }
}

const prefix = getTablePrefix()

export const tableNames = {
  memberships: `${prefix}_memberships`,
  clients: `${prefix}_clients`,
  attendance: `${prefix}_attendance`,
}

/**
 * Get a table name by key
 */
export function getTableName(key: 'memberships' | 'clients' | 'attendance'): string {
  return tableNames[key]
}

