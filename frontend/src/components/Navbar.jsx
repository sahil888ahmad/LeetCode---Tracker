import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const [telegramId, setTelegramId] = useState(() => localStorage.getItem('lct_telegram_id'))

  useEffect(() => {
    const checkId = () => setTelegramId(localStorage.getItem('lct_telegram_id'))
    window.addEventListener('storage', checkId)
    const timer = setInterval(checkId, 1000)
    return () => {
      window.removeEventListener('storage', checkId)
      clearInterval(timer)
    }
  }, [])

  function handleSwitch() {
    localStorage.removeItem('lct_telegram_id')
    localStorage.removeItem('lct_user_id')
    setTelegramId(null)
    navigate('/track')
  }

  return (
    <nav className="navbar" aria-label="Session bar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" title="LeetCode Tracker Session">
          <span style={{ color: 'var(--dp-color-emphasis)' }}>&gt;</span>
          <span>LEETCODE_TRACKER</span>
          <span className="terminal-cursor" aria-hidden="true" />
        </Link>

        <div className="navbar-actions">
          <span
            style={{
              fontSize: 13,
              color: 'var(--dp-color-ink-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              marginRight: '1ch',
            }}
          >
            <span className="status-dot active" aria-hidden="true" />
            SYS:ONLINE
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              navigate('/')
              setTimeout(() => {
                const el = document.getElementById('global-activity')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            [ Global Feed ]
          </button>

          {telegramId ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/dashboard')}
              >
                [ My Dashboard ]
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSwitch}
                title="Switch or disconnect Telegram Chat ID"
              >
                [ Switch ID ]
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/track')}
            >
              [ Start Tracking ]
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
