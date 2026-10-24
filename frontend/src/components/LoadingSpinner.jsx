export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1ch',
        padding: '36px 0',
        color: 'var(--dp-color-ink)',
        fontFamily: 'var(--dp-typography-face)',
        fontSize: size === 'lg' ? 18 : 15,
      }}
      role="status"
    >
      <span>&gt;&gt;</span>
      <span>{text}</span>
      <span className="terminal-cursor" aria-hidden="true" />
    </div>
  )
}
