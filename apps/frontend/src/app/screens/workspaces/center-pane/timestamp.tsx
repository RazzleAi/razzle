import { DateTime } from 'luxon'

function timestampMillisToTime(timestampMillis: number): string {
  const dt = DateTime.fromMillis(timestampMillis)
  return dt.toLocaleString({ hour: 'numeric', minute: 'numeric' })
}

export function Timestamp({ timestampMillis }: { timestampMillis: number }) {
  return (
    <span className="text-xs text-gray-400">
      {/* TODO: show pill at top of screen showing date */}
      {timestampMillisToTime(timestampMillis)}
    </span>
  )
}
