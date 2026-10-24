import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../services/api'

const features = [
  {
    tag: 'DETECT.01',
    title: 'Auto-Detection',
    desc: 'Automatically checks your LeetCode profile every 15 minutes and detects new accepted solutions.',
    status: '[ACTIVE]',
  },
  {
    tag: 'DISPATCH.02',
    title: 'Telegram Alerts',
    desc: 'Receive instant Telegram notifications via the official bot API — completely free and reliable.',
    status: '[READY]',
  },
  {
    tag: 'METRICS.03',
    title: 'Live Dashboard',
    desc: 'Track your Easy, Medium, and Hard counts with a real-time monospaced telemetry dashboard.',
    status: '[READY]',
  },
  {
    tag: 'FILTER.04',
    title: 'No Duplicates',
    desc: 'Our idempotent system guarantees you never receive the same notification twice.',
    status: '[VERIFIED]',
  },
  {
    tag: 'EDGE.05',
    title: 'Lightning Fast',
    desc: 'Powered by Cloudflare Workers — runs at the edge, globally distributed, zero cold starts.',
    status: '[OPERATIONAL]',
  },
  {
    tag: 'SECURE.06',
    title: 'Privacy First',
    desc: 'Your credentials stay encrypted in our database. Nothing is ever exposed to the frontend.',
    status: '[ENCRYPTED]',
  },
]

const steps = [
  {
    num: '01',
    title: 'Get Your Chat ID',
    desc: 'Message @userinfobot on Telegram to get your numeric Chat ID securely.',
  },
  {
    num: '02',
    title: 'Register Your Profile',
    desc: 'Enter your LeetCode username and Telegram Chat ID. We verify your profile instantly.',
  },
  {
    num: '03',
    title: 'Solve Problems',
    desc: 'Go solve LeetCode problems like you normally do — our tracker watches in the background.',
  },
  {
    num: '04',
    title: 'Get Notified',
    desc: 'Receive a Telegram message within 15 minutes every time you get an Accepted submission.',
  },
]

const techs = [
  { name: 'React 19 + Vite 8', role: 'Client Single Page Session' },
  { name: 'Cloudflare Workers', role: 'Edge Serverless Execution' },
  { name: 'Supabase PostgreSQL', role: 'Relational Store & Telemetry' },
  { name: 'Telegram Bot API', role: 'Direct Push Notification Dispatch' },
  { name: 'Cron Triggers', role: '15-Minute Automated Evaluation Bus' },
  { name: 'TerminalPlex Mono', role: 'Character-Aligned Design System' },
]

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getProblemSlug(title) {
  if (!title) return ''
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [feed, setFeed] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const telegramId = localStorage.getItem('lct_telegram_id')

  useEffect(() => {
    api.getFeed()
      .then((res) => setFeed(res.data || []))
      .catch((err) => console.error('Failed to load feed:', err))
      .finally(() => setLoadingFeed(false))
  }, [])

  return (
    <>
      {/* ── Hero Opening ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          {/* Character-rendered wordmark derived from customer name */}
          <div className="sr-only">LeetCode Tracker</div>
          <pre className="ascii-banner" aria-hidden="true">{` _     _____ _____ _____ ____ ___  ____  _____   _____ ____      _    ____ _  _______ ____  
| |   | ____| ____|_   _/ ___/ _ \\|  _ \\| ____| |_   _|  _ \\    / \\  / ___| |/ / ____|  _ \\ 
| |   |  _| |  _|   | || |  | | | | | | |  _|     | | | |_) |  / _ \\| |   | ' /|  _| | |_) |
| |___| |___| |___  | || |__| |_| | |_| | |___    | | |  _ <  / ___ \\ |___| . \\| |___|  _ < 
|_____|_____|_____| |_| \\____\\___/|____/|_____|   |_| |_| \\_\\/_/   \\_\\____|_|\\_\\_____|_| \\_\\`}</pre>

          <div className="hero-grid">
            <div>
              <div style={{ fontSize: 13, color: 'var(--dp-color-ink-muted)', marginBottom: 12 }}>
                // PROTOCOL: TELEGRAM NOTIFICATIONS // FREE TIER
              </div>
              <h1 className="hero-title">
                Track Your LeetCode Progress Automatically
              </h1>
              <p className="hero-subtitle">
                Solve a problem on LeetCode and receive an immediate Telegram alert within minutes.
                Zero manual verification. Keep coding while background cron workers handle detection.
              </p>
              <div className="hero-cta">
                {telegramId ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    [ Go to My Dashboard ]
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/track')}
                  >
                    [ Start Tracking Free ]
                  </button>
                )}
                <a href="#global-activity" className="btn btn-secondary">
                  [ View Live Feed ]
                </a>
              </div>
            </div>

            {/* Narrow list of supporting facts */}
            <aside className="hero-facts" aria-label="System Specifications">
              <div className="hero-facts-title">// SPECIFICATIONS</div>
              <div className="hero-fact-row">
                <span className="hero-fact-key">INTERVAL</span>
                <span className="hero-fact-val">15 Minutes</span>
              </div>
              <div className="hero-fact-row">
                <span className="hero-fact-key">DISPATCH</span>
                <span className="hero-fact-val">Telegram Bot API</span>
              </div>
              <div className="hero-fact-row">
                <span className="hero-fact-key">DETECTION</span>
                <span className="hero-fact-val">Idempotent</span>
              </div>
              <div className="hero-fact-row">
                <span className="hero-fact-key">STORAGE</span>
                <span className="hero-fact-val">Encrypted / PostgreSQL</span>
              </div>
              <div className="hero-fact-row">
                <span className="hero-fact-key">COST</span>
                <span className="hero-fact-val">Free Forever</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 01 // Live Global Activity Feed ──────────────────────── */}
      <section className="section" id="global-activity">
        <div className="container">
          <div className="command-layout">
            <div className="command-gutter">01 // FEED</div>
            <div className="command-output">
              <div className="section-header">
                <h2 className="section-title">Live Global Activity</h2>
                <p className="section-subtitle">
                  Real-time problem solves across all tracked competitive programmers.
                </p>
              </div>

              {loadingFeed ? (
                <div style={{ padding: '24px 0', color: 'var(--dp-color-ink-muted)' }}>
                  &gt;&gt; Querying telemetry feed...
                </div>
              ) : feed.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">&gt; FEED_EMPTY</div>
                  <p style={{ margin: 0, color: 'var(--dp-color-ink-muted)' }}>
                    No recent submissions recorded. Execute problems on LeetCode to populate telemetry.
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
                        <th scope="col">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feed.map((s) => {
                        const username = s.users?.leetcode_username || 'Anonymous'
                        const title = s.title || 'Untitled Problem'
                        const slug = getProblemSlug(title)
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
                            <td>
                              <code>{s.language || '—'}</code>
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
        </div>
      </section>

      {/* ── 02 // Capabilities ────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <div className="command-layout">
            <div className="command-gutter">02 // SPECS</div>
            <div className="command-output">
              <div className="section-header">
                <h2 className="section-title">Everything You Need to Stay Consistent</h2>
                <p className="section-subtitle">
                  Built for competitive programmers who want accountability without friction.
                </p>
              </div>

              <div className="capability-list">
                {features.map((f) => (
                  <div className="capability-row" key={f.title}>
                    <div className="capability-title">&gt; {f.title}</div>
                    <p className="capability-desc">{f.desc}</p>
                    <div className="capability-status">{f.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 // Execution Steps ─────────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="command-layout">
            <div className="command-gutter">03 // SETUP</div>
            <div className="command-output">
              <div className="section-header">
                <h2 className="section-title">Up &amp; Running in 4 Steps</h2>
                <p className="section-subtitle">
                  No complex setup. Follow these sequential steps to configure your watcher.
                </p>
              </div>

              <div className="steps-list">
                {steps.map((s) => (
                  <div className="step-row" key={s.num}>
                    <div className="step-num-code">[{s.num}]</div>
                    <div className="step-name">{s.title}</div>
                    <p className="step-text">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 // Tech Stack ──────────────────────────────────────── */}
      <section className="section" id="tech">
        <div className="container">
          <div className="command-layout">
            <div className="command-gutter">04 // ARCH</div>
            <div className="command-output">
              <div className="section-header">
                <h2 className="section-title">Built on Modern Tech</h2>
                <p className="section-subtitle">
                  100% free-tier stack — edge compute, relational storage, and serverless triggers.
                </p>
              </div>

              <div className="tech-table">
                {techs.map((t) => (
                  <div className="tech-row" key={t.name}>
                    <div className="tech-name">&gt; {t.name}</div>
                    <div className="tech-role">{t.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 // Execution Call ──────────────────────────────────── */}
      <section className="section" id="enroll">
        <div className="container">
          <div className="command-layout">
            <div className="command-gutter">05 // EXEC</div>
            <div className="command-output">
              <div style={{ border: 'var(--dp-border-hairline) solid var(--dp-color-rule)', padding: 'var(--dp-spacing-row)' }}>
                <h2 className="section-title" style={{ marginBottom: 12 }}>
                  Ready to Never Miss a Solved Problem?
                </h2>
                <p className="section-subtitle" style={{ marginBottom: 24 }}>
                  Takes less than 2 minutes to set up. Free forever.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/track')}
                >
                  [ &gt; Get Started Now ]
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
