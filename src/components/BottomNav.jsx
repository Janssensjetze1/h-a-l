import { Link, useLocation } from 'react-router-dom'

const tabs = [
  {
    slug: 'algemeen',
    label: 'Algemeen',
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.7'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    slug: 'voorstellen',
    label: 'Wie is wie',
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.7'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    slug: 'reiniging',
    label: 'Reiniging',
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.7'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    slug: 'toestellen',
    label: 'Toestellen',
    icon: (active) => (
      <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.7'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
      paddingTop: '10px',
      paddingLeft: '14px', paddingRight: '14px',
      pointerEvents: 'none',
      maxWidth: '512px',
      margin: '0 auto',
    }}>
      <div style={{
        background: 'rgba(18,8,14,0.95)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        padding: '5px 6px',
        gap: '2px',
        pointerEvents: 'all',
      }}>
        {tabs.map(tab => {
          const active = location.pathname === `/categorie/${tab.slug}`
          return (
            <Link
              key={tab.slug}
              to={`/categorie/${tab.slug}`}
              style={{
                flex: active ? '0 0 auto' : 1,
                display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                gap: '7px',
                padding: active ? '10px 16px' : '10px 0',
                textDecoration: 'none',
                borderRadius: '22px',
                background: active ? 'white' : 'transparent',
                boxShadow: active ? '0 1px 8px rgba(0,0,0,0.18)' : 'none',
                color: active ? '#140d08' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.22s cubic-bezier(0.34,1.2,0.64,1)',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ flexShrink: 0, display: 'flex', lineHeight: 0 }}>
                {tab.icon(active)}
              </div>
              {active && (
                <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '-0.2px' }}>
                  {tab.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
