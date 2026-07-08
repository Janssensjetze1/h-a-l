import { Link } from 'react-router-dom'

export default function VoorstellenCard({ lid }) {
  const initialen = (lid.naam ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Link to={`/lid/${lid.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article style={{
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        // Vaste 4:5 verhouding — altijd uniform
        paddingBottom: '120%',
        background: 'linear-gradient(145deg, #2a0308 0%, #130610 100%)',
      }}>
        {/* Foto */}
        {lid.image_url && (
          <img
            src={lid.image_url} alt={lid.naam}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Placeholder initialen als geen foto */}
        {!lid.image_url && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: '42px', fontWeight: '900',
              color: 'rgba(184,115,51,0.25)',
              letterSpacing: '-2px',
            }}>
              {initialen}
            </span>
          </div>
        )}

        {/* Donkere verloop onderaan */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '65%',
          background: 'linear-gradient(to top, rgba(6,2,10,0.92) 0%, rgba(6,2,10,0.4) 60%, transparent 100%)',
        }} />

        {/* Naam + contact onderaan */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 11px',
        }}>
          <p style={{
            color: 'white',
            fontSize: '13px', fontWeight: '700',
            margin: 0, lineHeight: 1.25,
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}>
            {lid.naam}
          </p>
          {lid.contact && (
            <p style={{
              color: '#c9893f',
              fontSize: '11px', fontWeight: '600',
              margin: '2px 0 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {lid.contact}
            </p>
          )}
        </div>

        {/* Vasgepixt badge */}
        {lid.is_pinned && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(184,115,51,0.85)',
            borderRadius: '6px', padding: '2px 6px',
          }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>★</span>
          </div>
        )}
      </article>
    </Link>
  )
}
