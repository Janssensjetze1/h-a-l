import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [form, setForm] = useState({
    title: '', content: '', category_id: '', subcategory_id: '',
    is_pinned: false, send_push: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: subcats }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('subcategories').select('*')
      ])
      setCategories(cats ?? [])
      setSubcategories(subcats ?? [])
    }
    load()
  }, [])

  const filteredSubcats = subcategories.filter(s => s.category_id === Number(form.category_id))

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'category_id' ? { subcategory_id: '' } : {})
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: insertError } = await supabase.from('posts').insert({
      title: form.title,
      content: form.content,
      category_id: form.category_id ? Number(form.category_id) : null,
      subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
      author_id: user.id,
      is_pinned: form.is_pinned,
      push_sent: form.send_push,
    })
    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      setForm({ title: '', content: '', category_id: '', subcategory_id: '', is_pinned: false, send_push: false })
      setTimeout(() => setSuccess(false), 3000)
    }
    setSubmitting(false)
  }

  const inputClass = "w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-copper-500/30 focus:border-copper-500 transition-all"
  const labelClass = "block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5"

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="mb-6">
        <p className="text-[11px] font-bold text-copper-500 uppercase tracking-widest mb-1">Beheer</p>
        <h1 className="text-[22px] font-black text-ink">Nieuw bericht</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Titel</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className={inputClass} placeholder="Titel van het bericht" />
        </div>

        <div>
          <label className={labelClass}>Categorie</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} required className={inputClass}>
            <option value="">Kies een categorie...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {filteredSubcats.length > 0 && (
          <div>
            <label className={labelClass}>Subcategorie (optioneel)</label>
            <select name="subcategory_id" value={form.subcategory_id} onChange={handleChange} className={inputClass}>
              <option value="">Geen subcategorie</option>
              {filteredSubcats.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass}>Inhoud</label>
          <textarea name="content" value={form.content} onChange={handleChange} required
            rows={8} className={`${inputClass} resize-none`}
            placeholder="Schrijf hier de inhoud..." />
        </div>

        {/* Toggle opties */}
        <div className="bg-white border border-black/[0.06] rounded-xl divide-y divide-black/[0.05]">
          <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span className="text-[14px] font-medium text-ink">Vastprikken</span>
            <input type="checkbox" name="is_pinned" checked={form.is_pinned} onChange={handleChange}
              className="w-4 h-4 accent-copper-500" />
          </label>
          <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer">
            <span className="text-[14px] font-medium text-ink">Push notificatie</span>
            <input type="checkbox" name="send_push" checked={form.send_push} onChange={handleChange}
              className="w-4 h-4 accent-copper-500" />
          </label>
        </div>

        {error && (
          <p className="text-red-500 text-[13px] bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-[13px] bg-green-50 border border-green-100 px-4 py-3 rounded-xl">✓ Bericht geplaatst!</p>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14px] disabled:opacity-40 transition-opacity">
          {submitting ? '...' : 'Bericht plaatsen'}
        </button>
      </form>
    </div>
  )
}
