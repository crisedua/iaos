import { useState, useEffect } from 'react'
import { marked } from 'marked'

const API = 'http://localhost:3001'

const CONTEXT_FILES = [
    { key: 'personal', path: 'context/personal-info.md', label: 'Who You Are', icon: '👤', color: 'var(--purple)' },
    { key: 'business', path: 'context/business-info.md', label: 'Business', icon: '🏢', color: 'var(--blue)' },
    { key: 'strategy', path: 'context/strategy.md', label: 'Strategy', icon: '🎯', color: 'var(--gold)' },
    { key: 'data', path: 'context/current-data.md', label: 'Current Data', icon: '📈', color: 'var(--green)' },
]

function MarkdownModal({ file, onClose }) {
    const [content, setContent] = useState('')
    const [editing, setEditing] = useState(false)
    const [editVal, setEditVal] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch(`${API}/api/file?path=${encodeURIComponent(file.path)}`)
            .then(r => r.json())
            .then(d => { setContent(d.content); setEditVal(d.content) })
    }, [file.path])

    async function save() {
        setSaving(true)
        await fetch(`${API}/api/file?path=${encodeURIComponent(file.path)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: editVal })
        })
        setContent(editVal)
        setEditing(false)
        setSaving(false)
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2>{file.icon} {file.label}</h2>
                    <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={() => setEditing(e => !e)}>
                            {editing ? '👁 Preview' : '✏️ Edit'}
                        </button>
                        <button className="btn btn-ghost" onClick={onClose}>✕</button>
                    </div>
                </div>
                <div className="modal-body">
                    {editing ? (
                        <textarea
                            className="code-editor"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                        />
                    ) : (
                        <div
                            className="md-content"
                            dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
                        />
                    )}
                </div>
                {editing && (
                    <div className="modal-footer">
                        <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                        <button className="btn btn-gold" onClick={save} disabled={saving}>
                            {saving ? 'Saving…' : '💾 Save'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function ContextCard({ file }) {
    const [preview, setPreview] = useState('')
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        fetch(`${API}/api/file?path=${encodeURIComponent(file.path)}`)
            .then(r => r.json())
            .then(d => {
                // Extract a short preview (first 400 chars of non-header content)
                const lines = (d.content || '').split('\n')
                    .filter(l => !l.startsWith('#') && l.trim().length > 0)
                setPreview(lines.slice(0, 6).join('\n'))
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [file.path])

    return (
        <>
            <div
                className="card"
                style={{ cursor: 'pointer', border: `1px solid var(--border)`, transition: 'border-color 0.2s' }}
                onClick={() => setOpen(true)}
                onMouseEnter={e => e.currentTarget.style.borderColor = file.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}
            >
                <div className="card-title" style={{ color: file.color }}>
                    {file.icon} {file.label}
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                        Click to open ↗
                    </span>
                </div>
                {loading ? (
                    <div className="loading" style={{ padding: 20 }}><div className="spinner" /></div>
                ) : (
                    <div className="md-content text-sm" style={{ opacity: 0.8, maxHeight: 120, overflow: 'hidden' }}>
                        <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', margin: 0, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            {preview || '(empty)'}
                        </pre>
                        <div style={{
                            position: 'relative', height: 32,
                            background: 'linear-gradient(transparent, var(--bg-card))',
                            marginTop: -32
                        }} />
                    </div>
                )}
            </div>
            {open && <MarkdownModal file={file} onClose={() => setOpen(false)} />}
        </>
    )
}

export default function ContextOS() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Context OS</h2>
                    <p className="text-sm text-muted mt-2">Living documentation — the foundation Claude reads on every /prime</p>
                </div>
                <span className="badge badge-green">● Live</span>
            </div>

            <div className="grid-2" style={{ gap: 16 }}>
                {CONTEXT_FILES.map(f => <ContextCard key={f.key} file={f} />)}
            </div>

            <div className="card mt-4" style={{ borderColor: 'var(--gold-dim)', background: 'var(--gold-glow)' }}>
                <div className="card-title">🖥️ Session Commands</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                        { cmd: '/prime', desc: 'Load full context' },
                        { cmd: '/ia-os-session review personal', desc: 'Weekly review' },
                        { cmd: '/ia-os-session sprint personal', desc: 'Focused work session' },
                        { cmd: '/outreach-leads', desc: 'Daily outreach queue' },
                        { cmd: '/extract-leads-gmap', desc: 'Bulk lead extraction' },
                        { cmd: '/weekly-leads', desc: 'Weekly planning' },
                    ].map(({ cmd, desc }) => (
                        <div key={cmd} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '7px 12px', cursor: 'default'
                        }}>
                            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold-light)' }}>{cmd}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted mt-4" style={{ fontStyle: 'italic' }}>
                    Run these commands in your Claude Code terminal session.
                </p>
            </div>
        </div>
    )
}
