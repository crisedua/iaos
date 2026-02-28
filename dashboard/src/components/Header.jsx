import { useState, useEffect } from 'react'

export default function Header({ title }) {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 30000)
        return () => clearInterval(t)
    }, [])

    const fmt = t => t.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    const fmtDate = t => t.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })

    return (
        <header className="header">
            <div>
                <div className="header-title">{title}</div>
            </div>
            <div className="header-right">
                <div className="status-dot" />
                <span className="status-label">Live</span>
                <span style={{ color: 'var(--border-bright)', margin: '0 6px' }}>|</span>
                <span className="status-label">{fmtDate(time)} · {fmt(time)}</span>
            </div>
        </header>
    )
}
