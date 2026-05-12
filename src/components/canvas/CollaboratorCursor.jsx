/**
 * CollaboratorCursor — renders a named cursor for a remote user.
 * Supports both fixed-string positions (e.g. "30%") and live percentage
 * values from socket (0–1 floats converted to %).
 */
export default function CollaboratorCursor({ name, color, x, y, icon, action }) {
  const colorMap = {
    primary:   {
      bg:    'bg-primary',
      text:  'text-on-primary',
      ring:  'border-primary',
      label: 'text-primary/80',
      line:  'bg-primary/30',
    },
    secondary: {
      bg:    'bg-secondary',
      text:  'text-on-secondary',
      ring:  'border-secondary',
      label: 'text-secondary/80',
      line:  'bg-secondary/30',
    },
    tertiary: {
      bg:    'bg-tertiary',
      text:  'text-on-tertiary',
      ring:  'border-tertiary',
      label: 'text-tertiary/80',
      line:  'bg-tertiary/30',
    },
  }
  const c = colorMap[color] ?? colorMap.primary

  /* Normalize x/y — accept either "30%" strings or 0–1 floats */
  const left = typeof x === 'number' ? `${(x * 100).toFixed(1)}%` : x
  const top  = typeof y === 'number' ? `${(y * 100).toFixed(1)}%` : y

  return (
    <div
      className="collab-cursor flex flex-col items-start gap-1 z-20"
      style={{ left, top }}
    >
      {/* Name badge with cursor arrow icon */}
      <div
        className={`flex items-center gap-1 ${c.bg} ${c.text} px-2 py-1 rounded-sm text-[10px] font-bold font-headline shadow-lg`}
      >
        <span className="material-symbols-outlined text-sm">near_me</span>
        <span>{name}</span>
      </div>

      {/* Connector line */}
      <div className={`w-px h-10 ml-2 ${c.line}`} />

      {/* Target circle */}
      <div
        className={`w-7 h-7 rounded-full border ${c.ring} bg-current/5 flex items-center justify-center ml-0.5`}
      >
        <span className={`material-symbols-outlined ${c.label.split('/')[0]} text-sm`}>
          {icon ?? 'near_me'}
        </span>
      </div>

      {/* Action label */}
      {action && (
        <span className={`text-[8px] ${c.label} font-label ml-2 uppercase tracking-wider`}>
          {action}
        </span>
      )}
    </div>
  )
}
