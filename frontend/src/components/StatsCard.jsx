export default function StatsCard({ label, value, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
