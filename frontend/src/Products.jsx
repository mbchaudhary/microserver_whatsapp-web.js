import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', stock: '' })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/products-second-server')
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
        setProducts(list)
      } catch (e) {
        setError(e.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const deleteProduct = async (id) => {
    if (!id) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`/api/products-second-server/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError(e.message || 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const createProduct = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: form.price === '' ? undefined : Number(form.price),
        stock: form.stock === '' ? undefined : Number(form.stock),
      }
      const res = await fetch('/api/products-second-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`Create failed: HTTP ${res.status}`)
      const created = await res.json()
      setProducts((prev) => [created, ...prev])
      setForm({ title: '', description: '', price: '', category: '', stock: '' })
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="app-header" style={{ marginBottom: 8 }}>
        <div className="app-title">Products</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn" onClick={() => setShowForm(true)}>Create Product</button>
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
          <form onSubmit={createProduct} className="panel" style={{ width: 'min(840px, 96%)', textAlign: 'left', padding: 0, borderRadius: 16, overflow: 'hidden', boxShadow: '0 18px 48px rgba(0,0,0,.45), 0 0 0 1px rgba(148,163,184,.12) inset' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0b1220', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>🛒</div>
                <div>
                  <div className="app-title">Create Product</div>
                  <div className="muted" style={{ fontSize: 12 }}>Add a new product to your catalog</div>
                </div>
              </div>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28, rowGap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Title</span>
                  <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Category</span>
                  <input name="category" value={form.category} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Description</span>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit', resize: 'vertical' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Price</span>
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Stock</span>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
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
                  {saving ? 'Saving…' : 'Save Product'}
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
          {products.length === 0 && <div>No products found.</div>}
          {products.map((p, idx) => {
            const title = p.title || p.name || 'Untitled'
            const price = typeof p.price === 'number' ? `$ ${p.price.toFixed(2)}` : (p.price ? `$ ${p.price}` : null)
            return (
              <div key={p.id || idx} className="product-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Link to={`/products/${p.id}`} className="product-title" style={{ textDecoration: 'none' }}>{title}</Link>
                  {!!p.id && (
                    <button
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => deleteProduct(p.id)}
                      disabled={deletingId === p.id}
                      style={{
                        border: '1px solid var(--border)',
                        background: '#1a2333',
                        color: '#fca5a5',
                        padding: '4px 8px',
                        borderRadius: 8,
                        cursor: deletingId === p.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {deletingId === p.id ? 'Deleting…' : '🗑️'}
                    </button>
                  )}
                </div>
                {p.category && (
                  <div style={{ marginTop: 6 }}>
                    <span className="badge">{p.category}</span>
                  </div>
                )}
                {p.description && <div className="muted" style={{ marginTop: 8 }}>{p.description}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  {price && <div style={{ fontWeight: 600 }}>{price}</div>}
                  {p.stock !== undefined && (
                    <div className="muted" style={{ fontSize: 12 }}>Stock: {p.stock}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Products
