export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function formatDaysLeft(daysLeft: number, reminderType: string): string {
  if (daysLeft < 0) {
    return reminderType === 'expiry' ? `Overdue by ${Math.abs(daysLeft)}d` : `Renewed ${Math.abs(daysLeft)}d ago`
  }
  if (daysLeft === 0) return 'Today'
  return `${daysLeft}d left`
}