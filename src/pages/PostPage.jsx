import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavContext'
import MarkdownRenderer from '../components/MarkdownRenderer'

function TrashIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { setNav } = useNav()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: postData }, { data: commentData }] = await Promise.all([
        supabase
          .from('posts')
          .select('*, profiles(full_name, id), categories(name, slug), subcategories(name), image_url')
          .eq('id', id)
          .single(),
        supabase
          .from('comments')
          .select('*, profiles(full_name)')
          .eq('post_id', id)
          .order('created_at', { ascending: true })
      ])
      setPost(postData)
      setComments(commentData ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: id, author_id: user.id, content: newComment.trim() })
      .select('*, profiles(full_name)')
      .single()
    if (!error) {
      setComments(prev => [...prev, data])
      setNewComment('')
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('comments').delete().eq('post_id', id)
    await supabase.from('posts').delete().eq('id', id)
    navigate(post.categories?.slug ? `/categorie/${post.categories.slug}` : '/', { replace: true })
  }

  const canDelete = isAdmin || post?.profiles?.id === user?.id

  // Zet nav wanneer post geladen is
  useEffect(() => {
    if (!post) return
    const backTo = post.categories?.slug ? `/categorie/${post.categories.slug}` : '/'
    const action = canDelete ? (
      <button
        onClick={() => setConfirmDelete(true)}
        style={{
          background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#f87171',
        }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    ) : null
    setNav({ title: post.title, backTo, action })
  }, [post, canDelete])

  useEffect(() => {
    return () => setNav({ title: null, backTo: null, action: null })
  }, [])

  const deleteBtn = canDelete ? (
    <button
      onClick={() => setConfirmDelete(true)}
      style={{
        background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '50%',
        width: '32px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#f87171',
      }}
    >
      <TrashIcon />
    </button>
  ) : null

  if (loading) return (
    <div className="px-4 pt-5 animate-pulse space-y-4">
      <div className="h-6 bg-surface-raised rounded-full w-3/4" />
      <div className="h-4 bg-surface-raised rounded-full w-full" />
      <div className="h-4 bg-surface-raised rounded-full w-5/6" />
    </div>
  )

  if (!post) return (
    <div className="px-4 py-8 text-center text-ink-muted text-sm">Bericht niet gevonden.</div>
  )

  return (
    <div>

      {/* Verwijder bevestiging */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 16px calc(env(safe-area-inset-bottom) + 16px)',
        }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111008', margin: '0 0 8px' }}>Bericht verwijderen?</h3>
            <p style={{ fontSize: '14px', color: '#7A6E60', margin: '0 0 20px', lineHeight: 1.5 }}>Dit kan niet ongedaan gemaakt worden. Alle reacties worden ook verwijderd.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E8E2D8', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#7A6E60' }}>
                Annuleren
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Verwijderen...' : 'Verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Post */}
        <article className="bg-white rounded-2xl overflow-hidden shadow-card border border-black/[0.04]">
          <div className="p-5">
            {post.subcategories && (
              <span className="text-[10px] text-copper-500 font-bold uppercase tracking-widest mb-2 block">
                {post.subcategories.name}
              </span>
            )}
            <h1 className="text-[20px] font-black text-ink leading-tight">{post.title}</h1>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-ink-faint font-medium">
              <span>{post.profiles?.full_name || 'Bestuur'}</span>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="mt-4">
              <MarkdownRenderer content={post.content || ''} />
            </div>
          </div>
        </article>

        {/* Reacties */}
        <section>
          <p className="text-[11px] font-semibold text-ink-faint uppercase tracking-widest mb-3">
            Reacties ({comments.length})
          </p>

          {comments.length === 0 && (
            <div className="bg-white rounded-2xl p-5 border border-black/[0.04] mb-3">
              <p className="text-sm text-ink-faint text-center">Wees de eerste om te reageren.</p>
            </div>
          )}

          <div className="space-y-2.5 mb-3">
            {comments.map(c => (
              <div key={c.id} className="bg-white rounded-2xl px-4 py-3.5 border border-black/[0.04] shadow-card">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-[13px] text-ink">{c.profiles?.full_name || 'Lid'}</span>
                  <span className="text-[11px] text-ink-faint">
                    {new Date(c.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-[13px] text-ink-soft leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>

          {user ? (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Reageer..."
                className="flex-1 bg-white border border-black/[0.08] rounded-full px-4 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-copper-500/30 focus:border-copper-500 transition-all"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-ink text-white px-4 py-2.5 rounded-full text-[13px] font-semibold disabled:opacity-30 transition-opacity shrink-0"
              >
                Stuur
              </button>
            </form>
          ) : (
            <Link to="/login" className="text-[13px] text-copper-500 font-semibold">
              Inloggen om te reageren →
            </Link>
          )}
        </section>
      </div>
    </div>
  )
}
