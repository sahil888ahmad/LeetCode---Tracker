function DifficultyBadge({ difficulty }) {
  const map = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }
  const text = difficulty ? difficulty.toUpperCase() : 'UNKNOWN'
  return (
    <span className={`badge ${map[difficulty] || 'badge-muted'}`}>
      [{text}]
    </span>
  )
}

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

export default function SubmissionTable({ submissions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">&gt; NO_DATA_RETURNED</div>
        <p style={{ margin: 0, color: 'var(--dp-color-ink-muted)' }}>
          Solve a problem on LeetCode; telemetry will synchronize within the next 15-minute interval.
        </p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">PROBLEM_TITLE</th>
            <th scope="col">DIFFICULTY</th>
            <th scope="col">LANGUAGE</th>
            <th scope="col">STATUS</th>
            <th scope="col">DISPATCH</th>
            <th scope="col">TIMESTAMP</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const title = sub.title || sub.problem_name || 'Untitled Problem'
            const slug = getProblemSlug(title)
            return (
              <tr key={sub.id}>
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
                  <DifficultyBadge difficulty={sub.difficulty} />
                </td>
                <td>
                  <code>{sub.language || '—'}</code>
                </td>
                <td>
                  <span className="badge badge-success">✓ {sub.status || 'Accepted'}</span>
                </td>
                <td>
                  {sub.notification_sent ? (
                    <span style={{ color: 'var(--dp-color-ink)', fontSize: 13 }}>
                      [SENT]
                    </span>
                  ) : (
                    <span style={{ color: 'var(--dp-color-ink-muted)', fontSize: 13 }}>
                      [QUEUED]
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ color: 'var(--dp-color-ink-muted)', fontSize: 13 }}>
                    {timeAgo(sub.submitted_at)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
