import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('lct_user_id')

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">⚡</div>
          <span>LeetCode Tracker</span>
        </Link>
        <div className="navbar-actions">
          {userId && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/dashboard/${userId}`)}
            >
              My Dashboard
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/track')}
          >
            Start Tracking
          </button>
        </div>
      </div>
    </nav>
  )
}
