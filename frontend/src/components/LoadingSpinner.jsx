export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 16, md: 24, lg: 40 }
  const px = sizes[size] || 24

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
      <div
        style={{
          width: px,
          height: px,
          border: `2px solid rgba(255,255,255,0.1)`,
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{text}</p>}
    </div>
  )
}
