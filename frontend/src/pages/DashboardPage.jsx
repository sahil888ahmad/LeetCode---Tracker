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
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const addToast = useContext(ToastContext)

  const telegramId = localStorage.getItem('lct_telegram_id')

  const [accounts, setAccounts] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  
  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState([])
  
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingDash, setLoadingDash] = useState(false)
  
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 1. Load accounts on mount
  useEffect(() => {
    if (!telegramId) {
      navigate('/track')
      return
    }

    api.getAccounts(telegramId)
      .then(res => {
        setAccounts(res.users)
        if (res.users.length > 0) {
          setSelectedUserId(res.users[0].id)
        }
      })
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoadingAccounts(false))
  }, [telegramId, navigate, addToast])

  // 2. Load dashboard data for selected user
  const loadData = useCallback(async (userId, silent = false) => {
    if (!userId) return
    if (!silent) setLoadingDash(true)
    else setRefreshing(true)
    
    try {
      const [userRes, subRes] = await Promise.all([
        api.getUser(userId),
        api.getSubmissions(userId),
      ])
      setUser(userRes.user)
      setSubmissions(subRes.submissions)
    } catch (err) {
      if (!silent) addToast(err.message || 'Failed to load dashboard', 'error')
    } finally {
      setLoadingDash(false)
      setRefreshing(false)
    }
  }, [addToast])

  useEffect(() => {
    loadData(selectedUserId)
    const interval = setInterval(() => loadData(selectedUserId, true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedUserId, loadData])

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
      addToast('Account removed', 'info')
      
      // Update accounts list
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

  if (loadingAccounts) return <LoadingSpinner size="lg" text="Loading your accounts…" />

  if (accounts.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state-icon">❌</div>
        <div className="empty-state-title">No accounts found</div>
        <button className="btn btn-primary" onClick={() => navigate('/track')} style={{ marginTop: 16 }}>
          Add Account
        </button>
      </div>
    )
  }

  return (
    <div className="container section animate-fadeIn">
      
      {/* ── Accounts Tabs ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {accounts.map(acc => (
          <button
            key={acc.id}
            className={`btn ${selectedUserId === acc.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 20, whiteSpace: 'nowrap' }}
            onClick={() => setSelectedUserId(acc.id)}
          >
            @{acc.leetcode_username}
          </button>
        ))}
        <button
          className="btn btn-secondary"
          style={{ borderRadius: 20, border: '1px dashed var(--border)' }}
          onClick={() => navigate('/track')}
        >
          + Add Account
        </button>
      </div>

      {loadingDash ? (
         <LoadingSpinner text="Loading stats…" />
      ) : user ? (
        <>
          {/* ── Header ────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: 28 }}>
                  <a href={`https://leetcode.com/${user.leetcode_username}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>
                    @{user.leetcode_username}
                  </a>
                </h1>
                <span className="badge badge-success" style={{ fontSize: 12 }}>
                  <span className={`status-dot ${user.notification_enabled ? 'active' : 'inactive'}`} />
                  {user.notification_enabled ? 'Tracking Active' : 'Paused'}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Last checked: {timeAgo(user.last_checked_at)} &nbsp;·&nbsp; Telegram:{' '}
                {user.notification_enabled ? '🟢 Enabled' : '🔴 Disabled'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => loadData(selectedUserId, true)}
                disabled={refreshing}
              >
                {refreshing ? <span className="spinner" /> : '🔄'} Refresh
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleToggle}
                disabled={toggling}
              >
                {toggling ? <span className="spinner" /> : (user.notification_enabled ? 'Pause Alerts' : 'Resume Alerts')}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <span className="spinner" /> : 'Remove Account'}
              </button>
            </div>
          </div>

          {/* ── Stats Grid ────────────────────────────────────── */}
          <div className="stats-grid">
            <StatsCard
              title="Total Solved"
              value={user.total_solved}
              color="var(--primary)"
              icon="🏆"
            />
            <StatsCard
              title="Easy"
              value={user.easy_solved}
              color="#00b8a3"
              icon="🟢"
            />
            <StatsCard
              title="Medium"
              value={user.medium_solved}
              color="#ffc01e"
              icon="🟡"
            />
            <StatsCard
              title="Hard"
              value={user.hard_solved}
              color="#ff375f"
              icon="🔴"
            />
          </div>

          {/* ── Submissions Table ─────────────────────────────── */}
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Recent Auto-Detected Submissions</h2>
            <SubmissionTable submissions={submissions} />
          </div>
        </>
      ) : (
         <div style={{ padding: '2rem', textAlign: 'center' }}>User data not found</div>
      )}
    </div>
  )
}
