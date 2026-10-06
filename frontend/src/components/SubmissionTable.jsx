function DifficultyBadge({ difficulty }) {
  const map = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }
  return (
    <span className={`badge ${map[difficulty] || 'badge-muted'}`}>
      {difficulty || 'Unknown'}
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

export default function SubmissionTable({ submissions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <div className="empty-state-title">No submissions yet</div>
        <p style={{ fontSize: 14 }}>
          Solve a LeetCode problem and it will appear here within 15 minutes!
        </p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Problem</th>
            <th>Difficulty</th>
            <th>Language</th>
            <th>Status</th>
            <th>Notified</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.id}>
              <td>
                {sub.problem_slug ? (
                  <a
                    href={`https://leetcode.com/problems/${sub.problem_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  >
                    {sub.problem_name}
                  </a>
                ) : (
                  sub.problem_name
                )}
              </td>
              <td>
                <DifficultyBadge difficulty={sub.difficulty} />
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{sub.language || '—'}</td>
              <td>
                <span className="badge badge-success">✓ {sub.status}</span>
              </td>
              <td>
                {sub.notification_sent ? (
                  <span style={{ color: 'var(--green)', fontSize: 13 }}>✅ Sent</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pending</span>
                )}
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {timeAgo(sub.submitted_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
