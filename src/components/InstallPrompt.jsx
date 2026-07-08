import { useState } from 'react'

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
const isAndroid = /Android/.test(navigator.userAgent)

export default function InstallPrompt({ deferredPrompt }) {
  // Android Chrome: native install prompt beschikbaar
  if (isAndroid && deferredPrompt) {
    return <AndroidPrompt deferredPrompt={deferredPrompt} />
  }

  // iOS Safari: handmatige stappen
  if (isIOS) {
    return <IOSPrompt />
  }

  // Android zonder native prompt (Firefox, Samsung Browser, etc.)
  if (isAndroid) {
    return <AndroidManualPrompt />
  }

  // Fallback (onbekende mobiele browser)
  return <IOSPrompt />
}

// ── Android Chrome: één knop ────────────────────────────────────────────────
function AndroidPrompt({ deferredPrompt }) {
  const [installing, setInstalling] = useState(false)

  async function handleInstall() {
    setInstalling(true)
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setInstalling(false)
  }

  return (
    <Shell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
        <img src="/logo.png" alt="H-A-L" style={{ height: '110px', marginBottom: '28px' }} />
        <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9893f', margin: '0 0 10px' }}>
          Hobby Archeologie Limburg
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'white', margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          Installeer de H‑A‑L app
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: '0 0 40px', maxWidth: '280px' }}>
          Voeg H-A-L toe aan je startscherm voor de volledige app-ervaring.
        </p>
        <button
          onClick={handleInstall}
          disabled={installing}
          style={{
            padding: '16px 40px',
            borderRadius: '100px',
            border: 'none',
            background: 'linear-gradient(135deg, #b87333, #7c4b1f)',
            color: 'white',
            fontSize: '16px', fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(184,115,51,0.4)',
            opacity: installing ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {installing ? 'Bezig...' : 'Installeer app'}
        </button>
      </div>
    </Shell>
  )
}

// ── iOS Safari: handmatige stappen ─────────────────────────────────────────
function IOSPrompt() {
  return (
    <Shell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px 20px', textAlign: 'center' }}>
        <img src="/logo.png" alt="H-A-L" style={{ height: '110px', marginBottom: '28px' }} />
        <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9893f', margin: '0 0 10px' }}>
          Hobby Archeologie Limburg
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'white', margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          Installeer de H‑A‑L app
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0, maxWidth: '280px' }}>
          Voeg H-A-L toe aan je beginscherm voor de volledige app-ervaring.
        </p>
      </div>

      <div style={{ width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <Step number="1" icon={<ShareIcon />}
          text={<>Tik op het <strong style={{ color: 'white' }}>Deel</strong>-icoon onderaan in Safari</>}
        />
        <Step number="2" icon={<AddIcon />}
          text={<>Kies <strong style={{ color: 'white' }}>"Zet op beginscherm"</strong></>}
        />
        <Step number="3" icon={<CheckIcon />}
          text={<>Tik op <strong style={{ color: 'white' }}>"Voeg toe"</strong> rechtsboven</>}
        />
      </div>

      <div style={{ width: '100%', padding: '0 0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Tik hieronder op het deel-icoon
        </p>
        <div style={{ animation: 'bounce 1.4s ease-in-out infinite', lineHeight: 0 }}>
          <svg width="22" height="22" fill="none" stroke="rgba(201,137,63,0.6)" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
        `}</style>
      </div>
    </Shell>
  )
}

// ── Android zonder native prompt ────────────────────────────────────────────
function AndroidManualPrompt() {
  return (
    <Shell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px 20px', textAlign: 'center' }}>
        <img src="/logo.png" alt="H-A-L" style={{ height: '110px', marginBottom: '28px' }} />
        <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9893f', margin: '0 0 10px' }}>
          Hobby Archeologie Limburg
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'white', margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          Installeer de H‑A‑L app
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0, maxWidth: '280px' }}>
          Voeg H-A-L toe aan je startscherm via je browser.
        </p>
      </div>

      <div style={{ width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
        <Step number="1" icon={<MenuIcon />}
          text={<>Tik op het <strong style={{ color: 'white' }}>menu</strong> (⋮) rechtsboven in Chrome</>}
        />
        <Step number="2" icon={<AddIcon />}
          text={<>Kies <strong style={{ color: 'white' }}>"Toevoegen aan startscherm"</strong></>}
        />
        <Step number="3" icon={<CheckIcon />}
          text={<>Tik op <strong style={{ color: 'white' }}>"Toevoegen"</strong> om te bevestigen</>}
        />
      </div>
    </Shell>
  )
}

// ── Gedeelde wrapper ────────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1e0205 0%, #0e0812 50%, #0a0814 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: 'env(safe-area-inset-top) 0 env(safe-area-inset-bottom)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      WebkitFontSmoothing: 'antialiased',
      userSelect: 'none',
    }}>
      {children}
    </div>
  )
}

function Step({ number, icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
      padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #b87333, #7c4b1f)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '800', color: 'white',
      }}>
        {number}
      </div>
      <div style={{ flexShrink: 0, color: 'rgba(255,255,255,0.5)', lineHeight: 0 }}>{icon}</div>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>{text}</p>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  )
}

function AddIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}
