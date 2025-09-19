import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/products-second-server/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setProduct(data)
      } catch (e) {
        setError(e.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  return (
    <div className="panel">
      <div className="app-header" style={{ marginBottom: 8 }}>
        <div className="app-title">Product Detail</div>
        <div>
          <Link className="btn" to="/products">Back</Link>
        </div>
      </div>
      {loading && <div className="muted">Loading…</div>}
      {error && <div className="muted">{error}</div>}
      {!loading && !error && product && (
        <div className="product-card">
          <div className="product-title">{product.title || product.name || `#${id}`}</div>
          <div style={{ marginTop: 8 }} className="muted">
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail


