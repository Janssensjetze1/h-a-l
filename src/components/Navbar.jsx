import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import Icon from './Icon'

function Avatar({ naam, size = 32 }) {
  const initialen = (naam ?? '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #b87333, #7c4b1f)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '700', color: 'white',
      border: '2px solid rgba(255,255,255,0.15)',
      flexShrink: 0,
    }}>
      {initialen}
    </div>
  )
}

function ProfielPopover({ open, onClose, isAdmin, signOut }) {
  const navigate = useNavigate()
  if (!open) return null
  function ga(pad) { onClose(); navigate(pad) }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
      <div style={{
        position: 'fixed',
        top: 'calc(96px + env(safe-area-inset-top))',
        left: '16px', zIndex: 99,
        background: 'rgba(14,10,20,0.97)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '14px', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        minWidth: '160px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        {isAdmin && (
          <button onClick={() => ga('/admin')} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '13px 16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600', textAlign: 'left',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <Icon name="settings" />
            Beheer
          </button>
        )}
        <button onClick={() => { onClose(); signOut() }} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '13px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: '500', textAlign: 'left',
        }}>
          <Icon name="logout" />
          Uitloggen
        </button>
      </div>
    </>
  )
}

export default function Navbar() {
  const { user, isAdmin, profile, signOut } = useAuth()
  const { title, backTo, action } = useNav()
  const navigate = useNavigate()
  const [profielOpen, setProfielOpen] = useState(false)
  const naam = profile?.full_name ?? profile?.email ?? '?'

  const isSubPage = !!title

  function goBack() {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  // ── Sub-pagina: compacte iOS-stijl nav bar ────────────────────────
  if (isSubPage) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(18,8,14,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingTop: 'env(safe-area-inset-top)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 'calc(52px + env(safe-area-inset-top))',
      }}>
        <div style={{
          height: '52px',
          display: 'flex', alignItems: 'center',
          paddingLeft: '6px', paddingRight: '8px',
          position: 'relative',
        }}>
          {/* Terug — iOS stijl met tekst */}
          <button onClick={goBack} style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            padding: '6px 12px 6px 8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#c9893f', zIndex: 1, flexShrink: 0,
          }}>
            <svg width="9" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 9 16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 1L1 8l7 7" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: '500', letterSpacing: '-0.1px' }}>Terug</span>
          </button>

          {/* Titel — absoluut gecentreerd zodat back-knop breedte niet telt */}
          <span style={{
            position: 'absolute', left: 0, right: 0,
            textAlign: 'center',
            color: 'white', fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            padding: '0 90px',
            pointerEvents: 'none',
          }}>
            {title}
          </span>

          {/* Actie rechts */}
          <div style={{ marginLeft: 'auto', zIndex: 1, flexShrink: 0 }}>
            {action ?? null}
          </div>
        </div>
      </header>
    )
  }

  // ── Thuis: groot met logo ─────────────────────────────────────────
  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'linear-gradient(180deg, rgba(40,4,8,0.99) 0%, rgba(14,8,20,0.99) 100%)',
        paddingTop: 'env(safe-area-inset-top)',
        borderBottom: '1px solid rgba(184,115,51,0.08)',
        height: 'calc(88px + env(safe-area-inset-top))',
        position: 'sticky',
      }}>
        <div style={{
          height: '88px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingLeft: '16px', paddingRight: '16px', paddingBottom: '10px',
          position: 'relative',
        }}>
          {/* Links: avatar of inloggen */}
          {user ? (
            <button onClick={() => setProfielOpen(v => !v)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0, zIndex: 1 }}>
              <Avatar naam={naam} size={32} />
            </button>
          ) : (
            <button onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#c9893f', zIndex: 1 }}>
              Inloggen
            </button>
          )}

          {/* Midden: logo */}
          <button onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0,
              position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '6px',
            }}>
            <img src="/logo.png" alt="H-A-L" style={{ height: '74px', width: 'auto', objectFit: 'contain' }} />
          </button>

          {/* Rechts: spacer */}
          <div style={{ width: 32, flexShrink: 0 }} />
        </div>
      </header>

      <ProfielPopover
        open={profielOpen}
        onClose={() => setProfielOpen(false)}
        isAdmin={isAdmin}
        signOut={signOut}
      />
    </>
  )
}
