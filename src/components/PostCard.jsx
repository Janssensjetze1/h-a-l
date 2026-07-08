import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function PostCard({ post, last = false }) {
  const date = new Date(post.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })

  return (
    <Link to={`/post/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          padding: '13px 16px 13px 14px',
          borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.055)',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          background: 'transparent',
          transition: 'background 0.12s',
        }}
        onTouchStart={e => e.currentTarget.style.background = 'rgba(0,0,0,0.035)'}
        onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Kleurstreep links */}
        <div style={{
          width: '3px', flexShrink: 0, alignSelf: 'stretch', minHeight: '36px',
          borderRadius: '2px',
          background: 'linear-gradient(180deg, #8B0000 0%, rgba(139,0,0,0.15) 100%)',
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {post.subcategories && (
            <span style={{
              fontSize: '10px', color: '#b87333', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              display: 'block', marginBottom: '2px',
            }}>
              {post.subcategories.name}
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
            {post.is_pinned && (
              <span style={{ color: '#b87333', flexShrink: 0, marginTop: '1px' }}>
                <Icon name="pin" />
              </span>
            )}
            <h3 style={{
              fontSize: '14px', fontWeight: '700', color: '#100d0a',
              margin: 0, lineHeight: 1.35,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.title}
            </h3>
          </div>

          <p style={{
            fontSize: '12.5px', color: '#8a7f74',
            margin: '3px 0 0', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {stripMarkdown(post.content)}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#bbb4ab', fontWeight: '500' }}>
              {post.profiles?.full_name || 'Bestuur'}
            </span>
            <span style={{ fontSize: '10px', color: '#d4c9bc' }}>·</span>
            <span style={{ fontSize: '11px', color: '#bbb4ab' }}>{date}</span>
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: 'rgba(0,0,0,0.18)', flexShrink: 0, marginTop: '3px', alignSelf: 'flex-start' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function stripMarkdown(text) {
  return (text ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/^[-*>]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
}
