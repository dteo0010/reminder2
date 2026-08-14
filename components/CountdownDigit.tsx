export type Tier = 'overdue' | 'thisWeek' | 'thisMonth' | 'later'

export const TIER_COLOR: Record<Tier, string> = {
  overdue: 'text-urgent',
  thisWeek: 'text-soon',
  thisMonth: 'text-upcoming',
  later: 'text-later',
}

export function getTier(daysLeft: number): Tier {
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= 7) return 'thisWeek'
  if (daysLeft <= 30) return 'thisMonth'
  return 'later'
}

export function CountdownDigit({ daysLeft, size = 'md' }: { daysLeft: number; size?: 'sm' | 'md' | 'lg' }) {
  const colorClass = TIER_COLOR[getTier(daysLeft)]
  const digitSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-2xl' : 'text-lg'
  const labelSize = size === 'lg' ? 'text-xs' : 'text-[0.65rem]'

  if (daysLeft === 0) {
    return (
      <div className={`flex flex-col items-center ${colorClass}`}>
        <span className={`digit ${size === 'lg' ? 'text-3xl' : 'text-base'}`}>TODAY</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${colorClass}`}>
      <span className={`digit ${digitSize} leading-none`}>{Math.abs(daysLeft)}</span>
      <span className={`font-display ${labelSize} tracking-wider uppercase mt-0.5 whitespace-nowrap`}>
        {daysLeft < 0 ? 'overdue' : 'days left'}
      </span>
    </div>
  )
}