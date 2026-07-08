import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useIsMobile } from './hooks/useIsMobile'
import { NavProvider } from './context/NavContext'
import Layout from './components/Layout'
import InstallPrompt from './components/InstallPrompt'

// Mobile pagina's
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import PostPage from './pages/PostPage'
import LoginPage from './pages/LoginPage'
import MemberPage from './pages/MemberPage'

// Desktop pagina's
import DesktopLogin from './pages/desktop/DesktopLogin'
import DesktopAdmin from './pages/desktop/DesktopAdmin'

// Detecteer of de app als PWA draait (standalone) of in de browser
function isRunningAsPWA() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

// ── Desktop flow ────────────────────────────────────────────────────────────
function DesktopApp() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <DesktopLoader />

  // Niet ingelogd → login
  if (!user) return <DesktopLogin />

  // Ingelogd maar geen admin → foutmelding
  if (!isAdmin) return <DesktopNotAllowed />

  // Admin → beheerpaneel
  return <DesktopAdmin />
}

function DesktopLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(184,115,51,0.2)', borderTop: '3px solid #b87333', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
    </div>
  )
}

function DesktopNotAllowed() {
  const { signOut } = useAuth()
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Je hebt geen toegang tot het beheerportaal.</p>
      <button onClick={signOut} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>
        Uitloggen
      </button>
    </div>
  )
}

// ── Mobile flow ─────────────────────────────────────────────────────────────
function MobileApp() {
  const { loading } = useAuth()

  // In Safari (niet als PWA) → installatie-instructie tonen
  if (!isRunningAsPWA()) return <InstallPrompt />

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid rgba(184,115,51,0.2)', borderTop: '3px solid #b87333', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
    </div>
  )

  return (
    <NavProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="categorie/:slug" element={<CategoryPage />} />
          <Route path="post/:id" element={<PostPage />} />
          <Route path="lid/:id" element={<MemberPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </NavProvider>
  )
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile()

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      {isMobile ? <MobileApp /> : <DesktopApp />}
    </>
  )
}
