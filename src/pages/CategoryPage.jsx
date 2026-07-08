import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import VoorstellenCard from '../components/VoorstellenCard'
import UserPostForm from '../components/UserPostForm'

// Categorieën waar gebruikers zelf berichten kunnen plaatsen
const COMMUNITY_SLUGS = ['toestellen', 'reiniging']

export default function CategoryPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [category, setCategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [posts, setPosts] = useState([])
  const [leden, setLeden] = useState([])
  const [activeSubcat, setActiveSubcat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)

  const isVoorstellen = slug === 'voorstellen'
  const isCommunity = COMMUNITY_SLUGS.includes(slug)

  useEffect(() => {
    async function load() {
      setLoading(true)

      if (isVoorstellen) {
        const { data } = await supabase
          .from('wie_is_wie')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
        setLeden(data ?? [])
        setCategory({ name: 'Wie is wie', slug: 'voorstellen' })
        setLoading(false)
        return
      }

      const { data: cat } = await supabase
        .from('categories').select('*').eq('slug', slug).single()
      setCategory(cat)
      if (!cat) { setLoading(false); return }

      const { data: subcats } = await supabase
        .from('subcategories').select('*').eq('category_id', cat.id)
      setSubcategories(subcats ?? [])
      setActiveSubcat(null)
      await fetchPosts(cat.id, null)
      setLoading(false)
    }
    load()
  }, [slug])

  async function fetchPosts(categoryId, subcatId) {
    let q = supabase
      .from('posts')
      .select('*, profiles(full_name), subcategories(name)')
      .eq('category_id', categoryId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (subcatId) q = q.eq('subcategory_id', subcatId)
    const { data } = await q
    setPosts(data ?? [])
  }

  async function handleSubcatFilter(subcatId) {
    setActiveSubcat(subcatId)
    await fetchPosts(category.id, subcatId)
  }

  function handlePosted(newPost) {
    setPosts(prev => [newPost, ...prev])
    setShowPostForm(false)
  }

  if (loading) return (
    <div style={{ padding: '14px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'white', borderRadius: '14px', padding: '14px', marginBottom: '2px',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{ height: '13px', background: '#f0ede8', borderRadius: '6px', width: '70%', marginBottom: '8px' }} />
          <div style={{ height: '11px', background: '#f0ede8', borderRadius: '6px', width: '90%' }} />
        </div>
      ))}
    </div>
  )

  if (!category) return (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9a9189', fontSize: '14px' }}>
      Categorie niet gevonden.
    </div>
  )

  return (
    <div>
      {/* Subcategorie filterbar */}
      {!isVoorstellen && subcategories.length > 0 && (
        <div style={{
          display: 'flex', gap: '6px',
          padding: '10px 14px',
          overflowX: 'auto',
          background: 'rgba(16,8,18,0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {[{ id: null, name: 'Alle' }, ...subcategories].map(s => {
            const active = s.id === null ? activeSubcat === null : activeSubcat === s.id
            return (
              <button
                key={s.id ?? 'alle'}
                onClick={() => handleSubcatFilter(s.id)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: '20px', border: 'none',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  background: active ? 'white' : 'rgba(255,255,255,0.09)',
                  color: active ? '#100d0a' : 'rgba(255,255,255,0.4)',
                  boxShadow: active ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '14px 14px 0' }}>
        {isVoorstellen ? (
          leden.length === 0 ? (
            <EmptyState text="Nog niemand toegevoegd." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {leden.map(lid => <VoorstellenCard key={lid.id} lid={lid} />)}
            </div>
          )
        ) : (
          posts.length === 0 ? (
            <EmptyState
              text={isCommunity ? 'Wees de eerste om iets te delen.' : 'Nog geen berichten in deze categorie.'}
            />
          ) : (
            <div style={{
              background: 'white', borderRadius: '16px', overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.055)',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}>
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} last={i === posts.length - 1} />
              ))}
            </div>
          )
        )}
      </div>

      {/* FAB — ingelogd + community categorie */}
      {isCommunity && (
        <div style={{
          position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 84px)', right: '20px',
          zIndex: 40,
        }}>
          {user ? (
            <button
              onClick={() => setShowPostForm(true)}
              style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B0000, #5a0010)',
                border: 'none', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(139,0,0,0.45)',
                fontSize: '26px', fontWeight: '300', lineHeight: 1,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.93)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              +
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(139,0,0,0.15)',
                border: '1.5px solid rgba(139,0,0,0.3)',
                color: '#8B0000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: '300', lineHeight: 1,
                textDecoration: 'none',
              }}
            >
              +
            </Link>
          )}
        </div>
      )}

      {/* Post formulier */}
      {showPostForm && (
        <UserPostForm
          category={category}
          subcategories={subcategories}
          onClose={() => setShowPostForm(false)}
          onPosted={handlePosted}
        />
      )}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{
      background: 'white', borderRadius: '14px', padding: '40px 16px', textAlign: 'center',
      border: '1px solid rgba(0,0,0,0.05)',
    }}>
      <p style={{ fontSize: '14px', color: '#b0a89e', margin: 0 }}>{text}</p>
    </div>
  )
}
