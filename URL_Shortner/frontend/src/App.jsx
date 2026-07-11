import { useState } from 'react'
import './App.css'

const createShortCode = () => Math.random().toString(36).slice(2, 8)

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.6 13.4a5 5 0 0 0 7.07.01l2.12-2.12a5 5 0 0 0-7.07-7.07l-1.21 1.2" />
      <path d="M13.4 10.6a5 5 0 0 0-7.07-.01L4.21 12.7a5 5 0 0 0 7.07 7.07l1.2-1.2" />
    </svg>
  )
}

function App() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleShorten = (event) => {
    event.preventDefault()
    const value = url.trim()

    try {
      const normalizedUrl = /^https?:\/\//i.test(value) ? value : `https://${value}`
      new URL(normalizedUrl)
      setError('')
      // will be Replacing this demo value with the response from your backend API.
      setShortUrl(`shortly.io/${createShortCode()}`)
      setCopied(false)
    } catch {
      setError('Please enter a valid URL, such as example.com')
      setShortUrl('')
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://${shortUrl}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="page-shell">
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Shortly home">
          <span className="brand-mark"><LinkIcon /></span>
          shortly
        </a>
        <a className="nav-link" href="#how-it-works">How it works</a>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span></span> SIMPLE LINKS, BIG IMPACT</div>
        <h1>Make every link<br /><em>count.</em></h1>
        <p className="hero-copy">Turn long, messy URLs into short links that are easy to share and impossible to forget.</p>

        <form className="shorten-card" onSubmit={handleShorten} noValidate>
          <label htmlFor="url-input">Paste your long URL</label>
          <div className="input-row">
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://your-very-long-link.com/..."
              aria-describedby={error ? 'url-error' : undefined}
            />
            <button type="submit">Shorten link <span>→</span></button>
          </div>
          {error && <p className="error" id="url-error">{error}</p>}

          {shortUrl && (
            <div className="result" aria-live="polite">
              <div>
                <span className="result-label">YOUR SHORT LINK</span>
                <a href={`https://${shortUrl}`} target="_blank" rel="noreferrer">{shortUrl}</a>
              </div>
              <button className="copy-button" type="button" onClick={copyLink}>{copied ? 'Copied!' : 'Copy link'}</button>
            </div>
          )}
        </form>
        <p className="privacy-note">No sign-up required · Your links are ready to share in seconds</p>
      </section>

      <section className="features" id="how-it-works">
        <article><span className="feature-number">01</span><h2>Paste your link</h2><p>Drop in any long URL you want to simplify.</p></article>
        <article><span className="feature-number">02</span><h2>Get it shortened</h2><p>We create a clean, compact link in an instant.</p></article>
        <article><span className="feature-number">03</span><h2>Share anywhere</h2><p>Copy it and make every character count.</p></article>
      </section>

      <footer>© 2026 shortly <span>·</span> Built for sharing</footer>
    </main>
  )
}

export default App
