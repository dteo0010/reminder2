const TIMEZONE = 'Asia/Kuala_Lumpur'

function getTodayInTimezone(): Date {
  const now = new Date()
  const localDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return new Date(`${localDateStr}T00:00:00Z`)
}

export function daysUntil(dateStr: string): number {
  const today = getTodayInTimezone()
  const target = new Date(`${dateStr}T00:00:00Z`)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function formatDaysLeft(daysLeft: number, reminderType: string): string {
  if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'}`
  if (daysLeft === 0) return 'Due today'
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
}