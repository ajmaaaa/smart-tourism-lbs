import React, { useEffect, useMemo, useState } from 'react'
import {
  clearAdminToken,
  deleteAdminResource,
  fetchAdminResource,
  getAdminToken,
  loginAdmin,
  saveAdminResource,
  setAdminToken,
  uploadImage
} from '../services/adminService.js'
import '../styles/admin.css'

const resources = [
  { id: 'destinations', label: 'Destinasi', titleField: 'name' },
  { id: 'culture', label: 'Budaya', titleField: 'title' },
  { id: 'culinary', label: 'Kuliner', titleField: 'title' },
  { id: 'gallery', label: 'Galeri', titleField: 'title' },
  { id: 'faq', label: 'FAQ', titleField: 'title' },
  { id: 'transportation', label: 'Transportasi', titleField: 'title' },
  { id: 'history', label: 'Sejarah', titleField: 'title' },
  { id: 'sources', label: 'Sumber', titleField: 'title' }
]

const baseFields = {
  destinations: {
    id: '',
    name: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    routeNodeId: '',
    shortDesc: '',
    description: '',
    image: '',
    keywords: '',
    sortOrder: 0,
    isPublished: true
  },
  culture: contentFields(),
  culinary: contentFields(),
  gallery: {
    id: '',
    title: '',
    image: '',
    className: '',
    category: '',
    description: '',
    sortOrder: 0,
    isPublished: true
  },
  faq: {
    id: '',
    title: '',
    category: '',
    summary: '',
    keywords: '',
    sortOrder: 0,
    isPublished: true
  },
  transportation: contentFields(),
  history: {
    id: '',
    title: '',
    period: '',
    summary: '',
    description: '',
    keywords: '',
    sortOrder: 0,
    isPublished: true
  },
  sources: {
    id: '',
    title: '',
    type: '',
    publisher: '',
    url: '',
    description: '',
    sortOrder: 0
  }
}

function contentFields() {
  return {
    id: '',
    title: '',
    category: '',
    summary: '',
    description: '',
    image: '',
    icon: '',
    keywords: '',
    sortOrder: 0,
    isPublished: true
  }
}

function toFormValue(item, resource) {
  const base = baseFields[resource]
  return Object.keys(base).reduce((acc, key) => {
    const value = item?.[key]
    acc[key] = Array.isArray(value) ? value.join(', ') : value ?? base[key]
    return acc
  }, {})
}

function AdminDashboard() {
  const [token, setToken] = useState(getAdminToken())
  const [email, setEmail] = useState('admin@penyengat.local')
  const [password, setPassword] = useState('admin123')
  const [active, setActive] = useState(resources[0].id)
  const [items, setItems] = useState([])
  const [form, setForm] = useState(() => toFormValue(null, resources[0].id))
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const activeResource = useMemo(
    () => resources.find((item) => item.id === active) || resources[0],
    [active]
  )

  useEffect(() => {
    if (!token) return
    loadItems(active)
  }, [active, token])

  const loadItems = async (resource) => {
    setLoading(true)
    setMessage('')

    try {
      setItems(await fetchAdminResource(resource))
      setForm(toFormValue(null, resource))
      setEditingId(null)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = await loginAdmin(email, password)
      setAdminToken(payload.token)
      setToken(payload.token)
      setMessage(`Masuk sebagai ${payload.admin.name}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminToken()
    setToken(null)
    setItems([])
  }

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const editItem = (item) => {
    setEditingId(item.id)
    setForm(toFormValue(item, active))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(toFormValue(null, active))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await saveAdminResource(active, form, Boolean(editingId))
      await loadItems(active)
      setMessage(editingId ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (item) => {
    const title = item.name || item.title || item.id
    if (!window.confirm(`Hapus ${title}?`)) return

    setLoading(true)
    setMessage('')

    try {
      await deleteAdminResource(active, item.id)
      await loadItems(active)
      setMessage('Data berhasil dihapus.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    setLoading(true)
    setMessage('Mengunggah gambar...')
    try {
      const res = await uploadImage(file)
      updateField('image', res.url)
      setMessage('Gambar berhasil diunggah.')
    } catch (error) {
      setMessage(`Gagal mengunggah gambar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="admin-shell admin-shell--login">
        <form className="admin-login" onSubmit={handleLogin}>
          <span className="admin-kicker">Smart Tourism LBS</span>
          <h1>Admin Dashboard</h1>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          {message && <p className="admin-message">{message}</p>}
          <button className="admin-button" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-kicker">Dashboard</span>
          <h1>Konten Wisata</h1>
        </div>
        <nav>
          {resources.map((resource) => (
            <button
              key={resource.id}
              className={active === resource.id ? 'active' : ''}
              onClick={() => setActive(resource.id)}
            >
              {resource.label}
            </button>
          ))}
        </nav>
        <button className="admin-ghost" onClick={handleLogout}>Keluar</button>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">Kelola Data</span>
            <h2>{activeResource.label}</h2>
          </div>
          <button className="admin-ghost" onClick={resetForm}>Data Baru</button>
        </header>

        {message && <p className="admin-message">{message}</p>}

        <div className="admin-layout">
          <form className="admin-panel admin-form" onSubmit={submitForm}>
            <h3>{editingId ? 'Edit Data' : 'Tambah Data'}</h3>
            <FieldList resource={active} form={form} updateField={updateField} editing={Boolean(editingId)} onUploadImage={handleImageUpload} />
            <div className="admin-actions">
              <button className="admin-button" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" className="admin-ghost" onClick={resetForm}>Reset</button>
            </div>
          </form>

          <div className="admin-panel admin-table-wrap">
            <div className="admin-table-head">
              <h3>Daftar {activeResource.label}</h3>
              <span>{items.length} data</span>
            </div>
            {loading && <p className="admin-muted">Memuat data...</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item[activeResource.titleField] || item.title || item.id}</strong>
                      <small>{item.id}</small>
                    </td>
                    <td>{item.category || item.type || item.period || '-'}</td>
                    <td>{item.isPublished === false ? 'Draft' : 'Publik'}</td>
                    <td>
                      <button type="button" onClick={() => editItem(item)}>Edit</button>
                      <button type="button" onClick={() => removeItem(item)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}

function FieldList({ resource, form, updateField, editing, onUploadImage }) {
  return Object.keys(baseFields[resource]).map((key) => {
    if (key === 'id') {
      return (
        <label key={key}>
          ID
          <input value={form.id} onChange={(event) => updateField('id', event.target.value)} disabled={editing} required />
        </label>
      )
    }

    if (key === 'description' || key === 'summary' || key === 'shortDesc') {
      return (
        <label key={key}>
          {labelFor(key)}
          <textarea value={form[key]} onChange={(event) => updateField(key, event.target.value)} required={key !== 'description'} />
        </label>
      )
    }

    if (key === 'isPublished') {
      return (
        <label key={key} className="admin-check">
          <input type="checkbox" checked={Boolean(form[key])} onChange={(event) => updateField(key, event.target.checked)} />
          Publikasikan
        </label>
      )
    }

    if (key === 'image') {
      return (
        <label key={key} className="admin-field-upload">
          {labelFor(key)}
          <div className="admin-upload-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={form[key]}
              onChange={(event) => updateField(key, event.target.value)}
              placeholder="Masukkan URL atau unggah file..."
              style={{ flex: 1 }}
              required
            />
            <label className="admin-upload-btn" style={{
              cursor: 'pointer',
              padding: '8px 12px',
              background: 'var(--color-primary, #0f5132)',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              border: '1px solid transparent'
            }}>
              Unggah Gambar
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onUploadImage(file)
                }} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </label>
      )
    }

    return (
      <label key={key}>
        {labelFor(key)}
        <input
          value={form[key]}
          onChange={(event) => updateField(key, event.target.value)}
          required={['name', 'title', 'category', 'location', 'latitude', 'longitude', 'image', 'type'].includes(key)}
          type={['latitude', 'longitude', 'sortOrder'].includes(key) ? 'number' : 'text'}
          step={['latitude', 'longitude'].includes(key) ? 'any' : undefined}
        />
      </label>
    )
  })
}

function labelFor(key) {
  const labels = {
    id: 'ID',
    name: 'Nama',
    title: 'Judul',
    category: 'Kategori',
    location: 'Lokasi',
    latitude: 'Latitude',
    longitude: 'Longitude',
    routeNodeId: 'Node Rute',
    shortDesc: 'Deskripsi Pendek',
    description: 'Deskripsi',
    image: 'URL Gambar',
    keywords: 'Keyword',
    sortOrder: 'Urutan',
    icon: 'Ikon',
    className: 'Class Galeri',
    period: 'Periode',
    type: 'Tipe',
    publisher: 'Penerbit',
    url: 'URL'
  }
  return labels[key] || key
}

export default AdminDashboard
