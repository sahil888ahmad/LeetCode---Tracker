import { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { ToastContext } from '../App'
import StatsCard from '../components/StatsCard'
import SubmissionTable from '../components/SubmissionTable'
import LoadingSpinner from '../components/LoadingSpinner'

function timeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const addToast = useContext(ToastContext)

  const telegramId = localStorage.getItem('lct_telegram_id')

  const [accounts, setAccounts] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)

  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [globalFeed, setGlobalFeed] = useState([])

  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingDash, setLoadingDash] = useState(false)
  const [loadingFeed, setLoadingFeed] = useState(false)

  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [newAccountUsername, setNewAccountUsername] = useState('')
  const [addingAccount, setAddingAccount] = useState(false)

  // 1. Load accounts on mount
  useEffect(() => {
    if (!telegramId) {
      navigate('/track')
      return
    }

    api.getAccounts(telegramId)
      .then(res => {
        setAccounts(res.users || [])
        if (res.users && res.users.length > 0) {
          setSelectedUserId(res.users[0].id)
        } else {
          setSelectedUserId('global')
        }
      })
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoadingAccounts(false))
  }, [telegramId, navigate, addToast])

  // 2. Load dashboard data for selected user
  const loadData = useCallback(async (userId, silent = false) => {
    if (!userId || userId === 'global') return
    if (!silent) setLoadingDash(true)
    else setRefreshing(true)

    try {
      const [userRes, subRes] = await Promise.all([
        api.getUser(userId),
        api.getSubmissions(userId),
      ])
      setUser(userRes.user)
      setSubmissions(subRes.submissions || [])
    } catch (err) {
      if (!silent) addToast(err.message || 'Failed to load telemetry', 'error')
    } finally {
      setLoadingDash(false)
      setRefreshing(false)
    }
  }, [addToast])

  // 3. Load global feed
  const loadGlobalFeed = useCallback(async (silent = false) => {
    if (!silent) setLoadingFeed(true)
    else setRefreshing(true)
    try {
      const res = await api.getFeed()
      setGlobalFeed(res.data || [])
    } catch (err) {
      if (!silent) addToast(err.message || 'Failed to query global feed', 'error')
    } finally {
      setLoadingFeed(false)
      setRefreshing(false)
    }
  }, [addToast])

  useEffect(() => {
    if (selectedUserId === 'global') {
      loadGlobalFeed()
      const interval = setInterval(() => loadGlobalFeed(true), 60 * 1000)
      return () => clearInterval(interval)
    } else if (selectedUserId) {
      loadData(selectedUserId)
      const interval = setInterval(() => loadData(selectedUserId, true), 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [selectedUserId, loadData, loadGlobalFeed])

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await api.toggleNotifications(selectedUserId)
      setUser((u) => ({ ...u, notification_enabled: res.notification_enabled }))
      addToast(res.message, 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove this account? All tracking data will be deleted.')) return
    setDeleting(true)
    try {
      await api.deleteUser(selectedUserId)
      addToast('Account removed from watcher list', 'info')

      const newAccounts = accounts.filter(a => a.id !== selectedUserId)
      setAccounts(newAccounts)
      if (newAccounts.length > 0) {
        setSelectedUserId(newAccounts[0].id)
      } else {
        localStorage.removeItem('lct_telegram_id')
        navigate('/')
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function handleAddAccount(e) {
    e.preventDefault()
    if (!newAccountUsername.trim()) return
    setAddingAccount(true)
    try {
      const res = await api.createUser({
        leetcode_username: newAccountUsername.trim(),
        telegram_chat_id: telegramId
      })
      if (res.alreadyExists) {
        addToast('Account already registered!', 'info')
        const existsInState = accounts.find(a => a.leetcode_username === res.user.leetcode_username)
        if (existsInState) {
          setSelectedUserId(existsInState.id)
        } else {
          setAccounts([...accounts, res.user])
          setSelectedUserId(res.user.id)
        }
      } else {
        addToast('Account registered successfully!', 'success')
        setAccounts([...accounts, res.user])
        setSelectedUserId(res.user.id)
      }
      setIsAddingAccount(false)
      setNewAccountUsername('')
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error')
    } finally {
      setAddingAccount(false)
    }
  }

  if (loadingAccounts) return <LoadingSpinner size="lg" text="Querying user profile directory…" />

  if (accounts.length === 0) {
    return (
      <div className="section" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-title">&gt; NO_ACCOUNTS_LINKED</div>
            <p style={{ color: 'var(--dp-color-ink-muted)', marginBottom: 20 }}>
              No registered profiles found for Chat ID <code>{telegramId}</code>.
            </p>

            {isAddingAccount ? (
              <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'left' }}>
                <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label className="form-label">LeetCode Username</label>
                  <input
                    className="form-input"
                    placeholder="e.g. neal_wu"
                    value={newAccountUsername}
                    onChange={e => setNewAccountUsername(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={addingAccount}>
                      {addingAccount ? 'Executing...' : '[ Confirm ]'}
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddingAccount(false)}>
                      [ Cancel ]
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setIsAddingAccount(true)}>
                [ + Link LeetCode Account ]
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="container">

        {/* ── Accounts Tabs ────────────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Tracked user accounts"
          style={{
            display: 'flex',
            gap: '1ch',
            overflowX: 'auto',
            paddingBottom: 'var(--dp-spacing-row-compact)',
            marginBottom: 'var(--dp-spacing-row)',
            borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
          }}
        >
          {accounts.map(acc => (
            <button
              key={acc.id}
              role="tab"
              aria-selected={selectedUserId === acc.id}
              className={`btn ${selectedUserId === acc.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setSelectedUserId(acc.id)}
            >
              [ @{acc.leetcode_username} ]
            </button>
          ))}
          <button
            role="tab"
            aria-selected={selectedUserId === 'global'}
            className={`btn ${selectedUserId === 'global' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedUserId('global')}
          >
            [ Global Feed ]
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAddingAccount(true)}
            title="Link additional LeetCode profile"
          >
            [ + Add Account ]
          </button>
        </div>

        {/* ── Add Account Form Row ──────────────────────────────────── */}
        {isAddingAccount && (
          <div
            style={{
              marginBottom: 'var(--dp-spacing-row)',
              padding: 'var(--dp-spacing-row-compact)',
              border: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
              background: 'var(--dp-color-ground)',
            }}
          >
            <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>
                  LeetCode Username
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. neal_wu"
                  value={newAccountUsername}
                  onChange={e => setNewAccountUsername(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={addingAccount}>
                {addingAccount ? 'Executing...' : '[ Link Profile ]'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddingAccount(false)}>
                [ Cancel ]
              </button>
            </form>
          </div>
        )}

        {/* ── Global Feed Mode ─────────────────────────────────────── */}
        {selectedUserId === 'global' ? (
          <div className="command-layout">
            <div className="command-gutter">01 // GLOBAL</div>
            <div className="command-output">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <div>
                  <h1 className="section-title">Live Global Problem List</h1>
                  <p className="section-subtitle">
                    Real-time solved telemetry from all tracked competitive programmers across the platform.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadGlobalFeed(true)}
                  disabled={refreshing || loadingFeed}
                >
                  {refreshing ? '[ REFRESHING... ]' : '[ 🔄 Refresh Feed ]'}
                </button>
              </div>

              {loadingFeed ? (
                <LoadingSpinner text="Querying global telemetry feed…" />
              ) : globalFeed.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">&gt; EMPTY_FEED</div>
                  <p style={{ margin: 0, color: 'var(--dp-color-ink-muted)' }}>
                    No recent submissions recorded across the platform.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">USER</th>
                        <th scope="col">PROBLEM_TITLE</th>
                        <th scope="col">DIFFICULTY</th>
                        <th scope="col">LANGUAGE</th>
                        <th scope="col">STATUS</th>
                        <th scope="col">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalFeed.map((s) => {
                        const username = s.users?.leetcode_username || 'Anonymous'
                        const title = s.title || 'Untitled Problem'
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        return (
                          <tr key={s.id}>
                            <td>
                              <a
                                href={`https://leetcode.com/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--dp-color-ink)', fontWeight: 500 }}
                              >
                                @{username}
                              </a>
                            </td>
                            <td>
                              <a
                                href={`https://leetcode.com/problems/${slug}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--dp-color-emphasis)' }}
                              >
                                &gt; {title}
                              </a>
                            </td>
                            <td>
                              <span className={`badge badge-${s.difficulty?.toLowerCase() || 'muted'}`}>
                                [{s.difficulty ? s.difficulty.toUpperCase() : 'UNKNOWN'}]
                              </span>
                            </td>
                            <td><code>{s.language || '—'}</code></td>
                            <td>
                              <span className="badge badge-success">✓ Accepted</span>
                            </td>
                            <td>
                              <span style={{ color: 'var(--dp-color-ink-muted)', fontSize: 13 }}>
                                {timeAgo(s.submitted_at)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : loadingDash ? (
          <LoadingSpinner text="Fetching telemetry and statistics…" />
        ) : user ? (
          <>
            {/* ── User Overview & Controls ────────────────────────────── */}
            <div className="command-layout" style={{ marginBottom: 'var(--dp-spacing-row)' }}>
              <div className="command-gutter">01 // TARGET</div>
              <div className="command-output">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 16,
                    paddingBottom: 'var(--dp-spacing-row-compact)',
                    borderBottom: 'var(--dp-border-hairline) solid var(--dp-color-rule)',
                    marginBottom: 'var(--dp-spacing-row)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h1 style={{ fontSize: 'var(--dp-typography-heading)', margin: 0 }}>
                        <a
                          href={`https://leetcode.com/${user.leetcode_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--dp-color-emphasis)', textDecoration: 'none' }}
                        >
                          @{user.leetcode_username}
                        </a>
                      </h1>
                      <span className="badge badge-success" style={{ fontSize: 12 }}>
                        <span className={`status-dot ${user.notification_enabled ? 'active' : 'inactive'}`} aria-hidden="true" />
                        {user.notification_enabled ? 'TRACKING: ACTIVE' : 'TRACKING: PAUSED'}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--dp-color-ink-muted)', margin: 0 }}>
                      // LAST_CHECK: {timeAgo(user.last_checked_at)} &nbsp;&bull;&nbsp; TELEGRAM_DISPATCH:{' '}
                      {user.notification_enabled ? 'ENABLED' : 'MUTED'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1ch', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => loadData(selectedUserId, true)}
                      disabled={refreshing}
                    >
                      {refreshing ? '[ REFRESHING... ]' : '[ 🔄 Refresh ]'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleToggle}
                      disabled={toggling}
                    >
                      {toggling ? '[ UPDATING... ]' : user.notification_enabled ? '[ ⏸ Pause Alerts ]' : '[ ▶ Resume Alerts ]'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? '[ REMOVING... ]' : '[ ✕ Remove Account ]'}
                    </button>
                  </div>
                </div>

                {/* ── Stats Grid ────────────────────────────────────────── */}
                <div className="stats-grid">
                  <StatsCard
                    title="Total Solved"
                    value={user.total_solved}
                    color="var(--dp-color-emphasis)"
                  />
                  <StatsCard
                    title="Easy Solved"
                    value={user.easy_solved}
                    color="var(--dp-color-ink)"
                  />
                  <StatsCard
                    title="Medium Solved"
                    value={user.medium_solved}
                    color="var(--yellow)"
                  />
                  <StatsCard
                    title="Hard Solved"
                    value={user.hard_solved}
                    color="var(--red)"
                  />
                </div>
              </div>
            </div>

            {/* ── Submissions Table ───────────────────────────────────── */}
            <div className="command-layout">
              <div className="command-gutter">02 // SOLVES</div>
              <div className="command-output">
                <div className="section-header">
                  <h2 className="section-title">Recent Auto-Detected Submissions</h2>
                  <p className="section-subtitle">
                    Chronological record of verified accepted solutions retrieved by edge workers.
                  </p>
                </div>
                <SubmissionTable submissions={submissions} />
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">&gt; PROFILE_NOT_FOUND</div>
            <p style={{ margin: 0, color: 'var(--dp-color-ink-muted)' }}>User telemetry could not be retrieved.</p>
          </div>
        )}
      </div>
    </div>
  )
}
