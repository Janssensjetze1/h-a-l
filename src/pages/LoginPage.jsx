import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) { setError(error.message); setLoading(false); return }
      navigate('/')
    } else {
      const { error } = await signUp(email, password, fullName)
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) return (
    <div className="px-6 py-16 text-center space-y-3">
      <div className="text-4xl mb-4">✉️</div>
      <h2 className="font-black text-[20px] text-ink">Controleer je e-mail</h2>
      <p className="text-ink-muted text-[14px] leading-relaxed">
        We stuurden een bevestigingslink naar <strong className="text-ink">{email}</strong>.
      </p>
      <Link to="/" className="inline-block mt-4 text-[13px] text-copper-500 font-semibold">Terug naar home</Link>
    </div>
  )

  return (
    <div className="px-5 pt-8 pb-6">
      <div className="mb-8">
        <p className="text-[11px] font-bold text-copper-500 uppercase tracking-widest mb-1">H-A-L</p>
        <h1 className="text-[24px] font-black text-ink">
          {mode === 'login' ? 'Welkom terug.' : 'Account aanmaken.'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div>
            <label className="block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Naam</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-copper-500/30 focus:border-copper-500 transition-all"
              placeholder="Jan Janssen"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-copper-500/30 focus:border-copper-500 transition-all"
            placeholder="jan@voorbeeld.be"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-copper-500/30 focus:border-copper-500 transition-all"
            placeholder="Minimaal 6 tekens"
          />
        </div>

        {error && (
          <p className="text-red-500 text-[13px] bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-40 transition-opacity mt-2"
        >
          {loading ? '...' : mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-muted mt-6">
        {mode === 'login' ? (
          <>Nog geen account?{' '}
            <button onClick={() => setMode('register')} className="text-copper-500 font-semibold">
              Registreer
            </button>
          </>
        ) : (
          <>Al een account?{' '}
            <button onClick={() => setMode('login')} className="text-copper-500 font-semibold">
              Inloggen
            </button>
          </>
        )}
      </p>
    </div>
  )
}
