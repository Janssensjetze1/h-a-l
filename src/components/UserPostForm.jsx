import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function formatTimeLeft(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}u ${m}m`
  return `${m} minuten`
}

export default function UserPostForm({ category, subcategories = [], onClose, onPosted }) {
  const { user, isAdmin } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subcatId, setSubcatId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [rateLimitInfo, setRateLimitInfo] = useState(null) // { nextAllowed: Date }
  const [checking, setChecking] = useState(true)

  // Controleer 24u limiet bij openen
  useEffect(() => {
    if (isAdmin) { setChecking(false); return }

    async function check() {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('posts')
        .select('created_at')
        .eq('author_id', user.id)
        .eq('category_id', category.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        const nextAllowed = new Date(new Date(data.created_at).getTime() + 24 * 60 * 60 * 1000)
        setRateLimitInfo({ nextAllowed })
      }
      setChecking(false)
    }
    check()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        category_id: category.id,
        subcategory_id: subcatId || null,
        is_pinned: false,
      })
      .select('*, profiles(full_name), subcategories(name)')
      .single()

    if (err) {
      setError('Er ging iets mis. Probeer opnieuw.')
      setSubmitting(false)
      return
    }

    onPosted(data)
  }

  const msLeft = rateLimitInfo ? rateLimitInfo.nextAllowed - Date.now() : 0

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 81,
        background: '#faf9f7',
        borderRadius: '24px 24px 0 0',
        padding: '0 0 calc(env(safe-area-inset-bottom) + 16px)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxWidth: '512px',
        margin: '0 auto',
        animation: 'slideUp 0.28s cubic-bezier(0.32,1,0.6,1)',
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.12)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 20px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#100d0a', margin: 0 }}>
            Nieuw bericht
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%',
            width: '30px', height: '30px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7a6e60', fontSize: '16px', fontWeight: '600',
          }}>
            ✕
          </button>
        </div>

        {checking ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid rgba(184,115,51,0.2)', borderTop: '2px solid #b87333', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : rateLimitInfo && msLeft > 0 && !isAdmin ? (
          /* Rate limit bereikt */
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(184,115,51,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" fill="none" stroke="#b87333" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#100d0a', margin: '0 0 8px' }}>
              Je hebt al gepost vandaag
            </p>
            <p style={{ fontSize: '14px', color: '#9a9189', margin: '0 0 4px' }}>
              Je kan opnieuw posten over
            </p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#b87333', margin: 0 }}>
              {formatTimeLeft(msLeft)}
            </p>
          </div>
        ) : (
          /* Formulier */
          <form onSubmit={handleSubmit} style={{ padding: '16px 20px 0' }}>

            {/* Subcategorie picker */}
            {subcategories.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#9a9189', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  Onderdeel
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {subcategories.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubcatId(s.id === subcatId ? null : s.id)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', border: 'none',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        background: subcatId === s.id ? '#100d0a' : 'rgba(0,0,0,0.07)',
                        color: subcatId === s.id ? 'white' : '#7a6e60',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Titel */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#9a9189', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                Titel
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Waar gaat je bericht over?"
                maxLength={120}
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 14px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  fontSize: '15px', color: '#100d0a',
                  background: 'white', outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#b87333'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
              />
            </div>

            {/* Inhoud */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#9a9189', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                Bericht
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Schrijf je bericht hier..."
                rows={5}
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 14px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  fontSize: '14px', color: '#100d0a', lineHeight: 1.55,
                  background: 'white', outline: 'none', resize: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#b87333'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 12px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #8B0000, #5a0010)',
                color: 'white', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', opacity: (submitting || !title.trim() || !content.trim()) ? 0.45 : 1,
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Plaatsen...' : 'Bericht plaatsen'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
