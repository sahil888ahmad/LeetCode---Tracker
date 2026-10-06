import { useEffect } from 'react'

function Toast({ id, message, type, onRemove }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className={`toast toast-${type}`}>
      <span>{icons[type] || icons.info}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}
      >
        ✕
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  )
}
