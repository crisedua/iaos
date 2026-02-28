import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

function extractChallengeSection(md) {
    const lines = md.split('\n')
    const start = lines.findIndex(l => l.includes('Challenge Funnel'))
    if (start < 0) return null
    return lines.slice(start, start + 80).join('\n')
}

function parseTableRows(text) {
    const rows = []
    const lines = text.split('\n')
    let inTable = false
    for (const line of lines) {
        if (line.includes('|') && !line.match(/^\|[-\s|]+\|/)) {
            const cells = line.split('|').map(c => c.trim()).filter(Boolean)
            if (cells.length >= 2 && !cells[0].toLowerCase().includes('metric') && !cells[0].toLowerCase().includes('metric')) {
                rows.push(cells)
                inTable = true
            } else if (cells.length >= 2) {
                inTable = true
            }
        } else if (inTable && !line.includes('|')) {
            break
        }
    }
    return rows
}

function FunnelStage({ label, current, target, color, index, total }) {
    const width = Math.max(30, 100 - (index / total) * 40)
    const pct = current && target
        ? Math.min(100, Math.round((parseFloat(current) / parseFloat(target)) * 100))
        : 0
    const hasVal = current && current.trim() && current.trim() !== ''

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 4 }}>
            <div style={{
                width: `${width}%`,
                background: color,
                borderRadius: 6,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s',
            }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', opacity: 0.9 }}>{label}</div>
                    {target && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Target: {target}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                        {hasVal ? current : '—'}
                    </div>
                    {pct > 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{pct}%</div>}
                </div>
            </div>
            {index < total - 1 && (
                <div style={{ width: 2, height: 6, background: 'var(--border)' }} />
            )}
        </div>
    )
}

const STAGE_COLORS = [
    'rgba(201,162,39,0.7)', 'rgba(96,165,250,0.7)', 'rgba(167,139,250,0.7)',
    'rgba(74,222,128,0.7)', 'rgba(248,113,113,0.7)', 'rgba(201,162,39,0.5)'
]

export default function ChallengeFunnel() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API}/api/file?path=${encodeURIComponent('context/current-data.md')}`)
            .then(r => r.json())
            .then(d => {
                const section = extractChallengeSection(d.content || '')
                setData(section)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>

    // Parse the three sub-tables
    const promotionStages = [
        { label: 'WA Personal sent', rows: [0] },
        { label: 'Community posts', rows: [1] },
        { label: 'LinkedIn posts', rows: [2] },
        { label: 'LinkedIn DMs', rows: [3] },
        { label: 'Challenge signups', rows: [4] },
    ]

    const parseRows = (md, sectionTitle) => {
        if (!md) return []
        const lines = md.split('\n')
        const start = lines.findIndex(l => l.includes(sectionTitle))
        if (start < 0) return []
        const chunk = lines.slice(start, start + 15).join('\n')
        return parseTableRows(chunk)
    }

    const promoRows = parseRows(data, 'Promotion')
    const execRows = parseRows(data, 'Challenge Execution')
    const convRows = parseRows(data, 'Conversion')

    const allStages = [
        ...promoRows.slice(4, 5).map(r => ({ label: '🎯 Challenge Signups', current: r[1], target: r[2], section: 'Promotion' })),
        ...execRows.slice(-1).map(r => ({ label: '💡 Sprint Interest', current: r[1], target: r[2], section: 'Challenge' })),
        ...convRows.slice(0, 1).map(r => ({ label: '📞 Diagnostic Calls Booked', current: r[1], target: r[2], section: 'Conversion' })),
        ...convRows.slice(1, 2).map(r => ({ label: '✅ Calls Completed', current: r[1], target: r[2], section: 'Conversion' })),
        ...convRows.slice(2, 3).map(r => ({ label: '📋 Proposals Sent', current: r[1], target: r[2], section: 'Conversion' })),
        ...convRows.slice(3, 4).map(r => ({ label: '🏆 Sprints Closed', current: r[1], target: r[2], section: 'Conversion' })),
        ...convRows.slice(4, 5).map(r => ({ label: '💰 Revenue (USD)', current: r[1], target: r[2], section: 'Revenue' })),
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>AI CEO Challenge — March 2026</h2>
                    <p className="text-sm text-muted mt-2">Acquisition funnel · Revenue target: $4,500–$6,000 USD</p>
                </div>
                <span className="badge badge-gold">🚀 Active Sprint</span>
            </div>

            <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
                {/* Funnel visualization */}
                <div className="card">
                    <div className="card-title">🔻 Conversion Funnel</div>
                    {allStages.length > 0 ? (
                        <div style={{ padding: '4px 0' }}>
                            {allStages.map((s, i) => (
                                <FunnelStage
                                    key={i}
                                    label={s.label}
                                    current={s.current}
                                    target={s.target}
                                    color={STAGE_COLORS[i % STAGE_COLORS.length]}
                                    index={i}
                                    total={allStages.length}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <h3>No funnel data yet</h3>
                            <p>Update current-data.md to track progress</p>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div>
                    <div className="card mb-4">
                        <div className="card-title">📅 Timeline</div>
                        {[
                            { phase: 'Promotion', dates: 'Mar 1–9', desc: 'Personal WA (40) + Communities (3-5) + LinkedIn (5 posts)', color: 'var(--gold)' },
                            { phase: 'Challenge Runs', dates: 'Mar 10–13', desc: '4-day email challenge — daily tasks + replies', color: 'var(--blue)' },
                            { phase: 'Conversion', dates: 'Mar 14–31', desc: 'Diagnostic calls → proposals → close Sprint Director IA', color: 'var(--green)' },
                        ].map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                                <div style={{
                                    width: 3, borderRadius: 2, background: t.color,
                                    flexShrink: 0, minHeight: 52
                                }} />
                                <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {t.phase} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {t.dates}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{t.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-title">📣 Promotion Details</div>
                        {promoRows.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {promoRows.map((row, i) => {
                                    const labels = ['Personal WA messages', 'Community posts', 'LinkedIn posts', 'LinkedIn DMs', 'Challenge signups']
                                    const targets = ['40', '3-5 groups', '5', '10+', '40-50']
                                    const hasVal = row[1]?.trim()
                                    const pct = hasVal && !isNaN(parseFloat(row[1])) && targets[i]
                                        ? Math.min(100, Math.round(parseFloat(row[1]) / parseFloat(targets[i]) * 100))
                                        : 0
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between" style={{ marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{labels[i]}</span>
                                                <span style={{ fontSize: 12, color: hasVal ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                    {hasVal || '—'} / {targets[i]}
                                                </span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill green" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted">Update current-data.md with promotion progress</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
