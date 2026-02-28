import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

const MCP_ICONS = {
    apify: { icon: '🗺️', label: 'Apify', desc: 'Google Maps lead extraction', color: 'var(--gold-dim)' },
    ticktick: { icon: '✅', label: 'TickTick', desc: 'Task management & to-dos', color: 'var(--green-dim)' },
    google: { icon: '🔵', label: 'Google', desc: 'Gmail + Drive integration', color: 'var(--blue-dim)' },
    gmail: { icon: '📧', label: 'Gmail', desc: 'Email send/receive', color: 'var(--blue-dim)' },
    gdrive: { icon: '📁', label: 'Google Drive', desc: 'File storage & access', color: 'var(--blue-dim)' },
    telegram: { icon: '✈️', label: 'Telegram', desc: 'Bot notifications', color: 'var(--purple-dim)' },
}

function getMeta(name) {
    const key = name.toLowerCase()
    for (const [k, v] of Object.entries(MCP_ICONS)) {
        if (key.includes(k)) return v
    }
    return { icon: '🔌', label: name, desc: 'MCP Service', color: 'rgba(255,255,255,0.05)' }
}

export default function MCPStatus() {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${API}/api/mcp-config`)
            .then(r => r.json())
            .then(d => { setConfig(d); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) })
    }, [])

    if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>
    if (error) return (
        <div className="empty-state">
            <h3>MCP config not found</h3>
            <p>{error}</p>
        </div>
    )

    const servers = config?.mcpServers || {}
    const serverList = Object.entries(servers)

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>MCP Services</h2>
                    <p className="text-sm text-muted mt-2">Connected tools and integrations via .mcp.json · {serverList.length} configured</p>
                </div>
                <span className="badge badge-green">● {serverList.length} Connected</span>
            </div>

            <div className="mcp-grid mb-4">
                {serverList.map(([name, cfg]) => {
                    const meta = getMeta(name)
                    return (
                        <div key={name} className="mcp-card">
                            <div className="mcp-icon" style={{ background: meta.color, fontSize: 20 }}>{meta.icon}</div>
                            <div className="mcp-info">
                                <h3>{meta.label}</h3>
                                <p>{meta.desc}</p>
                                <div className="badge badge-green" style={{ fontSize: 10, marginTop: 4 }}>● Active</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="card">
                <div className="card-title">⚙️ Raw Configuration</div>
                {serverList.map(([name, cfg]) => (
                    <div key={name} style={{
                        marginBottom: 14, padding: '12px 14px',
                        background: 'var(--bg-surface)', borderRadius: 8,
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold)', marginBottom: 6 }}>{name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Command: </span>
                            <code style={{ background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
                                {cfg.command} {(cfg.args || []).join(' ')}
                            </code>
                        </div>
                        {cfg.env && (
                            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Env vars: </span>
                                {Object.keys(cfg.env).join(', ')}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="card mt-4" style={{ borderColor: 'var(--gold-dim)', background: 'var(--gold-glow)' }}>
                <div className="card-title">📖 How MCP Works</div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    MCP (Model Context Protocol) servers extend Claude Code with external tools. When you run <code>/prime</code> or
                    any command in Claude Code, these servers are available as tools Claude can call directly —
                    searching Google Maps, reading your TickTick tasks, sending Gmail, or accessing Google Drive files.
                    They are configured in <code>.mcp.json</code> at the root of this workspace.
                </p>
            </div>
        </div>
    )
}
