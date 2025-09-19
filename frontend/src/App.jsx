import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import './App.css'

function App() {
  const [mainResponse, setMainResponse] = useState('')
  const [secondResponse, setSecondResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Acts as Home page content; routing handled by routing.jsx

  const fetchFrom = async (which) => {
    setLoading(true)
    setError('')
    try {
      const url = which === 'main' ? '/api/main' : '/api/second'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (which === 'main') setMainResponse(text)
      else setSecondResponse(text)
    } catch (e) {
      setError(e.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const clearResponses = () => {
    setMainResponse('')
    setSecondResponse('')
    setError('')
  }

  return (
    <div>
      <Navbar />

      <div className="panel">
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button className="btn" disabled={loading} onClick={() => fetchFrom('main')}>Main server response</button>
          <button className="btn" disabled={loading} onClick={() => fetchFrom('second')}>Second server response</button>
          <button className="btn" onClick={clearResponses}>Clear</button>
        </div>
        {error && <div className="muted">{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="product-card">
            <div className="product-title">Main</div>
            <pre className="muted" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{mainResponse || '—'}</pre>
          </div>
          <div className="product-card">
            <div className="product-title">Second</div>
            <pre className="muted" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{secondResponse || '—'}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
