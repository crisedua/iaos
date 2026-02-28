import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

function parseMarkdownTables(md) {
    const tables = []
    const lines = md.split('\n')
    let i = 0
    while (i < lines.length) {
        if (lines[i]?.includes('|') && lines[i + 1]?.match(/^\|[-\s|]+\|/)) {
            const headers = lines[i].split('|').map(c => c.trim()).filter(Boolean)
            i += 2
            const rows = []
            while (i < lines.length && lines[i]?.includes('|')) {
                const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean)
                if (cells.length) rows.push(cells)
                i++
            }
            tables.push({ headers, rows })
        } else {
            i++
        }
    }
    return tables
}

function MetricCard({ label, value, target, color }) {
    const val = value?.trim() || ''
    const hasValue = val.length > 0 && val !== ' '
    const pct = target && hasValue && !isNaN(parseFloat(val)) && !isNaN(parseFloat(target))
        ? Math.min(100, Math.round((parseFloat(val) / parseFloat(target)) * 100))
        : null

    return (
        <div className="metric-card">
            <div className="metric-label">{label}</div>
            <div className={`metric-value ${hasValue ? (color || '') : 'text-muted'}`}
                style={{ fontSize: hasValue ? 22 : 16 }}>
                {hasValue ? val : '—'}
            </div>
            {target && <div className="metric-target">Target: {target}</div>}
            {pct !== null && (
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
            )}
        </div>
    )
}

export default function MetricsPanel() {
    const [tables, setTables] = useState([])
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API}/api/file?path=${encodeURIComponent('context/current-data.md')}`)
            .then(r => r.json())
            .then(d => {
                setTables(parseMarkdownTables(d.content || ''))
                // Extract h3 section names
                const lines = (d.content || '').split('\n')
                const secs = lines
                    .filter(l => l.startsWith('### '))
                    .map(l => l.replace('### ', '').trim())
                setSections(secs)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading"><div className="spinner" /><span>Loading metrics…</span></div>

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Pipeline & Metrics</h2>
                    <p className="text-sm text-muted mt-2">Parsed live from current-data.md</p>
                </div>
                <a href="/context" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                    ✏️ Edit in Context OS
                </a>
            </div>

            {tables.length === 0 ? (
                <div className="empty-state">
                    <h3>No metrics tables found</h3>
                    <p>Open Context OS → Current Data → Edit to add your metrics</p>
                </div>
            ) : (
                tables.map((table, ti) => {
                    const sectionLabel = sections[ti] || `Table ${ti + 1}`
                    // Check if table has Metric/Value/Target columns
                    const metricIdx = table.headers.findIndex(h => h.toLowerCase().includes('metric'))
                    const valueIdx = table.headers.findIndex(h => h.toLowerCase().includes('current') || h.toLowerCase().includes('value'))
                    const targetIdx = table.headers.findIndex(h => h.toLowerCase().includes('target'))

                    return (
                        <div key={ti} className="mb-4">
                            <div className="card-title" style={{ marginBottom: 12 }}>📊 {sectionLabel}</div>
                            {metricIdx >= 0 && valueIdx >= 0 ? (
                                <div className="grid-4">
                                    {table.rows.map((row, ri) => (
                                        <MetricCard
                                            key={ri}
                                            label={row[metricIdx] || '—'}
                                            value={row[valueIdx]}
                                            target={targetIdx >= 0 ? row[targetIdx] : null}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // Generic table render
                                <div className="card" style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {table.headers.map((h, i) => (
                                                    <th key={i} style={{
                                                        textAlign: 'left', padding: '8px 10px',
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--bg-hover)',
                                                        color: 'var(--gold)', fontSize: 11,
                                                        textTransform: 'uppercase', letterSpacing: '0.04em'
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {table.rows.map((row, ri) => (
                                                <tr key={ri}>
                                                    {row.map((cell, ci) => (
                                                        <td key={ci} style={{
                                                            padding: '7px 10px',
                                                            border: '1px solid var(--border)',
                                                            color: cell?.trim() ? 'var(--text-primary)' : 'var(--text-muted)',
                                                            background: ri % 2 === 0 ? '' : 'rgba(255,255,255,0.02)'
                                                        }}>
                                                            {cell?.trim() || '—'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )
                })
            )}
        </div>
    )
}
