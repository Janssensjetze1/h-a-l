import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import MarkdownRenderer from '../MarkdownRenderer'

const TOOLBAR = [
  { label: 'B', title: 'Vet', wrap: ['**', '**'], block: false },
  { label: 'I', title: 'Cursief', wrap: ['*', '*'], block: false },
  { label: '# H1', title: 'Titel 1', prefix: '# ', block: true },
  { label: '## H2', title: 'Titel 2', prefix: '## ', block: true },
  { label: '— Lijn', title: 'Horizontale lijn', insert: '\n---\n', block: false },
  { label: '• Lijst', title: 'Opsomming', prefix: '- ', block: true },
  { label: '> Quote', title: 'Citaat', prefix: '> ', block: true },
  { label: '` Code', title: 'Inline code', wrap: ['`', '`'], block: false },
]

export default function MarkdownEditor({ value, onChange, placeholder = 'Schrijf je bericht in Markdown...' }) {
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  function insertAtCursor(before, after = '', replaceSelection = false) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = value.slice(start, end)
    let newText, newCursor

    if (replaceSelection) {
      newText = value.slice(0, start) + before + value.slice(end)
      newCursor = start + before.length
    } else if (sel) {
      newText = value.slice(0, start) + before + sel + after + value.slice(end)
      newCursor = start + before.length + sel.length + after.length
    } else {
      newText = value.slice(0, start) + before + after + value.slice(end)
      newCursor = start + before.length
    }

    onChange(newText)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(newCursor, newCursor)
    }, 0)
  }

  function applyFormat(item) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd

    if (item.insert) {
      insertAtCursor(item.insert, '', true)
      return
    }

    if (item.block && item.prefix) {
      // Apply prefix at line start
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const before = value.slice(0, lineStart)
      const lineContent = value.slice(lineStart)
      // Toggle: remove prefix if already present, else add
      if (lineContent.startsWith(item.prefix)) {
        const newText = before + lineContent.slice(item.prefix.length)
        onChange(newText)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(start - item.prefix.length, end - item.prefix.length)
        }, 0)
      } else {
        const newText = before + item.prefix + lineContent
        onChange(newText)
        setTimeout(() => {
          ta.focus()
          ta.setSelectionRange(start + item.prefix.length, end + item.prefix.length)
        }, 0)
      }
      return
    }

    if (item.wrap) {
      const [before, after] = item.wrap
      insertAtCursor(before, after)
    }
  }

  async function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('post-images').upload(fileName, file, { contentType: file.type })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName)
      insertAtCursor(`\n![${file.name}](${publicUrl})\n`, '', false)
    } catch (err) {
      alert('Fout bij uploaden: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  const toolbarBtn = (item, i) => (
    <button
      key={i}
      type="button"
      title={item.title}
      onClick={() => applyFormat(item)}
      style={{
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        color: 'rgba(255,255,255,0.65)',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'system-ui, sans-serif',
        transition: 'all 0.1s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
    >
      {item.label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
        padding: '8px 10px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {TOOLBAR.map((item, i) => toolbarBtn(item, i))}

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

        {/* Image upload */}
        <button
          type="button"
          title="Afbeelding invoegen"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '4px 10px',
            background: 'rgba(184,115,51,0.15)',
            border: '1px solid rgba(184,115,51,0.3)',
            borderRadius: '6px',
            color: '#b87333',
            fontSize: '12px', fontWeight: '600',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.5 : 1,
            transition: 'all 0.1s',
          }}
        >
          {uploading ? 'Uploaden...' : '🖼 Afbeelding'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); e.target.value = '' }}
        />

        {/* Divider + preview toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setPreview(false)}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              background: !preview ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: !preview ? 'white' : 'rgba(255,255,255,0.35)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Schrijven
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              background: preview ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: preview ? 'white' : 'rgba(255,255,255,0.35)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Voorbeeld
          </button>
        </div>
      </div>

      {/* Editor or Preview */}
      {!preview ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          placeholder={placeholder}
          rows={12}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.02)',
            border: 'none',
            padding: '14px 16px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '14px',
            lineHeight: 1.7,
            resize: 'vertical',
            outline: 'none',
            fontFamily: '"SF Mono", "Fira Code", Consolas, monospace',
            minHeight: '260px',
          }}
        />
      ) : (
        <div style={{
          background: 'white',
          minHeight: '260px',
          padding: '20px 24px',
          overflowY: 'auto',
        }}>
          {value.trim()
            ? <MarkdownRenderer content={value} />
            : <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '14px' }}>Nog niets om te tonen...</p>
          }
        </div>
      )}

      {/* Footer hint */}
      <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
        Markdown ondersteund · Sleep een afbeelding om te uploaden
      </div>
    </div>
  )
}
