export default function Footer() {
  return (
    <footer>
      <p>
        Built with ⚡ using React, Cloudflare Workers &amp; Supabase.
        WhatsApp notifications via{' '}
        <a href="https://www.callmebot.com" target="_blank" rel="noopener noreferrer">
          CallMeBot
        </a>
        .
      </p>
      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} LeetCode Tracker — Free &amp; Open Source
      </p>
    </footer>
  )
}
