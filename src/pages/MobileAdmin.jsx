import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'

async function uploadPhoto(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('post-images').upload(fileName, file, { contentType: file.type })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName)
  return publicUrl
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 14px', borderRadius: '12px',
  border: '1.5px solid rgba(0,0,0,0.1)',
  fontSize: '15px', color: '#100d0a',
  background: 'white', outline: 'none',
  fontFamily: 'inherit',
}
const labelStyle = {
  fontSize: '11px', fontWeight: '700', color: '#9a9189',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '6px',
}

export default function MobileAdmin() {
  const { user, isAdmin } = useAuth()
  const { setNav } = useNav()
  const navigate = useNavigate()
  const [tab, setTab] = useState('bericht') // 'bericht' | 'wieiswie'
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    setNav({ title: 'Beheer', backTo: '/' })
    return () => setNav({ title: null, backTo: null, action: null })
  }, [])

  // Niet-admins wegsturen
  useEffect(() => {
    if (!isAdmin) navigate('/', { replace: true })
  }, [isAdmin])

  function handleSaved(type) {
    setSuccess(type === 'bericht' ? 'Bericht geplaatst!' : 'Lid toegevoegd!')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div style={{ paddingBottom: '24px' }}>

      {/* Tab switcher */}
      <div style={{
        display: 'flex', gap: '8px', padding: '14px 14px 0',
      }}>
        {[
          { key: 'bericht', label: 'Bericht' },
          { key: 'wieiswie', label: 'Wie is wie' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '11px', borderRadius: '12px', border: 'none',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              background: tab === t.key ? '#100d0a' : 'rgba(0,0,0,0.06)',
              color: tab === t.key ? 'white' : '#7a6e60',
              transition: 'all 0.18s',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Succes melding */}
      {success && (
        <div style={{
          margin: '14px 14px 0',
          background: 'rgba(16,180,80,0.1)', border: '1px solid rgba(16,180,80,0.25)',
          borderRadius: '12px', padding: '12px 16px',
          fontSize: '14px', fontWeight: '600', color: '#0a7a38',
        }}>
          ✓ {success}
        </div>
      )}

      {/* Formulier */}
      <div style={{ padding: '14px 14px 0' }}>
        {tab === 'bericht'
          ? <BerichtForm userId={user?.id} onSaved={() => handleSaved('bericht')} />
          : <WieIsWieForm userId={user?.id} onSaved={() => handleSaved('wieiswie')} />
        }
      </div>
    </div>
  )
}

// ── Bericht formulier ────────────────────────────────────────────────────────
function BerichtForm({ userId, onSaved }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [subcatId, setSubcatId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? [])
      if (data?.length) setCategoryId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!categoryId) return
    supabase.from('subcategories').select('*').eq('category_id', categoryId).then(({ data }) => {
      setSubcategories(data ?? [])
      setSubcatId('')
    })
  }, [categoryId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !categoryId) return
    setSubmitting(true)
    setError(null)
    const { error: err } = await supabase.from('posts').insert({
      title: title.trim(),
      content: content.trim(),
      author_id: userId,
      category_id: categoryId,
      subcategory_id: subcatId || null,
      is_pinned: pinned,
    })
    if (err) setError(err.message)
    else {
      setTitle(''); setContent(''); setPinned(false); setSubcatId('')
      onSaved()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Categorie */}
      <div>
        <label style={labelStyle}>Categorie</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239a9189\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
        >
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Subcategorie */}
      {subcategories.length > 0 && (
        <div>
          <label style={labelStyle}>Onderdeel (optioneel)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button type="button" onClick={() => setSubcatId('')}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: !subcatId ? '#100d0a' : 'rgba(0,0,0,0.07)', color: !subcatId ? 'white' : '#7a6e60', fontFamily: 'inherit' }}>
              Geen
            </button>
            {subcategories.map(s => (
              <button key={s.id} type="button" onClick={() => setSubcatId(s.id)}
                style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: subcatId === s.id ? '#100d0a' : 'rgba(0,0,0,0.07)', color: subcatId === s.id ? 'white' : '#7a6e60', fontFamily: 'inherit' }}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Titel */}
      <div>
        <label style={labelStyle}>Titel</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Titel van het bericht"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#b87333'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
        />
      </div>

      {/* Inhoud */}
      <div>
        <label style={labelStyle}>Inhoud</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} required rows={6}
          placeholder="Schrijf het bericht hier..."
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#b87333'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
        />
      </div>

      {/* Vastpinnen */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: '#b87333' }} />
        <span style={{ fontSize: '14px', color: '#7a6e60', fontWeight: '500' }}>Vastpinnen bovenaan</span>
      </label>

      {error && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>}

      <button type="submit" disabled={submitting || !title.trim() || !content.trim()}
        style={{
          padding: '14px', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, #8B0000, #5a0010)',
          color: 'white', fontSize: '15px', fontWeight: '700',
          cursor: 'pointer', fontFamily: 'inherit',
          opacity: submitting || !title.trim() || !content.trim() ? 0.45 : 1,
        }}>
        {submitting ? 'Plaatsen...' : 'Bericht plaatsen'}
      </button>
    </form>
  )
}

// ── Wie is wie formulier ─────────────────────────────────────────────────────
function WieIsWieForm({ userId, onSaved }) {
  const fotoRef = useRef(null)
  const [naam, setNaam] = useState('')
  const [contact, setContact] = useState('')
  const [bio, setBio] = useState('')
  const [pinned, setPinned] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleFoto(file) {
    if (!file || !file.type.startsWith('image/')) return
    setFotoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      setFotoUrl(url)
    } catch (e) {
      setError('Foto upload mislukt: ' + e.message)
    }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!naam.trim()) return
    setSubmitting(true)
    setError(null)
    const { error: err } = await supabase.from('wie_is_wie').insert({
      naam: naam.trim(),
      contact: contact.trim(),
      bio: bio.trim(),
      image_url: fotoUrl,
      is_pinned: pinned,
      author_id: userId,
    })
    if (err) setError(err.message)
    else {
      setNaam(''); setContact(''); setBio(''); setFotoUrl(null); setFotoPreview(null); setPinned(false)
      onSaved()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Foto */}
      <div>
        <label style={labelStyle}>Profielfoto</label>
        <div
          onClick={() => fotoRef.current?.click()}
          style={{
            width: '100%', height: '160px', borderRadius: '14px',
            border: '2px dashed rgba(0,0,0,0.12)',
            background: fotoPreview ? 'transparent' : '#f8f6f3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', position: 'relative',
          }}
        >
          {fotoPreview ? (
            <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <svg width="28" height="28" fill="none" stroke="#b0a89e" strokeWidth="1.5" viewBox="0 0 24 24" style={{ display: 'block', margin: '0 auto 8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p style={{ fontSize: '13px', color: '#b0a89e', margin: 0 }}>Tik om foto te kiezen</p>
            </div>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(184,115,51,0.2)', borderTop: '2px solid #b87333', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>
        <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleFoto(e.target.files[0]); e.target.value = '' }} />
        {fotoPreview && (
          <button type="button" onClick={() => { setFotoUrl(null); setFotoPreview(null) }}
            style={{ marginTop: '8px', background: 'none', border: 'none', fontSize: '13px', color: '#ef4444', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
            Foto verwijderen
          </button>
        )}
      </div>

      {/* Naam */}
      <div>
        <label style={labelStyle}>Naam *</label>
        <input value={naam} onChange={e => setNaam(e.target.value)} required placeholder="Voor- en achternaam"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#b87333'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
        />
      </div>

      {/* Contact */}
      <div>
        <label style={labelStyle}>Contactgegevens</label>
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="e-mail, telefoon, ..."
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#b87333'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
        />
      </div>

      {/* Bio */}
      <div>
        <label style={labelStyle}>Over deze persoon</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5}
          placeholder="Vertel iets over deze persoon..."
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#b87333'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
        />
      </div>

      {/* Vastpinnen */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: '#b87333' }} />
        <span style={{ fontSize: '14px', color: '#7a6e60', fontWeight: '500' }}>Vastpinnen bovenaan</span>
      </label>

      {error && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>}

      <button type="submit" disabled={submitting || !naam.trim() || uploading}
        style={{
          padding: '14px', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, #8B0000, #5a0010)',
          color: 'white', fontSize: '15px', fontWeight: '700',
          cursor: 'pointer', fontFamily: 'inherit',
          opacity: submitting || !naam.trim() || uploading ? 0.45 : 1,
        }}>
        {submitting ? 'Opslaan...' : 'Lid toevoegen'}
      </button>
    </form>
  )
}
