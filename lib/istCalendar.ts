/** Calendar boundaries in Asia/Kolkata as UTC Date instances for MongoDB queries. */

export const APP_TIMEZONE = 'Asia/Kolkata';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

export function istYmd(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

export function getTodayRangeIST(ref: Date = new Date()): { start: Date; end: Date } {
  const dateStr = ref.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
  return {
    start: new Date(`${dateStr}T00:00:00+05:30`),
    end: new Date(`${dateStr}T23:59:59.999+05:30`),
  };
}

export function getThisMonthRangeIST(ref: Date = new Date()): { start: Date; end: Date } {
  const dateStr = ref.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
  const [y, m] = dateStr.split('-').map(Number);
  const lastD = daysInMonth(y, m);
  return {
    start: new Date(`${y}-${pad(m)}-01T00:00:00+05:30`),
    end: new Date(`${y}-${pad(m)}-${pad(lastD)}T23:59:59.999+05:30`),
  };
}

export function getLastMonthRangeIST(ref: Date = new Date()): { start: Date; end: Date } {
  const dateStr = ref.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
  let [y, m] = dateStr.split('-').map(Number);
  m -= 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  const lastD = daysInMonth(y, m);
  return {
    start: new Date(`${y}-${pad(m)}-01T00:00:00+05:30`),
    end: new Date(`${y}-${pad(m)}-${pad(lastD)}T23:59:59.999+05:30`),
  };
}

export function getYearRangeIST(year: number): { start: Date; end: Date } {
  return {
    start: new Date(`${year}-01-01T00:00:00+05:30`),
    end: new Date(`${year}-12-31T23:59:59.999+05:30`),
  };
}
