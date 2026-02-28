import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

const CATEGORY_META = {
    key_facts: { icon: '📌', color: 'var(--gold)', label: 'Key Facts' },
    preferences: { icon: '⚙️', color: '#0ea5e9', label: 'Preferences' },
    team_mappings: { icon: '👥', color: '#7c3aed', label: 'Team Mappings' },
    project_mappings: { icon: '🗂️', color: 'var(--green)', label: 'Project Mappings' },
    rules: { icon: '📏', color: '#f59e0b', label: 'Rules' },
    client_notes: { icon: '🤝', color: '#ec4899', label: 'Client Notes' },
}

const CATEGORIES = Object.keys(CATEGORY_META)

function MemoryRow({ entry, onSave, onDelete }) {
    const [editing, setEditing] = useState(false)
    const [val, setVal] = useState(entry.value)
    const [saving, setSaving] = useState(false)

    async function save() {
        setSaving(true)
        try {
            const res = await fetch(`${API}/api/core-memory/${entry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: val }),
            })
            if (res.ok) { onSave(entry.id, val); setEditing(false) }
        } catch (e) { console.error(e) }
        setSaving(false)
    }

    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)', width: 160, verticalAlign: 'top' }}>
                {entry.key}
            </td>
            <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                {editing ? (
                    <textarea
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        autoFocus
                        rows={2}
                        style={{
                            width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--gold)',
                            borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)',
                            fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif',
                        }}
                    />
                ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{entry.value}</div>
                )}
                {entry.notes && !editing && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{entry.notes}</div>
                )}
            </td>
            <td style={{ padding: '10px 12px', width: 110, textAlign: 'right', verticalAlign: 'top' }}>
                {editing ? (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => { setEditing(false); setVal(entry.value) }}>✕</button>
                        <button className="btn btn-gold" style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={save} disabled={saving}>
                            {saving ? '…' : '✓'}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => setEditing(true)}>✏️</button>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px', color: '#ef4444' }}
                            onClick={() => onDelete(entry.id)}>✕</button>
                    </div>
                )}
            </td>
        </tr>
    )
}

function AddRowModal({ category, onClose, onAdd }) {
    const [key, setKey] = useState('')
    const [value, setValue] = useState('')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)

    async function save() {
        if (!key || !value) return
        setSaving(true)
        try {
            const res = await fetch(`${API}/api/core-memory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, key, value, notes }),
            })
            if (res.ok) { const d = await res.json(); onAdd(d.entry); onClose() }
        } catch (e) { console.error(e) }
        setSaving(false)
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 460 }}>
                <div className="modal-header">
                    <h2>Add Memory Entry — {CATEGORY_META[category]?.label}</h2>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Key</label>
                        <input value={key} onChange={e => setKey(e.target.value)}
                            placeholder="e.g. preferred_timezone"
                            style={{
                                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                            }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Value</label>
                        <textarea value={value} onChange={e => setValue(e.target.value)}
                            placeholder="The value to store"
                            rows={3}
                            style={{
                                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)',
                                fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif',
                            }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
                        <input value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Context or explanation"
                            style={{
                                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                            }} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-gold" onClick={save} disabled={saving || !key || !value}>
                        {saving ? 'Saving…' : 'Save Entry'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function MemoryPanel() {
    const [memory, setMemory] = useState({})
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('key_facts')
    const [addModal, setAddModal] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => { loadMemory() }, [])

    async function loadMemory() {
        setLoading(true)
        try {
            const res = await fetch(`${API}/api/core-memory`)
            if (res.ok) {
                const d = await res.json()
                // Group by category
                const grouped = {}
                for (const cat of CATEGORIES) grouped[cat] = []
                for (const entry of (d.entries || [])) {
                    if (grouped[entry.category]) grouped[entry.category].push(entry)
                }
                setMemory(grouped)
            }
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    function handleSave(id, newVal) {
        setMemory(prev => {
            const updated = { ...prev }
            for (const cat of CATEGORIES) {
                updated[cat] = updated[cat].map(e => e.id === id ? { ...e, value: newVal } : e)
            }
            return updated
        })
    }

    async function handleDelete(id) {
        try {
            await fetch(`${API}/api/core-memory/${id}`, { method: 'DELETE' })
            setMemory(prev => {
                const updated = { ...prev }
                for (const cat of CATEGORIES) {
                    updated[cat] = updated[cat].filter(e => e.id !== id)
                }
                return updated
            })
        } catch (e) { console.error(e) }
    }

    function handleAdd(entry) {
        setMemory(prev => ({
            ...prev,
            [entry.category]: [...(prev[entry.category] || []), entry]
        }))
    }

    const meta = CATEGORY_META[activeCategory]
    const entries = (memory[activeCategory] || [])
        .filter(e => !search || e.key?.toLowerCase().includes(search.toLowerCase())
            || e.value?.toLowerCase().includes(search.toLowerCase()))

    const totalCount = CATEGORIES.reduce((sum, c) => sum + (memory[c]?.length || 0), 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Core Memory</h2>
                    <p className="text-sm text-muted mt-2">
                        {totalCount} entries · Always loaded into Gravity Claw's context
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={loadMemory}>🔄</button>
                    <button className="btn btn-gold" style={{ fontSize: 12 }} onClick={() => setAddModal(true)}>
                        + Add Entry
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
                {/* Category sidebar */}
                <div style={{
                    width: 160, flexShrink: 0,
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2,
                    alignSelf: 'flex-start',
                }}>
                    {CATEGORIES.map(cat => {
                        const m = CATEGORY_META[cat]
                        const count = memory[cat]?.length || 0
                        const isActive = activeCategory === cat
                        return (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                style={{
                                    background: isActive ? 'var(--bg-hover)' : 'transparent',
                                    border: isActive ? `1px solid ${m.color}40` : '1px solid transparent',
                                    borderRadius: 6, padding: '8px 10px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                                    transition: 'all 0.15s',
                                }}>
                                <span style={{ fontSize: 14 }}>{m.icon}</span>
                                <span style={{
                                    fontSize: 11.5, fontWeight: isActive ? 600 : 400,
                                    color: isActive ? m.color : 'var(--text-muted)', flex: 1,
                                }}>{m.label}</span>
                                {count > 0 && (
                                    <span style={{
                                        fontSize: 10, background: isActive ? m.color + '30' : 'var(--bg-card)',
                                        color: isActive ? m.color : 'var(--text-muted)',
                                        border: `1px solid ${isActive ? m.color + '40' : 'var(--border)'}`,
                                        borderRadius: 8, padding: '0 5px',
                                    }}>{count}</span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {/* Search + category header */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '6px 12px',
                        }}>
                            <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
                            <input
                                placeholder="Search keys or values…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    flex: 1, background: 'transparent', border: 'none',
                                    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                                }}
                            />
                        </div>
                        <div style={{
                            fontSize: 11, color: meta.color,
                            background: meta.color + '15', border: `1px solid ${meta.color}40`,
                            borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <span>{meta.icon}</span> {meta.label}
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{
                        flex: 1, overflowY: 'auto',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 10, overflow: 'hidden',
                    }}>
                        {loading ? (
                            <div className="empty-state" style={{ padding: '40px' }}>
                                <div className="loading-dots"><span /><span /><span /></div>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="empty-state" style={{ padding: '48px 20px' }}>
                                <div style={{ fontSize: 28, marginBottom: 10 }}>{meta.icon}</div>
                                <h3 style={{ marginBottom: 6 }}>No {meta.label} yet</h3>
                                <p style={{ fontSize: 12 }}>
                                    {totalCount === 0
                                        ? 'Connect Supabase to store memory, or click Add Entry.'
                                        : 'Click + Add Entry to add one.'}
                                </p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, width: 160 }}>Key</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Value</th>
                                        <th style={{ padding: '8px 12px', width: 110 }} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(entry => (
                                        <MemoryRow key={entry.id} entry={entry} onSave={handleSave} onDelete={handleDelete} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {addModal && (
                <AddRowModal
                    category={activeCategory}
                    onClose={() => setAddModal(false)}
                    onAdd={handleAdd}
                />
            )}
        </div>
    )
}
