import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'
import { CategoryIcon } from '../components/Icon'

const categories = [
  { slug: 'algemeen',    label: 'Algemeen',    desc: 'Mededelingen' },
  { slug: 'voorstellen', label: 'Wie is wie',  desc: 'Stel jezelf voor' },
  { slug: 'reiniging',   label: 'Reiniging',   desc: 'Tips & conservering' },
  { slug: 'toestellen',  label: 'Toestellen',  desc: 'Detectoren' },
]

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(full_name), categories(name, slug), subcategories(name)')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentPosts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ paddingBottom: '4px' }}>

      {/* Hero banner */}
      <div style={{
        margin: '14px 14px 0',
        borderRadius: '18px',
        padding: '22px 20px',
        background: 'linear-gradient(135deg, #2e0306 0%, #18091a 55%, #100c1a 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,115,51,0.12) 0%, transparent 70%)',
        }} />
        <p style={{
          fontSize: '10px', fontWeight: '800', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#c9893f', margin: '0 0 8px',
        }}>
          Hobby Archeologie Limburg
        </p>
        <h1 style={{
          fontSize: '21px', fontWeight: '900', lineHeight: 1.2,
          color: 'rgba(255,255,255,0.92)', margin: 0, letterSpacing: '-0.4px',
        }}>
          Op zoek naar de<br />afdruk van het verleden.
        </h1>
      </div>

      {/* Vondst melden */}
      <div style={{ padding: '12px 14px 0' }}>
        <a
          href="https://h-a-l.be"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #b87333 0%, #7c4b1f 100%)',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(184,115,51,0.3)',
          }}
          onTouchStart={e => e.currentTarget.style.opacity = '0.85'}
          onTouchEnd={e => e.currentTarget.style.opacity = '1'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'white', margin: '0 0 2px', letterSpacing: '-0.2px' }}>
                Vondst melden
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Registreer via h-a-l.be
              </p>
            </div>
          </div>
          <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Categorieën */}
      <section style={{ padding: '20px 14px 0' }}>
        <p style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#a89e93', margin: '0 0 10px',
        }}>
          Categorieën
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {categories.map(cat => (
            <Link
              key={cat.slug}
              to={`/categorie/${cat.slug}`}
              style={{
                textDecoration: 'none',
                background: 'white',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                WebkitTapHighlightColor: 'transparent',
              }}
              onTouchStart={e => e.currentTarget.style.background = '#f5f2ee'}
              onTouchEnd={e => e.currentTarget.style.background = 'white'}
            >
              <CategoryIcon slug={cat.slug} size={20} color="#b87333" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#100d0a', margin: '0 0 2px', lineHeight: 1 }}>
                  {cat.label}
                </p>
                <p style={{ fontSize: '11px', color: '#9a9189', margin: 0 }}>
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recente berichten */}
      <section style={{ padding: '20px 14px 0' }}>
        <p style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#a89e93', margin: '0 0 10px',
        }}>
          Recente berichten:
        </p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'white', borderRadius: '14px', padding: '14px',
                border: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div style={{ height: '13px', background: '#f0ede8', borderRadius: '6px', width: '70%', marginBottom: '8px' }} />
                <div style={{ height: '11px', background: '#f0ede8', borderRadius: '6px', width: '90%' }} />
              </div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '14px', padding: '32px 16px', textAlign: 'center',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '14px', color: '#b0a89e', margin: 0 }}>Nog geen berichten.</p>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.055)',
            boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
          }}>
            {recentPosts.map((post, i) => (
              <PostCard key={post.id} post={post} last={i === recentPosts.length - 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
