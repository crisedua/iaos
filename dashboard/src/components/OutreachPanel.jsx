import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

const STATUS_CONFIG = {
    contacted: { label: 'Contacted', color: 'var(--blue)', badge: 'badge-blue' },
    replied: { label: 'Replied', color: 'var(--purple)', badge: 'badge-purple' },
    demo_booked: { label: 'Demo Booked', color: 'var(--gold)', badge: 'badge-gold' },
    demo_done: { label: 'Demo Done', color: 'var(--gold)', badge: 'badge-gold' },
    proposal: { label: 'Proposal Sent', color: 'var(--gold-light)', badge: 'badge-gold' },
    won: { label: 'Won 🏆', color: 'var(--green)', badge: 'badge-green' },
    lost: { label: 'Lost', color: 'var(--red)', badge: 'badge-red' },
    no_response: { label: 'No Response', color: 'var(--text-muted)', badge: 'badge-gray' },
}

const COLUMNS = [
    { key: 'contacted', label: 'Contacted', color: 'var(--blue)' },
    { key: 'demo', label: 'Demo', color: 'var(--gold)' },
    { key: 'proposal', label: 'Proposal', color: 'var(--purple)' },
    { key: 'closed', label: 'Closed', color: 'var(--green)' },
]

function getColumn(lead) {
    const s = (lead.status || '').toLowerCase()
    if (s.includes('won')) return 'closed'
    if (s.includes('proposal')) return 'proposal'
    if (s.includes('demo')) return 'demo'
    return 'contacted'
}

export default function OutreachPanel() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        fetch(`${API}/api/outreach-tracker`)
            .then(r => r.json())
            .then(d => {
                // The tracker is an array or has a contacts/leads key
                const arr = Array.isArray(d) ? d : (d.contacts || d.leads || Object.values(d))
                setLeads(Array.isArray(arr) ? arr : [])
                setLoading(false)
            })
            .catch(e => {
                setError(e.message)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loading"><div className="spinner" /><span>Loading outreach data…</span></div>
    if (error) return (
        <div className="empty-state">
            <h3>Could not load outreach tracker</h3>
            <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
    )

    const byColumn = {}
    COLUMNS.forEach(c => { byColumn[c.key] = [] })
    leads.forEach(lead => {
        const col = getColumn(lead)
        if (byColumn[col]) byColumn[col].push(lead)
    })

    const totalLeads = leads.length
    const replied = leads.filter(l => !['contacted', 'no_response'].includes((l.status || '').toLowerCase())).length
    const won = leads.filter(l => (l.status || '').toLowerCase().includes('won')).length

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Outreach Pipeline</h2>
                    <p className="text-sm text-muted mt-2">From outreach-tracker.json · {totalLeads} total contacts</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-blue">{totalLeads} Leads</span>
                    <span className="badge badge-gold">{replied} Active</span>
                    <span className="badge badge-green">{won} Won</span>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid-4 mb-4">
                {[
                    { label: 'Total Contacts', value: totalLeads, color: '' },
                    { label: 'Replied / Active', value: replied, color: 'gold' },
                    { label: 'Response Rate', value: totalLeads > 0 ? `${Math.round(replied / totalLeads * 100)}%` : '—', color: '' },
                    { label: 'Won', value: won, color: 'green' },
                ].map((m, i) => (
                    <div key={i} className="metric-card">
                        <div className="metric-label">{m.label}</div>
                        <div className={`metric-value ${m.color}`}>{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Kanban */}
            {totalLeads === 0 ? (
                <div className="empty-state">
                    <h3>No leads yet</h3>
                    <p>Run /outreach-leads or /extract-leads-gmap in Claude Code to populate your pipeline</p>
                </div>
            ) : (
                <div className="kanban">
                    {COLUMNS.map(col => {
                        const colLeads = byColumn[col.key] || []
                        return (
                            <div key={col.key} className="kanban-col">
                                <div className="kanban-col-header" style={{ color: col.color }}>
                                    {col.label}
                                    <span className="badge badge-gray">{colLeads.length}</span>
                                </div>
                                {colLeads.length === 0 ? (
                                    <div style={{ padding: '16px 14px', color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                                        None yet
                                    </div>
                                ) : (
                                    colLeads.map((lead, i) => (
                                        <div
                                            key={i}
                                            className="kanban-card"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelected(lead)}
                                        >
                                            <strong>{lead.name || lead.businessName || lead.company || 'Unknown'}</strong>
                                            {(lead.industry || lead.category) && (
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    {lead.industry || lead.category}
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                    📞 {lead.phone}
                                                </div>
                                            )}
                                            {lead.status && (
                                                <div style={{ marginTop: 4 }}>
                                                    <span className={`badge ${STATUS_CONFIG[lead.status?.toLowerCase()]?.badge || 'badge-gray'}`}
                                                        style={{ fontSize: 10 }}>
                                                        {STATUS_CONFIG[lead.status?.toLowerCase()]?.label || lead.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Lead detail modal */}
            {selected && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
                    <div className="modal" style={{ maxWidth: 500 }}>
                        <div className="modal-header">
                            <h2>{selected.name || selected.businessName || 'Lead Detail'}</h2>
                            <button className="btn btn-ghost" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Object.entries(selected).map(([k, v]) => v && (
                                    <div key={k} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                                        <span style={{ color: 'var(--gold)', fontWeight: 600, minWidth: 120, flexShrink: 0 }}>
                                            {k}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
