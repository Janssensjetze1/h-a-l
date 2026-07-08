import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MarkdownEditor from '../../components/desktop/MarkdownEditor'
import Icon from '../../components/Icon'

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #1a0204 0%, #0a0a14 40%)',
    display: 'flex',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  sidebar: {
    width: '240px',
    flexShrink: 0,
    background: 'rgba(74,0,8,0.15)',
    borderRight: '1px solid rgba(74,0,8,0.3)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 0',
  },
  logo: {
    padding: '0 24px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    marginBottom: '16px',
  },
  main: {
    flex: 1,
    padding: '40px 48px',
    overflowY: 'auto',
  },
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '10px 14px',
  color: 'white', fontSize: '14px', outline: 'none',
}
const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '8px',
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', padding: '11px 24px',
        background: active ? 'rgba(184,115,51,0.12)' : 'none',
        borderLeft: active ? '2px solid #b87333' : '2px solid transparent',
        border: 'none', cursor: 'pointer',
        color: active ? '#b87333' : 'rgba(255,255,255,0.45)',
        fontSize: '14px', fontWeight: active ? '600' : '400',
        textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <span style={{ display: 'inline-flex', fontSize: '16px' }}>{icon}</span>
      {label}
    </button>
  )
}

// ── Foto upload hulpfunctie ─────────────────────────────────────────────────
async function uploadPhoto(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('post-images').upload(fileName, file, { contentType: file.type })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName)
  return publicUrl
}

// ── Voorstellen formulier ───────────────────────────────────────────────────
function VoorstellenForm({ userId, editPost, voorstellenCatId, onSaved, onCancel }) {
  const fotoRef = useRef(null)
  const [form, setForm] = useState({
    naam: '',
    contact: '',
    bio: '',
    category_id: '',
    is_pinned: false,
  })
  const [fotoUrl, setFotoUrl] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Vul formulier bij bewerken (editPost = rij uit wie_is_wie)
  useEffect(() => {
    if (editPost) {
      setForm({ naam: editPost.naam ?? '', contact: editPost.contact ?? '', bio: editPost.bio ?? '', is_pinned: editPost.is_pinned ?? false })
      setFotoUrl(editPost.image_url ?? null)
      setFotoPreview(editPost.image_url ?? null)
    } else {
      setForm({ naam: '', contact: '', bio: '', is_pinned: false })
      setFotoUrl(null)
      setFotoPreview(null)
    }
  }, [editPost])

  async function handleFoto(file) {
    if (!file || !file.type.startsWith('image/')) return
    setFotoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      setFotoUrl(url)
    } catch (e) { setError('Foto upload mislukt: ' + e.message) }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const payload = {
      naam: form.naam,
      contact: form.contact,
      bio: form.bio,
      image_url: fotoUrl,
      is_pinned: form.is_pinned,
      author_id: userId,
    }
    const { error: err } = editPost
      ? await supabase.from('wie_is_wie').update(payload).eq('id', editPost.id)
      : await supabase.from('wie_is_wie').insert(payload)
    if (err) setError(err.message)
    else onSaved()
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Foto upload */}
      <div>
        <label style={labelStyle}>Profielfoto</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => fotoRef.current?.click()}
            style={{
              width: '100px', height: '100px', borderRadius: '16px',
              background: fotoPreview ? 'transparent' : 'rgba(255,255,255,0.05)',
              border: '2px dashed rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
              position: 'relative',
            }}
          >
            {fotoPreview
              ? <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Icon name="camera" style={{ color: 'rgba(255,255,255,0.25)' }} />
            }
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '12px' }}>...</span>
              </div>
            )}
          </div>
          <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) handleFoto(e.target.files[0]); e.target.value = '' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 6px' }}>
              {fotoPreview ? 'Klik om foto te wijzigen' : 'Klik om foto te kiezen'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: 0 }}>JPG, PNG of WebP · max 5MB</p>
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Naam *</label>
        <input value={form.naam} onChange={e => setForm(p => ({ ...p, naam: e.target.value }))} required style={inputStyle} placeholder="Voor- en achternaam" />
      </div>

      <div>
        <label style={labelStyle}>Contactgegevens</label>
        <input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} style={inputStyle} placeholder="e-mail, telefoon, ..." />
      </div>

      <div>
        <label style={labelStyle}>Over deze persoon</label>
        <textarea
          value={form.bio}
          onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
          rows={5}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Vertel iets over deze persoon..."
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
        <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} style={{ accentColor: '#b87333' }} />
        Vastprikken
      </label>

      {error && <p style={{ color: '#f87171', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={submitting || uploading} style={{ flex: 1, padding: '12px', background: '#b87333', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: (submitting || uploading) ? 0.6 : 1 }}>
          {submitting ? 'Opslaan...' : editPost ? 'Wijzigingen opslaan' : 'Persoon toevoegen'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
            Annuleren
          </button>
        )}
      </div>
    </form>
  )
}

// ── Normaal bericht formulier ───────────────────────────────────────────────
function BerichtForm({ userId, categories, subcategories, editPost, voorstellenCatId, onSaved, onCancel }) {
  const [form, setForm] = useState({ title: '', content: '', category_id: '', subcategory_id: '', is_pinned: false, send_push: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editPost) {
      setForm({
        title: editPost.title,
        content: editPost.content,
        category_id: String(editPost.category_id ?? ''),
        subcategory_id: String(editPost.subcategory_id ?? ''),
        is_pinned: editPost.is_pinned ?? false,
        send_push: false,
      })
    }
  }, [editPost])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value, ...(name === 'category_id' ? { subcategory_id: '' } : {}) }))
  }

  const filteredSubcats = subcategories.filter(s => s.category_id === Number(form.category_id))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const payload = {
      title: form.title, content: form.content,
      category_id: form.category_id ? Number(form.category_id) : null,
      subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
      is_pinned: form.is_pinned, push_sent: form.send_push,
      author_id: userId,
    }
    const { error: err } = editPost
      ? await supabase.from('posts').update(payload).eq('id', editPost.id)
      : await supabase.from('posts').insert(payload)
    if (err) setError(err.message)
    else onSaved()
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Titel</label>
        <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} placeholder="Titel van het bericht" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Categorie</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}
            disabled={!!editPost}>
            <option value="">Kies...</option>
            {categories.filter(c => c.id !== voorstellenCatId).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        {filteredSubcats.length > 0 && (
          <div>
            <label style={labelStyle}>Subcategorie</label>
            <select name="subcategory_id" value={form.subcategory_id} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Geen</option>
              {filteredSubcats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>Inhoud</label>
        <MarkdownEditor value={form.content} onChange={val => setForm(prev => ({ ...prev, content: val }))} />
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          <input type="checkbox" name="is_pinned" checked={form.is_pinned} onChange={handleChange} style={{ accentColor: '#b87333' }} />
          Vastprikken
        </label>
        {!editPost && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            <input type="checkbox" name="send_push" checked={form.send_push} onChange={handleChange} style={{ accentColor: '#b87333' }} />
            Push notificatie
          </label>
        )}
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: '#b87333', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Opslaan...' : editPost ? 'Wijzigingen opslaan' : 'Bericht plaatsen'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
            Annuleren
          </button>
        )}
      </div>
    </form>
  )
}

// ── Tab: Berichten ──────────────────────────────────────────────────────────
function TabBerichten({ userId }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [posts, setPosts] = useState([])
  const [leden, setLeden] = useState([])
  const [editPost, setEditPost] = useState(null)   // post uit posts tabel
  const [editLid, setEditLid] = useState(null)     // lid uit wie_is_wie tabel
  const [newType, setNewType] = useState(null)     // null | 'bericht' | 'voorstelling'
  const [success, setSuccess] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: cats }, { data: subcats }, { data: p }, { data: l }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('subcategories').select('*'),
      supabase.from('posts').select('*, categories(name, slug), profiles(full_name)').order('created_at', { ascending: false }).limit(30),
      supabase.from('wie_is_wie').select('*').order('created_at', { ascending: false }),
    ])
    setCategories(cats ?? [])
    setSubcategories(subcats ?? [])
    setPosts(p ?? [])
    setLeden(l ?? [])
  }

  function handleSaved(msg) {
    setEditPost(null)
    setEditLid(null)
    setNewType(null)
    setSuccess(msg || '✓ Opgeslagen!')
    loadAll()
    setTimeout(() => setSuccess(''), 3000)
  }

  function cancelForm() {
    setEditPost(null)
    setEditLid(null)
    setNewType(null)
  }

  // Actief formulier bepalen
  const showVoorstellenForm = newType === 'voorstelling' || !!editLid
  const showBerichtForm = newType === 'bericht' || !!editPost
  const formTitle = editLid
    ? `Bewerken: ${editLid.naam}`
    : editPost
    ? `Bewerken: ${editPost.title}`
    : newType === 'voorstelling' ? 'Persoon toevoegen' : 'Nieuw bericht'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
      {/* Linker kolom: formulier */}
      <div>
        {/* Knoppen als er geen formulier open is */}
        {!showVoorstellenForm && !showBerichtForm && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Nieuw</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setNewType('bericht')} style={{
                flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(184,115,51,0.3)',
                background: 'rgba(184,115,51,0.08)', color: '#b87333', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Icon name="document" /><span>Bericht</span>
              </button>
              <button onClick={() => setNewType('voorstelling')} style={{
                flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Icon name="person" /><span>Wie is wie</span>
              </button>
            </div>
          </div>
        )}

        {(showVoorstellenForm || showBerichtForm) && (
          <>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
              {formTitle}
            </h2>
            {showVoorstellenForm && (
              <VoorstellenForm
                userId={userId}
                editPost={editLid}
                voorstellenCatId={null}
                onSaved={() => handleSaved('✓ Persoon opgeslagen!')}
                onCancel={cancelForm}
              />
            )}
            {showBerichtForm && (
              <BerichtForm
                userId={userId}
                categories={categories}
                subcategories={subcategories}
                editPost={editPost}
                voorstellenCatId={null}
                onSaved={() => handleSaved('✓ Bericht opgeslagen!')}
                onCancel={cancelForm}
              />
            )}
          </>
        )}

        {success && (
          <p style={{ color: '#4ade80', fontSize: '13px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', padding: '10px 14px', marginTop: '12px' }}>
            {success}
          </p>
        )}
      </div>

      {/* Rechter kolom: berichten + wie is wie */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Wie is wie */}
        <div>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
            Wie is wie <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>({leden.length})</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {leden.length === 0 && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>Nog niemand toegevoegd.</p>}
            {leden.map(lid => (
              <div key={lid.id} style={{
                background: editLid?.id === lid.id ? 'rgba(184,115,51,0.08)' : 'rgba(255,255,255,0.03)',
                border: editLid?.id === lid.id ? '1px solid rgba(184,115,51,0.3)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                {lid.image_url
                  ? <img src={lid.image_url} alt="" style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(184,115,51,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: '700', color: '#b87333' }}>
                      {lid.naam.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lid.naam}</p>
                  {lid.contact && <p style={{ color: '#b87333', fontSize: '11px', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lid.contact}</p>}
                </div>
                <button onClick={() => { setEditPost(null); setNewType(null); setEditLid(lid) }}
                  style={{ padding: '4px 10px', borderRadius: '7px', border: 'none', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
                  Bewerken
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Berichten */}
        <div>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
            Berichten <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>({posts.length})</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {posts.map(post => (
              <div key={post.id} style={{
                background: editPost?.id === post.id ? 'rgba(184,115,51,0.08)' : 'rgba(255,255,255,0.03)',
                border: editPost?.id === post.id ? '1px solid rgba(184,115,51,0.3)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {post.is_pinned && <Icon name="pin" style={{ color: '#b87333', flexShrink: 0 }} />}{post.title}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#b87333', fontWeight: '600' }}>{post.categories?.name}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(post.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <button onClick={() => { setEditLid(null); setNewType(null); setEditPost(post) }}
                  style={{ padding: '4px 10px', borderRadius: '7px', border: 'none', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
                  Bewerken
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Ledenbeheer ────────────────────────────────────────────────────────
function TabLeden() {
  const [leden, setLeden] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { loadLeden() }, [])

  async function loadLeden() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setLeden(data ?? [])
    setLoading(false)
  }

  async function toggleAdmin(lid) {
    setUpdating(lid.id)
    const newRole = lid.role === 'admin' ? 'member' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', lid.id)
    setLeden(prev => prev.map(l => l.id === lid.id ? { ...l, role: newRole } : l))
    setUpdating(null)
  }

  const gefilterd = leden.filter(l =>
    (l.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l.username ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0 }}>
          Leden <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', fontSize: '16px' }}>({leden.length})</span>
        </h2>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Zoeken..."
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', color: 'white', fontSize: '13px', outline: 'none', width: '220px' }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Laden...</p>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Naam', 'Gebruikersnaam', 'Lid sinds', 'Rol'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
            ))}
          </div>
          {gefilterd.map((lid, i) => (
            <div key={lid.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: '16px',
              padding: '14px 20px', alignItems: 'center',
              borderBottom: i < gefilterd.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{lid.full_name || '—'}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{lid.username || '—'}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                {new Date(lid.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: '2-digit' })}
              </span>
              <button
                onClick={() => toggleAdmin(lid)}
                disabled={updating === lid.id}
                style={{
                  padding: '5px 12px', borderRadius: '20px', border: 'none',
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                  background: lid.role === 'admin' ? 'rgba(184,115,51,0.2)' : 'rgba(255,255,255,0.07)',
                  color: lid.role === 'admin' ? '#b87333' : 'rgba(255,255,255,0.4)',
                  opacity: updating === lid.id ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {lid.role === 'admin' ? 'Admin' : 'Lid'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Hoofdcomponent ──────────────────────────────────────────────────────────
export default function DesktopAdmin() {
  const { user, profile, signOut } = useAuth()
  const [tab, setTab] = useState('berichten')

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <img src="/logo.png" alt="H-A-L" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '8px', display: 'block' }} />
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Beheerportaal</div>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarItem icon={<Icon name="document" />} label="Berichten" active={tab === 'berichten'} onClick={() => setTab('berichten')} />
          <SidebarItem icon={<Icon name="users" />} label="Leden" active={tab === 'leden'} onClick={() => setTab('leden')} />
        </nav>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.full_name || user?.email}
          </div>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
            Uitloggen →
          </button>
        </div>
      </aside>

      <main style={s.main}>
        {tab === 'berichten' && <TabBerichten userId={user?.id} />}
        {tab === 'leden' && <TabLeden />}
      </main>
    </div>
  )
}
