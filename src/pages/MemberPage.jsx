import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useNav } from '../context/NavContext'

export default function MemberPage() {
  const { id } = useParams()
  const { setNav } = useNav()
  const [lid, setLid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return () => setNav({ title: null, backTo: null, action: null })
  }, [])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('wie_is_wie')
        .select('*')
        .eq('id', id)
        .single()
      setLid(data)
      setLoading(false)
      if (data) setNav({ title: data.naam, backTo: '/categorie/voorstellen' })
    }
    load()
  }, [id])

  if (loading) return (
    <div className="px-4 pt-5 animate-pulse space-y-4">
      <div className="h-6 bg-surface-raised rounded-full w-3/4" />
      <div className="h-4 bg-surface-raised rounded-full w-full" />
    </div>
  )

  if (!lid) return (
    <div className="px-4 py-8 text-center text-ink-muted text-sm">Lid niet gevonden.</div>
  )

  return (
    <div className="px-4 pt-4 pb-6">
      <article className="bg-white rounded-2xl overflow-hidden shadow-card border border-black/[0.04]">
        {lid.image_url && (
          <img
            src={lid.image_url} alt={lid.naam}
            style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
          />
        )}
        {!lid.image_url && (
          <div style={{
            width: '100%', height: '160px',
            background: 'linear-gradient(135deg, #2d0005 0%, #1a0a12 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '64px', fontWeight: '900', color: 'rgba(184,115,51,0.3)', letterSpacing: '-2px' }}>
              {lid.naam.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
        )}

        <div className="p-5">
          <h1 className="text-[22px] font-black text-ink leading-tight">{lid.naam}</h1>
          {lid.contact && (
            <p className="mt-1.5 text-[13px] font-semibold" style={{ color: '#b87333' }}>{lid.contact}</p>
          )}
          {lid.bio && (
            <p className="mt-4 text-[14px] text-ink-soft leading-relaxed">{lid.bio}</p>
          )}
          <p className="mt-4 text-[11px] text-ink-faint">
            Toegevoegd op {new Date(lid.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </article>
    </div>
  )
}
