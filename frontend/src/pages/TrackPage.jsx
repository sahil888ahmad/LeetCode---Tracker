import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { ToastContext } from '../App'

function Field({ label, hint, id, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {hint && <span className="form-hint">// {hint}</span>}
      {children}
      {error && <span className="form-error">[ERR] {error}</span>}
    </div>
  )
}

export default function TrackPage() {
  const navigate = useNavigate()
  const addToast = useContext(ToastContext)
  const existingTelegramId = localStorage.getItem('lct_telegram_id')

  const [form, setForm] = useState({
    leetcode_username: '',
    telegram_chat_id: existingTelegramId || '',
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
        addToast('Profile recognized. Redirecting to dashboard...', 'info')
      } else {
        addToast('Tracker initialized. Alerts will trigger on new submissions.', 'success')
      }
      navigate(`/dashboard`)
    } catch (err) {
      addToast(err.message || 'Operation failed. Verify profile data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="container">
        <div className="command-layout">
          <div className="command-gutter">01 // REGISTER</div>
          <div className="command-output">
            <div className="section-header">
              <h1 className="section-title">Configure Telemetry Watcher</h1>
              <p className="section-subtitle">
                Register your LeetCode profile and Telegram numeric ID for automated polling.
              </p>
            </div>

            {/* Instruction Box */}
            <div
              style={{
                border: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                padding: 'var(--dp-spacing-row-compact)',
                marginBottom: 'var(--dp-spacing-row)',
                background: 'var(--dp-color-ground)',
              }}
            >
              <div
                style={{
                  color: 'var(--dp-color-emphasis)',
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 10,
                  letterSpacing: '0.05em',
                }}
              >
                // PROTOCOL: RETRIEVE TELEGRAM CHAT ID
              </div>
              <ol
                style={{
                  fontSize: 14,
                  color: 'var(--dp-color-ink-muted)',
                  paddingLeft: '3ch',
                  lineHeight: 'var(--dp-typography-list-leading)',
                }}
              >
                <li>
                  Open Telegram and dispatch a message to{' '}
                  <strong style={{ color: 'var(--dp-color-emphasis)' }}>@userinfobot</strong>
                </li>
                <li>
                  Send standard initialize command <code>/start</code>
                </li>
                <li>
                  Capture the returned numerical <strong>Id</strong> (e.g. <code>123456789</code>)
                </li>
                <li>
                  Verify your bot permissions so push dispatches are accepted.
                </li>
              </ol>
            </div>

            {/* Form Box */}
            <div
              style={{
                border: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                padding: 'var(--dp-spacing-row)',
                background: 'var(--dp-color-ground)',
                maxWidth: 680,
              }}
            >
              <form onSubmit={handleSubmit}>
                <Field
                  id="username"
                  label="LeetCode Username"
                  hint="Public handle used in leetcode.com/username"
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
                  label="Telegram Numeric Chat ID"
                  hint="Numeric identifier provided by @userinfobot"
                  error={errors.telegram_chat_id}
                >
                  <input
                    id="telegram_chat_id"
                    className={`form-input ${errors.telegram_chat_id ? 'error' : ''}`}
                    placeholder="e.g. 123456789"
                    value={form.telegram_chat_id}
                    onChange={update('telegram_chat_id')}
                    type="text"
                    autoComplete="off"
                  />
                </Field>

                <div style={{ marginTop: 'var(--dp-spacing-row-compact)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', padding: '12px 2ch' }}
                  >
                    {loading ? (
                      <>
                        [ VERIFYING PROFILE <span className="terminal-cursor" aria-hidden="true" /> ]
                      </>
                    ) : (
                      '[ > EXECUTE: START TRACKING ]'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div
              style={{
                marginTop: 'var(--dp-spacing-row-compact)',
                fontSize: 13,
                color: 'var(--dp-color-ink-muted)',
              }}
            >
              // NOTE: Chat ID is stored in Supabase PostgreSQL; never disclosed to public browser sessions.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
