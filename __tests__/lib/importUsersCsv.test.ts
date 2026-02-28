import { parseCsvToRows, toDurationDays } from '../../lib/importUsersCsv';

// ---------------------------------------------------------------------------
// Helper – builds a valid header row matching the expected column layout
// ---------------------------------------------------------------------------
const HEADER =
  'User ID,First Name,Last Name,Gender,PT,Sub Months,Sub Amount,Paid Amount,Pending,Recent Paid,Joined,Renewed,Expiry,Mobile,Aadhar,Height,Weight,Email,DOB,Gym Goal,Address,Added By';

/** Build a CSV string from header + one or more data rows */
function csv(...dataRows: string[]): string {
  return [HEADER, ...dataRows].join('\n');
}

/** A complete, valid data row with sensible defaults */
const DEFAULT_ROW =
  '1,John,Doe,Male,,1 Month,1000,1000,0,2024-01-01,2024-01-01,2024-01-01,2024-02-01,9876543210,123456789012,170,70,john@example.com,1990-01-01,Fitness,Mumbai,Admin';

// ===========================================================================
// toDurationDays
// ===========================================================================
describe('toDurationDays', () => {
  it('returns 30 days for 1 month (MONTHS_TO_DAYS lookup)', () => {
    expect(toDurationDays('1')).toBe(30);
  });

  it('returns 60 days for 2 months', () => {
    expect(toDurationDays('2')).toBe(60);
  });

  it('returns 90 days for 3 months', () => {
    expect(toDurationDays('3')).toBe(90);
  });

  it('returns 180 days for 6 months', () => {
    expect(toDurationDays('6')).toBe(180);
  });

  it('returns 365 days for 12 months (exact lookup)', () => {
    expect(toDurationDays('12')).toBe(365);
  });

  it('returns 395 days for 13 months', () => {
    expect(toDurationDays('13')).toBe(395);
  });

  it('returns 420 days for 14 months', () => {
    expect(toDurationDays('14')).toBe(420);
  });

  it('returns 450 days for 15 months', () => {
    expect(toDurationDays('15')).toBe(450);
  });

  it('falls back to n*30 for months not in the lookup table (4 months)', () => {
    expect(toDurationDays('4')).toBe(120);
  });

  it('falls back to n*30 for months not in the lookup table (7 months)', () => {
    expect(toDurationDays('7')).toBe(210);
  });

  it('falls back to n*30 for months not in the lookup table (9 months)', () => {
    expect(toDurationDays('9')).toBe(270);
  });

  it('returns 30 for an empty string (NaN fallback)', () => {
    expect(toDurationDays('')).toBe(30);
  });

  it('returns 30 for a purely alphabetic string (NaN fallback)', () => {
    expect(toDurationDays('abc')).toBe(30);
  });

  it('strips non-digit characters and parses the number ("5 Months")', () => {
    expect(toDurationDays('5 Months')).toBe(150); // 5 * 30, not in lookup
  });

  it('strips non-digit characters for a lookup value ("12 Months")', () => {
    expect(toDurationDays('12 Months')).toBe(365);
  });
});

// ===========================================================================
// parseCsvToRows
// ===========================================================================
describe('parseCsvToRows', () => {
  // -------------------------------------------------------------------------
  // Edge cases – empty / header-only input
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('returns [] for an empty string', () => {
      expect(parseCsvToRows('')).toEqual([]);
    });

    it('returns [] for a string with only whitespace', () => {
      expect(parseCsvToRows('   ')).toEqual([]);
    });

    it('returns [] when only the header row is present', () => {
      expect(parseCsvToRows(HEADER)).toEqual([]);
    });

    it('returns [] for only a header and a blank line', () => {
      expect(parseCsvToRows(HEADER + '\n')).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Basic parsing
  // -------------------------------------------------------------------------
  describe('basic parsing', () => {
    it('parses a single data row into one CsvRow', () => {
      const rows = parseCsvToRows(csv(DEFAULT_ROW));
      expect(rows).toHaveLength(1);
    });

    it('parses multiple data rows', () => {
      const row2 = '2,Jane,Smith,Female,,3 Month,3000,3000,0,,,,,8765432109,,,,,,,N/A,';
      const rows = parseCsvToRows(csv(DEFAULT_ROW, row2));
      expect(rows).toHaveLength(2);
    });

    it('maps firstName correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].firstName).toBe('John');
    });

    it('maps lastName correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].lastName).toBe('Doe');
    });

    it('maps gender correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].gender).toBe('Male');
    });

    it('maps mobile correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].mobile).toBe('9876543210');
    });

    it('maps subscriptionAmount as a number', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].subscriptionAmount).toBe(1000);
    });

    it('maps paidAmount as a number', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].paidAmount).toBe(1000);
    });

    it('maps email correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].email).toBe('john@example.com');
    });

    it('maps address correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].address).toBe('Mumbai');
    });

    it('maps userId correctly', () => {
      expect(parseCsvToRows(csv(DEFAULT_ROW))[0].userId).toBe('1');
    });
  });

  // -------------------------------------------------------------------------
  // Fallback / default values
  // -------------------------------------------------------------------------
  describe('fallback values', () => {
    const emptyRow = '1,,,,,,0,0,0,,,,,,,,,,,,,';

    it('defaults firstName to "Unknown" when the cell is empty', () => {
      const row = '1,,Doe,Male,,1 Month,0,0,0,,,,,9876543210,,,,,,,N/A,';
      expect(parseCsvToRows(csv(row))[0].firstName).toBe('Unknown');
    });

    it('defaults lastName to "." when the cell is empty', () => {
      const row = '1,John,,Male,,1 Month,0,0,0,,,,,9876543210,,,,,,,N/A,';
      expect(parseCsvToRows(csv(row))[0].lastName).toBe('.');
    });

    it('defaults mobile to "0000000000" when the cell is empty', () => {
      const row = '1,John,Doe,Male,,1 Month,0,0,0,,,,,,,,,,,,,N/A,';
      expect(parseCsvToRows(csv(row))[0].mobile).toBe('0000000000');
    });

    it('defaults address to "N/A" when the cell is empty', () => {
      expect(parseCsvToRows(csv(emptyRow))[0].address).toBe('N/A');
    });

    it('defaults subscriptionAmount to 0 for non-numeric value', () => {
      const row = '1,John,Doe,Male,,1 Month,abc,xyz,0,,,,,9876543210,,,,,,,N/A,';
      expect(parseCsvToRows(csv(row))[0].subscriptionAmount).toBe(0);
    });

    it('defaults paidAmount to 0 for non-numeric value', () => {
      const row = '1,John,Doe,Male,,1 Month,abc,xyz,0,,,,,9876543210,,,,,,,N/A,';
      expect(parseCsvToRows(csv(row))[0].paidAmount).toBe(0);
    });

    it('defaults subscriptionAmount to 0 for empty cell', () => {
      expect(parseCsvToRows(csv(emptyRow))[0].subscriptionAmount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Quoted fields
  // -------------------------------------------------------------------------
  describe('quoted fields (commas inside values)', () => {
    it('handles an address that contains commas', () => {
      const row = '1,John,Doe,Male,,1 Month,1000,1000,0,,,,,9876543210,,,,,,,"123, Main Street, Mumbai",';
      expect(parseCsvToRows(csv(row))[0].address).toBe('123, Main Street, Mumbai');
    });

    it('parses multiple comma-containing fields in the same row', () => {
      // Columns: 0-17 then DOB(18) empty, GYM_GOAL(19) quoted, ADDRESS(20) quoted
      const row = '1,John,Doe,Male,,1 Month,1000,1000,0,,,,,9876543210,,,,john@example.com,,"Weight Loss, Strength","Apt 5, Block B",';
      const result = parseCsvToRows(csv(row))[0];
      expect(result.gymGoal).toBe('Weight Loss, Strength');
      expect(result.address).toBe('Apt 5, Block B');
    });
  });

  // -------------------------------------------------------------------------
  // Mobile number normalisation
  // -------------------------------------------------------------------------
  describe('mobile normalisation', () => {
    it('strips internal spaces from mobile numbers', () => {
      const row = '1,John,Doe,Male,,1 Month,0,0,0,,,,,987 654 3210,,,,,,,N/A,';
      expect(parseCsvToRows(csv(row))[0].mobile).toBe('9876543210');
    });

    it('trims leading/trailing whitespace from mobile', () => {
      const row = '1,John,Doe,Male,,1 Month,0,0,0,,,,, 9876543210 ,,,,,,,N/A,';
      // The CSV parser trims individual cells, and then we strip all whitespace
      expect(parseCsvToRows(csv(row))[0].mobile).toBe('9876543210');
    });
  });

  // -------------------------------------------------------------------------
  // Numeric amount parsing
  // -------------------------------------------------------------------------
  describe('numeric amount parsing', () => {
    it('parses decimal subscription amounts correctly', () => {
      const row = '1,John,Doe,Male,,1 Month,2500.50,2000.75,0,,,,,9876543210,,,,,,,N/A,';
      const result = parseCsvToRows(csv(row))[0];
      expect(result.subscriptionAmount).toBeCloseTo(2500.5);
      expect(result.paidAmount).toBeCloseTo(2000.75);
    });
  });

  // -------------------------------------------------------------------------
  // Line-ending support
  // -------------------------------------------------------------------------
  describe('line endings', () => {
    it('handles Windows-style CRLF line endings', () => {
      const crlfCsv = [HEADER, DEFAULT_ROW].join('\r\n');
      const rows = parseCsvToRows(crlfCsv);
      expect(rows).toHaveLength(1);
      expect(rows[0].firstName).toBe('John');
    });

    it('handles Unix-style LF line endings', () => {
      const lfCsv = [HEADER, DEFAULT_ROW].join('\n');
      const rows = parseCsvToRows(lfCsv);
      expect(rows).toHaveLength(1);
      expect(rows[0].firstName).toBe('John');
    });
  });

  // -------------------------------------------------------------------------
  // Row ordering
  // -------------------------------------------------------------------------
  describe('row ordering', () => {
    it('preserves the order of rows as they appear in the CSV', () => {
      const row1 = '1,Alice,A,Female,,1 Month,0,0,0,,,,,1111111111,,,,,,,N/A,';
      const row2 = '2,Bob,B,Male,,3 Month,0,0,0,,,,,2222222222,,,,,,,N/A,';
      const row3 = '3,Carol,C,Female,,6 Month,0,0,0,,,,,3333333333,,,,,,,N/A,';
      const rows = parseCsvToRows(csv(row1, row2, row3));
      expect(rows[0].firstName).toBe('Alice');
      expect(rows[1].firstName).toBe('Bob');
      expect(rows[2].firstName).toBe('Carol');
    });
  });
});
