export function formatStageLabel(stage: number): string {
  if (stage < 0) return `Overdue reminder (${Math.abs(stage)}+ days past due)`
  if (stage === 0) return 'Due today'
  return `${stage}-day reminder`
}