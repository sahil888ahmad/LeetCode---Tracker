import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { ToastContext } from '../App'
import LoadingSpinner from '../components/LoadingSpinner'

function Field({ label, hint, id, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {hint && <span className="form-hint">{hint}</span>}
      {children}
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  )
}

export default function TrackPage() {
  const navigate = useNavigate()
  const addToast = useContext(ToastContext)

  useEffect(() => {
    const telegramId = localStorage.getItem('lct_telegram_id')
    if (telegramId) {
      navigate(`/dashboard`)
    }
  }, [navigate])

  const [form, setForm] = useState({
    leetcode_username: '',
    telegram_chat_id: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function validate() {
    const errs = {}
    if (!form.leetcode_username.trim()) errs.leetcode_username = 'Username is required'
    if (!form.telegram_chat_id.trim()) errs.telegram_chat_id = 'Telegram Chat ID is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await api.createUser({
        leetcode_username: form.leetcode_username.trim().toLowerCase(),
        telegram_chat_id: form.telegram_chat_id.trim(),
      })

      const telegramId = form.telegram_chat_id.trim()
      localStorage.setItem('lct_telegram_id', telegramId)

      if (res.alreadyExists) {
        addToast('Welcome back! Redirecting to your dashboard…', 'info')
      } else {
        addToast('🎉 Tracker created! You will get Telegram alerts within 15 minutes.', 'success')
      }
      navigate(`/dashboard`)
    } catch (err) {
      addToast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 128px)',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 24px',
        background: 'var(--gradient-hero)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 64, height: 64,
              background: 'var(--gradient-accent)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 20px',
            }}
          >
            ⚡
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Start Tracking</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your details below to receive Telegram alerts for every accepted submission.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 28,
          }}
        >
          <p style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600, marginBottom: 8 }}>
            📱 Step 1: Get your Telegram Chat ID (one-time)
          </p>
          <ol style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Open Telegram and search for <strong style={{ color: 'var(--text-primary)' }}>@userinfobot</strong></li>
            <li>Send a message to the bot (e.g., <code style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 4 }}>/start</code>)</li>
            <li>It will reply with your <strong>Id</strong> (a number like <code style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 4 }}>123456789</code>)</li>
            <li>Start a chat with our bot (your bot link here) so it has permission to message you.</li>
          </ol>
        </div>

        {/* Form */}
        <div className="card" style={{ borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Field
              id="username"
              label="LeetCode Username"
              hint="Your public LeetCode username (not email)"
              error={errors.leetcode_username}
            >
              <input
                id="username"
                className={`form-input ${errors.leetcode_username ? 'error' : ''}`}
                placeholder="e.g. neal_wu"
                value={form.leetcode_username}
                onChange={update('leetcode_username')}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <Field
              id="telegram_chat_id"
              label="Telegram Chat ID"
              hint="Your numeric ID from @userinfobot"
              error={errors.telegram_chat_id}
            >
              <input
                id="telegram_chat_id"
                className={`form-input ${errors.telegram_chat_id ? 'error' : ''}`}
                placeholder="e.g. 123456789"
                value={form.telegram_chat_id}
                onChange={update('telegram_chat_id')}
                type="text"
              />
            </Field>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}
            >
              {loading ? (
                <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Verifying profile…</>
              ) : (
                '🚀 Start Tracking'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
          Your Chat ID is stored securely and never exposed to the browser.
        </p>
      </div>
    </div>
  )
}
