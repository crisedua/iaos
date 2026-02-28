import { useState, useEffect } from 'react'
import { marked } from 'marked'

const API = 'http://localhost:3001'

const TAGS = {
    'ia-os': 'badge-gold',
    'outreach': 'badge-blue',
    'linkedin': 'badge-blue',
    'sprint': 'badge-purple',
    'challenge': 'badge-purple',
    'whatsapp': 'badge-green',
    'google': 'badge-blue',
    'sop': 'badge-gray',
    'setup': 'badge-gray',
}

function getTag(filename) {
    const f = filename.toLowerCase()
    for (const [key, cls] of Object.entries(TAGS)) {
        if (f.includes(key)) return { label: key, cls }
    }
    return { label: 'doc', cls: 'badge-gray' }
}

function DocModal({ file, onClose }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API}/api/file?path=${encodeURIComponent('reference/' + file)}`)
            .then(r => r.json())
            .then(d => { setContent(d.content || ''); setLoading(false) })
    }, [file])

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ width: 'min(95vw, 900px)', maxHeight: '90vh' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: 13 }}>📄 {file}</h2>
                    <button className="btn btn-ghost" onClick={onClose}>✕ Close</button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="loading"><div className="spinner" /></div>
                    ) : (
                        <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ReferenceLibrary() {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [search, setSearch] = useState('')
    const [previews, setPreviews] = useState({})

    useEffect(() => {
        fetch(`${API}/api/files?path=${encodeURIComponent('reference')}`)
            .then(r => r.json())
            .then(data => {
                const mdFiles = data.filter(f => !f.isDir && f.name.endsWith('.md'))
                setFiles(mdFiles)
                setLoading(false)
                // Load previews for each
                mdFiles.forEach(f => {
                    fetch(`${API}/api/file?path=${encodeURIComponent('reference/' + f.name)}`)
                        .then(r => r.json())
                        .then(d => {
                            const lines = (d.content || '').split('\n')
                                .filter(l => !l.startsWith('#') && l.trim())
                                .slice(0, 3).join(' ')
                            setPreviews(prev => ({ ...prev, [f.name]: lines.slice(0, 120) }))
                        })
                })
            })
            .catch(() => setLoading(false))
    }, [])

    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Reference Library</h2>
                    <p className="text-sm text-muted mt-2">{files.length} documents · Click to open</p>
                </div>
                <input
                    type="text"
                    placeholder="Search docs…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '7px 12px', color: 'var(--text-primary)',
                        fontSize: 13, width: 200, outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {filtered.map(f => {
                    const tag = getTag(f.name)
                    const kb = f.size ? `${(f.size / 1024).toFixed(1)}kb` : ''
                    return (
                        <div
                            key={f.name}
                            className="card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelected(f.name)}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = ''}
                        >
                            <div className="flex items-center justify-between mb-4" style={{ marginBottom: 8 }}>
                                <span className={`badge ${tag.cls}`}>{tag.label}</span>
                                <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{kb}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5, lineHeight: 1.3 }}>
                                {f.name.replace('.md', '').replace(/-/g, ' ')}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                {previews[f.name] || '…'}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--gold)', opacity: 0.7 }}>
                                Open →
                            </div>
                        </div>
                    )
                })}
            </div>

            {selected && <DocModal file={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
