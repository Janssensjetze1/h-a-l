import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function DesktopLogin() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('Ongeldige inloggegevens.')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1e0205 0%, #0a0a14 50%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        padding: '48px 40px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '110px', height: '110px', borderRadius: '50%',
            background: 'rgba(10,10,20,0.97)',
            border: '2px solid rgba(184,115,51,0.3)',
            boxShadow: '0 0 0 1px rgba(184,115,51,0.15), 0 8px 32px rgba(0,0,0,0.4)',
            marginBottom: '16px',
            overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="H-A-L" style={{ width: '96px', height: '96px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            Beheerportaal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '6px' }}>
            Hobby Archeologie Limburg
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@voorbeeld.be"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'white', fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'white', fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', padding: '10px 14px',
              color: '#f87171', fontSize: '13px', margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: '#b87333', color: 'white',
              border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: '6px',
            }}
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '28px' }}>
          Enkel toegankelijk voor beheerders
        </p>
      </div>
    </div>
  )
}
