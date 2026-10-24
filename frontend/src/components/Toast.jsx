export function Toast({ id, message, type, onRemove }) {
  const typeTag = {
    success: '[OK]',
    error: '[ERR]',
    info: '[MSG]',
  }[type] || '[SYS]'

  return (
    <div className={`toast toast-${type}`} role="status">
      <span style={{ fontWeight: 600 }}>{typeTag}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          fontFamily: 'inherit',
          fontSize: 14,
          padding: '0 4px',
        }}
      >
        [X]
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  )
}
