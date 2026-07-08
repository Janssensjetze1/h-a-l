import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, backTo, action }) {
  const navigate = useNavigate()

  function goBack() {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <div style={{
      position: 'sticky',
      top: 'calc(101px + env(safe-area-inset-top))',
      zIndex: 40,
      background: 'linear-gradient(180deg, rgba(22,4,8,0.98) 0%, rgba(12,10,22,0.98) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      height: '50px',
      flexShrink: 0,
    }}>
      {/* Terug knop */}
      <button
        onClick={goBack}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: 'none',
          borderRadius: '50%',
          width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Titel */}
      <span style={{
        flex: 1,
        textAlign: 'center',
        color: 'white',
        fontSize: '15px',
        fontWeight: '700',
        letterSpacing: '-0.2px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '0 8px',
      }}>
        {title}
      </span>

      {/* Optionele actieknop rechts */}
      <div style={{ width: '32px', display: 'flex', justifyContent: 'flex-end' }}>
        {action ?? null}
      </div>
    </div>
  )
}
