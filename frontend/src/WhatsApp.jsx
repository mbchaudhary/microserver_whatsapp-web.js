import { useEffect, useRef, useState } from 'react'

function WhatsApp() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrSrc, setQrSrc] = useState('')
  const [sending, setSending] = useState(false)
  const [sentOk, setSentOk] = useState(false)
  const [form, setForm] = useState({ to: '', message: '' })
  const fileInputRef = useRef(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  
  // New state for file management
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [selectedFileIds, setSelectedFileIds] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/wa-second-server/status')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      setError(e.message || 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  const fetchQr = async () => {
    setError('')
    try {
      const res = await fetch('/api/wa-second-server/qr')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (qrSrc) URL.revokeObjectURL(qrSrc)
      setQrSrc(url)
    } catch (e) {
      setError(e.message || 'Failed to load QR')
    }
  }

  const fetchUploadedFiles = async () => {
    try {
      const res = await fetch('/api/wa-second-server/files')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setUploadedFiles(data.files || [])
    } catch (e) {
      setError(e.message || 'Failed to load uploaded files')
    }
  }

  const uploadFiles = async (files) => {
    setUploading(true)
    setError('')
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('file', file)
      })

      const res = await fetch('/api/wa-second-server/upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      setUploadSuccess(true)
      await fetchUploadedFiles() // Refresh the file list
    } catch (e) {
      setError(e.message || 'Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (fileId) => {
    try {
      const res = await fetch(`/api/wa-second-server/files/${fileId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchUploadedFiles() // Refresh the file list
      // Remove from selected files if it was selected
      setSelectedFileIds(prev => prev.filter(id => id !== fileId))
    } catch (e) {
      setError(e.message || 'Failed to delete file')
    }
  }

  const toggleFileSelection = (fileId) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const openDocumentPicker = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
    // Clear the input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setSentOk(false)
    try {
      // Check if files are selected and mobile number is entered
      if (selectedFileIds.length > 0 && form.to.trim()) {
        // Send files by IDs
        const payload = { 
          to: form.to, 
          caption: form.message || '',
          fileIds: selectedFileIds
        }
        const res = await fetch('/api/wa-second-server/send-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await res.json().catch(() => null)
        setForm({ to: '', message: '' })
        setSelectedFileIds([])
        setSentOk(true)
      } else {
        // Send regular message
        const payload = { to: form.to, message: form.message }
        const res = await fetch('/api/wa-second-server/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await res.json().catch(() => null)
        setForm({ to: '', message: '' })
        setSentOk(true)
      }
    } catch (e) {
      setError(e.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // prefetch QR on mount but do not block
    fetchQr()
    // Load uploaded files
    fetchUploadedFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="app-header" style={{ marginBottom: 8 }}>
        <div className="app-title">WhatsApp</div>
      </div>

      {!!error && (
        <div className="panel" style={{ padding: 12, borderRadius: 12, marginBottom: 12, border: '1px solid #7f1d1d', background: '#2b0a0a', color: '#fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        <div className="panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>Status</div>
            <button className="btn" onClick={fetchStatus} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{status ? JSON.stringify(status, null, 2) : (loading ? 'Loading…' : 'No status yet.')}</pre>
        </div>

        <div className="panel" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>QR</div>
            <button className="btn" onClick={fetchQr} disabled={loading}>Reload QR</button>
          </div>
          {qrSrc ? (
            <img src={qrSrc} alt="WhatsApp QR" style={{ width: 260, height: 260, objectFit: 'contain', background: '#0b1220', borderRadius: 12, border: '1px solid var(--border)' }} />
          ) : (
            <div className="muted">{loading ? 'Loading QR…' : 'QR not loaded.'}</div>
          )}
        </div>
      </div>

      {/* File Management Section */}
      <div className="panel" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1220', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>📁</div>
            <div style={{ fontWeight: 600 }}>File Management</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={fileInputRef} type="file" multiple onChange={handleFilesSelected} style={{ display: 'none' }} />
            <button className="btn" onClick={openDocumentPicker} disabled={uploading}>
              {uploading ? 'Uploading...' : '📤 Upload Files'}
            </button>
            <button className="btn" onClick={fetchUploadedFiles}>🔄 Refresh</button>
          </div>
        </div>
        
        <div style={{ padding: 16 }}>
          {uploadSuccess && (
            <div style={{ padding: 8, borderRadius: 8, marginBottom: 12, border: '1px solid #059669', background: '#064e3b', color: '#6ee7b7', fontSize: 14 }}>
              ✅ Files uploaded successfully!
            </div>
          )}
          
          {uploadedFiles.length === 0 ? (
            <div className="muted" style={{ textAlign: 'center', padding: 20 }}>
              No files uploaded yet. Click "Upload Files" to get started.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {uploadedFiles.map((file) => (
                <div key={file.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: 12, 
                  borderRadius: 8, 
                  border: selectedFileIds.includes(file.id) ? '2px solid #3b82f6' : '1px solid var(--border)',
                  background: selectedFileIds.includes(file.id) ? '#1e3a8a' : 'transparent',
                  cursor: 'pointer'
                }} onClick={() => toggleFileSelection(file.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: 14 }}>📄 {file.originalName}</span>
                    <span className="muted" style={{ fontSize: 12 }}>({Math.round(file.size / 1024)} KB)</span>
                  </div>
                  <button 
                    className="btn" 
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(file.id)
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {selectedFileIds.length > 0 && (
            <div style={{ marginTop: 12, padding: 8, borderRadius: 8, border: '1px solid #3b82f6', background: '#1e3a8a', color: '#93c5fd', fontSize: 14 }}>
              {selectedFileIds.length} file(s) selected for sending
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0b1220', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>💬</div>
            <div style={{ fontWeight: 600 }}>Send Message</div>
          </div>
        </div>
        <form onSubmit={sendMessage} style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="muted" style={{ fontSize: 12 }}>To (phone)</span>
              <input name="to" value={form.to} onChange={handleChange} required placeholder="e.g. 15551234567" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="muted" style={{ fontSize: 12 }}>Message</span>
              <input name="message" value={form.message} onChange={handleChange} placeholder="Type your message" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #1e293b', background: '#0f172a', color: 'inherit' }} />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 28, overflowX: 'auto' }}>
              {selectedFileIds.length > 0 ? (
                selectedFileIds.map((fileId) => {
                  const file = uploadedFiles.find(f => f.id === fileId)
                  return file ? (
                    <span key={fileId} className="badge" title={`${file.originalName} (${file.size} bytes)`}>
                      📄 {file.originalName}
                    </span>
                  ) : null
                })
              ) : (
                <div className="muted" style={{ fontSize: 12 }}>
                  {sentOk ? (selectedFileIds.length > 0 ? 'Files sent.' : 'Message sent.') : 'Press Enter to send'}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" type="submit" disabled={sending}>
                {sending ? 'Sending…' : (selectedFileIds.length > 0 ? 'Send Files' : 'Send')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WhatsApp


