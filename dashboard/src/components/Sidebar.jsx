const NAV = [
    {
        section: 'Core',
        items: [
            { id: 'chat', label: 'Claude Chat', icon: '💬' },
            { id: 'context', label: 'Context OS', icon: '🧠' },
            { id: 'metrics', label: 'Pipeline & Metrics', icon: '📊' },
            { id: 'challenge', label: 'Challenge Funnel', icon: '🚀' },
        ]
    },
    {
        section: 'Agent',
        items: [
            { id: 'freedcamp', label: 'Freedcamp Tasks', icon: '✅' },
            { id: 'reminders', label: 'Reminders', icon: '⏰' },
            { id: 'documents', label: 'Documents', icon: '📄' },
            { id: 'memory', label: 'Core Memory', icon: '🧬' },
        ]
    },
    {
        section: 'Operations',
        items: [
            { id: 'outreach', label: 'Outreach', icon: '📨' },
            { id: 'reference', label: 'Reference Lib', icon: '📚' },
            { id: 'outputs', label: 'Outputs', icon: '📁' },
        ]
    },
    {
        section: 'System',
        items: [
            { id: 'scripts', label: 'Scripts', icon: '⚡' },
            { id: 'mcp', label: 'MCP Services', icon: '🔌' },
        ]
    }
]

export default function Sidebar({ active, onNavigate }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>Mission Control</h1>
                <span>Gravity Claw ⚡</span>
            </div>
            <nav className="sidebar-nav">
                {NAV.map(group => (
                    <div key={group.section}>
                        <div className="nav-section">{group.section}</div>
                        {group.items.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${active === item.id ? 'active' : ''}`}
                                onClick={() => onNavigate(item.id)}
                            >
                                <span style={{ fontSize: 15 }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                ))}
            </nav>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
                <div>Workspace: C:\ClaudeCode</div>
                <div style={{ marginTop: 4 }}>Agent: Gravity Claw</div>
                <div style={{ marginTop: 2 }}>API: localhost:3001</div>
            </div>
        </aside>
    )
}
