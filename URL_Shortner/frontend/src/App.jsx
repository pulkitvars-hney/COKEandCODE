import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import './App.css'

const createShortUrl = async (originalUrl) => {
  const response = await fetch('/api/create/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl }),
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Unable to shorten this URL. Please try again.')
  }
  if (!data.shortUrl) {
    throw new Error('The server did not return a shortened URL.')
  }

  return data.shortUrl
}

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
  const shortenMutation = useMutation({
    mutationFn: createShortUrl,
    onSuccess: (createdShortUrl) => {
      setShortUrl(createdShortUrl)
      setCopied(false)
    },
    onError: (requestError) => {
      setShortUrl('')
      setError(requestError.message)
    },
  })

  const handleShorten = (event) => {
    event.preventDefault()
    const value = url.trim()

    try {
      const normalizedUrl = /^https?:\/\//i.test(value) ? value : `https://${value}`
      new URL(normalizedUrl)
      setError('')
      shortenMutation.mutate(normalizedUrl)
    } catch {
      setError('Please enter a valid URL, such as example.com')
      setShortUrl('')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Unable to copy the shortened URL. Please copy it manually.')
    }
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
            <button type="submit" disabled={shortenMutation.isPending}>
              {shortenMutation.isPending ? 'Shortening...' : <>Shorten link <span>→</span></>}
            </button>
          </div>
          {error && <p className="error" id="url-error">{error}</p>}

          {shortUrl && (
            <div className="result" aria-live="polite">
              <div>
                <span className="result-label">YOUR SHORT LINK</span>
                <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
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
