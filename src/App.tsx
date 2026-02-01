import { useState } from 'react'
import { Search, Download, Github, Loader2, AlertCircle } from 'lucide-react'
import { fetchGitHubUser, fetchPinnedRepos } from './utils/github'
import type { GitHubUser, PinnedRepo } from './utils/github'
import { generatePDF } from './utils/pdf'
import PortfolioContent from './components/PortfolioContent'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<{ user: GitHubUser; pinnedRepos: PinnedRepo[] } | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setError('')
    setUserData(null)

    try {
      // Extract username from URL or use as is
      let username = url.trim()
      if (username.includes('github.com/')) {
        username = username.split('github.com/')[1].split('/')[0]
      }

      const [user, pinnedRepos] = await Promise.all([
        fetchGitHubUser(username),
        fetchPinnedRepos(username)
      ])

      setUserData({ user, pinnedRepos })
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'User not found' : 'Failed to fetch GitHub data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!userData) return
    setGenerating(true)
    try {
      await generatePDF('portfolio-render', `${userData.user.login}-portfolio.pdf`)
    } catch (err) {
      console.error('PDF generation failed', err)
      alert('Failed to generate PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className={userData ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'}>
        {!userData && !loading && (
          <header className="hero-section fade-in">
            <div className="hero-icon">
              <Github size={48} />
            </div>
            <h1>Git Portfolio Builder</h1>
            <p>Generate a PDF portfolio from any GitHub profile</p>
          </header>
        )}

        <section className={`fade-in ${userData ? 'mb-12' : 'search-container'}`} style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleFetch} className={`search-form ${!userData ? 'glass-card' : ''}`}>
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Enter GitHub username or profile URL..."
                className="input-field search-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary search-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Loading...</span>
                </>
              ) : (
                'Build Portfolio'
              )}
            </button>
          </form>

          {error && (
            <div className="error-message fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </section>

        {/* Loading Skeleton */}
        {loading && (
          <div className="skeleton-container fade-in">
            <div className="skeleton-header">
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton-info">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            </div>
            <div className="skeleton-metrics">
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
            </div>
            <div className="skeleton skeleton-heatmap"></div>
          </div>
        )}

        {userData && (
          <div className="fade-in preview-section" style={{ animationDelay: '0.2s' }}>
            {/* Floating action bar */}
            <div className="preview-action-bar">
              <div className="preview-user-info">
                <img src={userData.user.avatar_url} alt="" className="preview-avatar" />
                <div>
                  <span className="preview-name">{userData.user.name || userData.user.login}</span>
                  <span className="preview-username">@{userData.user.login}</span>
                </div>
              </div>
              <div className="preview-actions">
                <button
                  onClick={() => setUserData(null)}
                  className="btn btn-secondary"
                >
                  New Search
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="preview-container">
              <div className="preview-paper">
                <PortfolioContent user={userData.user} pinnedRepos={userData.pinnedRepos} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
