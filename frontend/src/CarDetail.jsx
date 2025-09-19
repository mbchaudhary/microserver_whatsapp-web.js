import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function CarDetail() {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/cars/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setCar(data)
      } catch (e) {
        setError(e.message || 'Failed to load car')
      } finally {
        setLoading(false)
      }
    }
    fetchCar()
  }, [id])

  return (
    <div className="panel">
      <div className="app-header" style={{ marginBottom: 8 }}>
        <div className="app-title">Car Detail</div>
        <div>
          <Link className="btn" to="/cars">Back</Link>
        </div>
      </div>
      {loading && <div className="muted">Loading…</div>}
      {error && <div className="muted">{error}</div>}
      {!loading && !error && car && (
        <div className="product-card">
          <div className="product-title">{car.make && car.model ? `${car.make} ${car.model}` : (car.title || `#${id}`)}</div>
          <div style={{ marginTop: 8 }} className="muted">
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(car, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarDetail


