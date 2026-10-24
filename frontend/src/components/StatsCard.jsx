export default function StatsCard({ title, label, value, color, icon, className = '' }) {
  const displayTitle = title || label

  return (
    <div className={`stat-card ${className}`} style={{ borderLeft: `2px solid ${color || 'var(--dp-color-rule)'}` }}>
      <div className="stat-label">
        {icon && <span style={{ marginRight: '1ch' }}>{icon}</span>}
        // {displayTitle}
      </div>
      <div className="stat-value" style={{ color: color || 'var(--dp-color-emphasis)' }}>
        {value ?? '—'}
      </div>
    </div>
  )
}
