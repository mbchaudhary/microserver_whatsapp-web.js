import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Cars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ make: '', model: '', year: '', color: '', fuelType: '', transmission: '' })

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('http://localhost:3000/cars')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : (data && typeof data === 'object')
                ? [data]
                : []
        setCars(list)
      } catch (e) {
        setError(e.message || 'Failed to load cars')
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const createCar = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        make: form.make,
        model: form.model,
        year: form.year === '' ? undefined : Number(form.year),
        color: form.color,
        fuelType: form.fuelType,
        transmission: form.transmission,
      }
      const res = await fetch('http://localhost:3000/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`Create failed: HTTP ${res.status}`)
      const created = await res.json()
      setCars((prev) => [created, ...prev])
      setForm({ make: '', model: '', year: '', color: '', fuelType: '', transmission: '' })
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Failed to create car')
    } finally {
      setSaving(false)
    }
  }

  const deleteCar = async (id) => {
    if (!id) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`http://localhost:3000/cars/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`)
      setCars((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e.message || 'Failed to delete car')
    } finally {
      setDeletingId(null)
    }
  }

  // /api/cars/:id is used for DELETE only on this page

  return (
    <div>
      <div className="app-header" style={{ marginBottom: 8 }}>
        <div className="app-title">Cars</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn" onClick={() => setShowForm(true)}>Create Car</button>
      </div>
      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <form onSubmit={createCar} className="panel" style={{ width: 'min(840px, 96%)', textAlign: 'left', padding: 0, borderRadius: 16, overflow: 'hidden', boxShadow: '0 18px 48px rgba(0,0,0,.45), 0 0 0 1px rgba(148,163,184,.12) inset' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0b1220', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>🚗</div>
                <div>
                  <div className="app-title">Create Car</div>
                  <div className="muted" style={{ fontSize: 12 }}>Add a new car to your catalog</div>
                </div>
              </div>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28, rowGap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Make</span>
                  <input name="make" value={form.make} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Model</span>
                  <input name="model" value={form.model} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Year</span>
                  <input name="year" type="number" step="1" value={form.year} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Color</span>
                  <input name="color" value={form.color} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Fuel Type</span>
                  <input name="fuelType" value={form.fuelType} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Transmission</span>
                  <input name="transmission" value={form.transmission} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 24, borderTop: '1px solid var(--border)' }}>
              <div className="muted" style={{ fontSize: 12 }}>Press Enter to save</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Car'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      {loading && <div className="muted">Loading…</div>}
      {error && <div className="muted">{error}</div>}
      {!loading && !error && (
        <div className="grid-4">
          {cars.length === 0 && <div>No cars found.</div>}
          {cars.map((c, idx) => {
            const make = c.make || '-'
            const model = c.model || '-'
            const year = c.year !== undefined ? c.year : '-'
            const color = c.color || c.colour
            const fuelType = c.fuelType || c.fuel
            const transmission = c.transmission || c.gearbox
            const title = (make && model) ? `${make} ${model}${year !== '-' ? ` (${year})` : ''}` : (c.title || 'Untitled')
            return (
              <div key={c.id || idx} className="product-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Link to={`/cars/${c.id}`} className="product-title" style={{ textDecoration: 'none' }}>{title}</Link>
                  {!!c.id && (
                    <button
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => deleteCar(c.id)}
                      disabled={deletingId === c.id}
                      style={{
                        border: '1px solid var(--border)',
                        background: '#1a2333',
                        color: '#fca5a5',
                        padding: '4px 8px',
                        borderRadius: 8,
                        cursor: deletingId === c.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {deletingId === c.id ? 'Deleting…' : '🗑️'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {color && <span className="badge">{color}</span>}
                  {fuelType && <span className="badge">{fuelType}</span>}
                  {transmission && <span className="badge">{transmission}</span>}
                </div>
                <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                  <div>Make: {make}</div>
                  <div>Model: {model}</div>
                  <div>Year: {year}</div>
                </div>
                {/* Delete only */}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Cars


