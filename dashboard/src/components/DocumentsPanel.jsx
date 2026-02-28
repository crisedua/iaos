import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

const TYPE_ICONS = {
    invoice: '🧾', proposal: '📝', sop: '📋', report: '📊', other: '📄'
}

const TYPE_COLORS = {
    invoice: 'var(--green)', proposal: 'var(--gold)',
    sop: '#7c3aed', report: '#0ea5e9', other: 'var(--text-muted)'
}

function DocCard({ doc }) {
    const icon = TYPE_ICONS[doc.type] || '📄'
    const color = TYPE_COLORS[doc.type] || 'var(--text-muted)'

    async function download() {
        if (doc.local_path) {
            const res = await fetch(`${API}/api/file?path=${encodeURIComponent(doc.local_path.replace('c:\\ClaudeCode\\', ''))}`)
            const d = await res.json()
            const blob = new Blob([d.content], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = doc.name; a.click()
        } else if (doc.storage_path) {
            alert('Open Supabase Storage to download: ' + doc.storage_path)
        }
    }

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${color}`,
            borderRadius: 8, padding: '12px 14px', marginBottom: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span style={{
                            background: 'var(--bg-surface)', border: `1px solid ${color}`,
                            color: color, borderRadius: 4, padding: '1px 6px', fontSize: 10,
                        }}>{doc.type}</span>
                        {doc.client && <span>Client: {doc.client}</span>}
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <button
                className="btn btn-ghost"
                style={{ fontSize: 12, flexShrink: 0 }}
                onClick={download}
            >
                ⬇ Download
            </button>
        </div>
    )
}

export default function DocumentsPanel() {
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => { loadDocs() }, [])

    async function loadDocs() {
        setLoading(true)
        try {
            const res = await fetch(`${API}/api/documents`)
            if (res.ok) {
                const d = await res.json()
                setDocs(d.documents || [])
            }
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const types = ['all', 'invoice', 'proposal', 'sop', 'report', 'other']
    const filtered = docs
        .filter(d => filterType === 'all' || d.type === filterType)
        .filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase())
            || d.client?.toLowerCase().includes(search.toLowerCase()))

    const stats = types.slice(1).map(t => ({
        type: t,
        count: docs.filter(d => d.type === t).length,
        icon: TYPE_ICONS[t],
        color: TYPE_COLORS[t],
    }))

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Documents</h2>
                    <p className="text-sm text-muted mt-2">Generated PDFs, proposals, invoices — from Gravity Claw</p>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={loadDocs}>🔄 Refresh</button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {stats.map(s => (
                    <div key={s.type} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 16px',
                        display: 'flex', alignItems: 'center', gap: 8, minWidth: 100,
                    }}>
                        <span style={{ fontSize: 18 }}>{s.icon}</span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.type}s</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    placeholder="Search by name or client…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: 200, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                    {types.map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className="btn btn-ghost"
                            style={{
                                fontSize: 11, padding: '4px 10px',
                                background: filterType === t ? 'var(--gold-dim)' : undefined,
                                borderColor: filterType === t ? 'var(--gold)' : undefined,
                            }}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div className="empty-state"><div className="loading-dots"><span /><span /><span /></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state" style={{ padding: '48px 20px' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
                        <h3>{docs.length === 0 ? 'No documents yet' : 'No matches'}</h3>
                        <p style={{ fontSize: 12 }}>
                            {docs.length === 0
                                ? 'Ask Gravity Claw to generate a document. It will appear here once saved.'
                                : 'Try adjusting your search or filter.'}
                        </p>
                        {docs.length === 0 && (
                            <div style={{
                                marginTop: 16, background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                                borderRadius: 8, padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)',
                                textAlign: 'left', maxWidth: 360,
                            }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Also needs:</strong><br />
                                SUPABASE_URL + SUPABASE_ANON_KEY in .env
                            </div>
                        )}
                    </div>
                ) : (
                    filtered.map((doc, i) => <DocCard key={i} doc={doc} />)
                )}
            </div>
        </div>
    )
}
