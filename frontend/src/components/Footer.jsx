const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer aria-label="Terminal Directory Footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-col-title">SYSTEM_IDENTITY</div>
            <ul className="footer-col-list">
              <li>PRODUCT: LeetCode Tracker</li>
              <li>RUNTIME: Edge Worker (V8)</li>
              <li>POLL_FREQ: 15 Minutes</li>
              <li>STATUS: Operational</li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">INFRASTRUCTURE</div>
            <ul className="footer-col-list">
              <li>CORE: Cloudflare Workers</li>
              <li>DATABASE: Supabase PostgreSQL</li>
              <li>DISPATCH: Telegram Bot API</li>
              <li>FRONTEND: React + Vite</li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">INTEGRATIONS</div>
            <ul className="footer-col-list">
              <li>
                <a
                  href="https://leetcode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LeetCode GraphQL
                </a>
              </li>
              <li>
                <a
                  href="https://core.telegram.org/bots/api"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram Bot API
                </a>
              </li>
              <li>
                <a
                  href="https://www.callmebot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CallMeBot Gateway
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">DIRECTORY_REF</div>
            <ul className="footer-col-list">
              <li>LICENSE: MIT Open Source</li>
              <li>ENCRYPTION: Server-side stored</li>
              <li>IDEMPOTENCY: Active</li>
              <li>MODE: Public Access</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            LEETCODE_TRACKER &copy; {CURRENT_YEAR} &mdash; FREE &amp; OPEN SOURCE
          </span>
          <span>SESSION_END // TERMINAL_PLEX_MONO</span>
        </div>
      </div>
    </footer>
  )
}
