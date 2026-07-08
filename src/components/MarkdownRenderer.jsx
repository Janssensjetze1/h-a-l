import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ content, className = '' }) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: '1.5em', fontWeight: 800, margin: '1em 0 0.5em', color: '#111008' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.25em', fontWeight: 700, margin: '1em 0 0.5em', color: '#111008' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1.1em', fontWeight: 600, margin: '0.8em 0 0.4em', color: '#111008' }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0.6em 0', lineHeight: 1.7, color: '#3D3526' }}>{children}</p>,
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#111008' }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          ul: ({ children }) => <ul style={{ margin: '0.6em 0', paddingLeft: '1.4em', listStyleType: 'disc', color: '#3D3526' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '0.6em 0', paddingLeft: '1.4em', color: '#3D3526' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '0.2em 0', lineHeight: 1.6 }}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid #4a0008', paddingLeft: '1em', margin: '0.8em 0', color: '#7A6E60', fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          code: ({ inline, children }) => inline
            ? <code style={{ background: '#F0EDE8', borderRadius: '4px', padding: '1px 6px', fontSize: '0.875em', color: '#4a0008', fontFamily: 'monospace' }}>{children}</code>
            : <pre style={{ background: '#F0EDE8', borderRadius: '10px', padding: '12px 16px', overflow: 'auto', margin: '0.8em 0' }}><code style={{ fontSize: '0.875em', color: '#3D3526', fontFamily: 'monospace' }}>{children}</code></pre>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#b87333', textDecoration: 'underline' }}>{children}</a>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid #E8E2D8', margin: '1.2em 0' }} />,
          img: ({ src, alt }) => (
            <img
              src={src} alt={alt}
              style={{ maxWidth: '100%', borderRadius: '12px', margin: '0.8em 0', display: 'block' }}
            />
          ),
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '0.8em 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th style={{ padding: '8px 12px', background: '#F0EDE8', fontWeight: 600, textAlign: 'left', borderBottom: '2px solid #D9CBB8', color: '#111008' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid #EDE5D8', color: '#3D3526' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
