import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../services/api'

const features = [
  {
    icon: '🔍',
    title: 'Auto-Detection',
    desc: 'Automatically checks your LeetCode profile every 15 minutes and detects new accepted solutions.',
  },
  {
    icon: '📱',
    title: 'Telegram Alerts',
    desc: 'Receive instant Telegram notifications via the official bot API — completely free and reliable.',
  },
  {
    icon: '📊',
    title: 'Live Dashboard',
    desc: 'Track your Easy, Medium, and Hard counts with a beautiful real-time stats dashboard.',
  },
  {
    icon: '🛡️',
    title: 'No Duplicates',
    desc: 'Our idempotent system guarantees you never receive the same notification twice.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Powered by Cloudflare Workers — runs at the edge, globally distributed, zero cold starts.',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    desc: 'Your credentials stay encrypted in our database. Nothing is ever exposed to the frontend.',
  },
]

const steps = [
  {
    title: 'Get Your Chat ID',
    desc: 'Message @userinfobot on Telegram to get your numeric Chat ID securely.',
  },
  {
    title: 'Register Your Profile',
    desc: 'Enter your LeetCode username and Telegram Chat ID. We verify your profile instantly.',
  },
  {
    title: 'Solve Problems',
    desc: 'Go solve LeetCode problems like you normally do — our tracker watches in the background.',
  },
  {
    title: 'Get Notified',
    desc: 'Receive a Telegram message within 15 minutes every time you get an Accepted submission. 🎉',
  },
]

const techs = [
  { icon: '⚛️', name: 'React + Vite' },
  { icon: '☁️', name: 'Cloudflare Workers' },
  { icon: '🗄️', name: 'Supabase PostgreSQL' },
  { icon: '📱', name: 'Telegram Bot API' },
  { icon: '⏱️', name: 'Cron Triggers' },
  { icon: '🎨', name: 'Vanilla CSS' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [feed, setFeed] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)

  useEffect(() => {
    const telegramId = localStorage.getItem('lct_telegram_id')
    if (telegramId) {
      navigate(`/dashboard`)
    }
  }, [navigate])

  useEffect(() => {
    api.getFeed()
      .then((res) => setFeed(res.data))
      .catch((err) => console.error('Failed to load feed:', err))
      .finally(() => setLoadingFeed(false))
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-content animate-fadeInUp">
          <div className="hero-eyebrow">
            <span>⚡</span> Free Telegram Notifications
          </div>
          <h1 className="hero-title">
            Track Your LeetCode
            <br />
            <span className="gradient-text">Progress Automatically</span>
          </h1>
          <p className="hero-subtitle">
            Solve a problem on LeetCode and get a Telegram notification within minutes.
            No manual checking. Just code — we handle the rest.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => navigate('/track')}>
              🚀 Start Tracking Free
            </button>
            <a
              href="#how-it-works"
              className="btn btn-secondary"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── Recent Activity Feed ──────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="section-header" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>
              Live <span className="gradient-text">Global Activity</span>
            </h2>
            <p className="section-subtitle">See what others are solving right now.</p>
          </div>
          
          <div className="dashboard-card animate-fadeInUp">
            {loadingFeed ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading recent activity...</div>
            ) : feed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No recent submissions found. Be the first!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Problem</th>
                      <th>Difficulty</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feed.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.users.leetcode_username}</strong></td>
                        <td>{s.title}</td>
                        <td>
                          <span className={`difficulty-badge diff-${s.difficulty?.toLowerCase()}`}>
                            {s.difficulty}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {new Date(s.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Everything You Need to <span className="gradient-text">Stay Consistent</span>
            </h2>
            <p className="section-subtitle">
              Built for competitive programmers who want accountability without friction.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Up &amp; Running in <span className="gradient-text">4 Steps</span>
            </h2>
            <p className="section-subtitle">No complex setup. Just follow these steps and you're done.</p>
          </div>
          <div className="steps" style={{ marginTop: 48 }}>
            {steps.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step-num">{i + 1}</div>
                <div className="step-body">
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ────────────────────────────────────── */}
      <section className="section" id="tech">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Built on <span className="gradient-text">Modern Tech</span>
            </h2>
            <p className="section-subtitle">
              100% free-tier stack — deployable by anyone, anywhere.
            </p>
          </div>
          <div className="tech-grid">
            {techs.map((t) => (
              <div className="tech-pill" key={t.name}>
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">
            Ready to Never Miss a <span className="gradient-text">Solved Problem?</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 36, marginTop: 12 }}>
            Takes less than 2 minutes to set up. Free forever.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/track')} style={{ fontSize: 16, padding: '16px 36px' }}>
            🚀 Get Started Now
          </button>
        </div>
      </section>
    </>
  )
}
