import { useState, useEffect, useRef } from 'react'

const API = 'http://localhost:3001'

const SCRIPT_META = {
    'prepare-outreach.js': {
        icon: '🎯',
        label: 'Prepare Outreach',
        desc: 'Score and select leads, generate WhatsApp/SMS/email messages for today\'s queue.',
        badge: 'badge-gold',
        args: '--channel whatsapp',
        safe: true,
    },
    'send-whatsapp.js': {
        icon: '💬',
        label: 'Send WhatsApp',
        desc: 'Send prepared messages via Twilio WhatsApp. Requires TWILIO env vars.',
        badge: 'badge-green',
        args: '',
        safe: false,
    },
    'send-sms.js': {
        icon: '📱',
        label: 'Send SMS',
        desc: 'Send via Twilio SMS. Ban-safe alternative to WhatsApp.',
        badge: 'badge-green',
        args: '',
        safe: false,
    },
    'find-emails.js': {
        icon: '🔍',
        label: 'Find Emails',
        desc: 'Crawl business websites to discover contact email addresses.',
        badge: 'badge-blue',
        args: '',
        safe: true,
    },
    'send-email.js': {
        icon: '📧',
        label: 'Send Email',
        desc: 'Send via Gmail SMTP. Run find-emails first.',
        badge: 'badge-blue',
        args: '',
        safe: false,
    },
    'telegram-bot.js': {
        icon: '🤖',
        label: 'Telegram Bot',
        desc: 'Start the Telegram bot for workspace notifications.',
        badge: 'badge-purple',
        args: '',
        safe: true,
    },
    'run-apify-jobs.sh': {
        icon: '🗺️',
        label: 'Google Maps Extract',
        desc: 'Bulk-extract leads from Google Maps via Apify. Requires APIFY_TOKEN.',
        badge: 'badge-gold',
        args: '',
        safe: false,
    },
}

function ScriptCard({ name, meta, onRun }) {
    const m = meta || { icon: '⚡', label: name, desc: '', badge: 'badge-gray', safe: true }

    return (
        <div className="card">
            <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{m.label}</div>
                    <span className={`badge ${m.badge}`} style={{ fontSize: 10 }}>{name}</span>
                </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>{m.desc}</p>
            <div className="flex gap-2">
                <button
                    className={m.safe ? 'btn btn-gold' : 'btn btn-danger'}
                    style={{ fontSize: 12 }}
                    onClick={() => onRun(name)}
                >
                    {m.safe ? '▶ Run' : '⚠ Run (sends data)'}
                </button>
                {!m.safe && (
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', alignSelf: 'center' }}>
                        Outbound action
                    </span>
                )}
            </div>
        </div>
    )
}

export default function ScriptsPanel() {
    const [scripts, setScripts] = useState([])
    const [runningScript, setRunningScript] = useState(null)
    const [log, setLog] = useState('')
    const logRef = useRef(null)

    useEffect(() => {
        fetch(`${API}/api/scripts`)
            .then(r => r.json())
            .then(setScripts)
            .catch(() => { })
    }, [])

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight
        }
    }, [log])

    function runScript(name) {
        setRunningScript(name)
        setLog(`▶ Running ${name}...\n`)

        const es = new EventSource(`${API}/api/run-script?name=${encodeURIComponent(name)}`)
        es.onmessage = e => {
            setLog(prev => prev + e.data + '\n')
        }
        es.onerror = () => {
            setLog(prev => prev + '\n[stream ended]\n')
            setRunningScript(null)
            es.close()
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Scripts</h2>
                    <p className="text-sm text-muted mt-2">Run workspace automation scripts directly from the dashboard</p>
                </div>
                {runningScript && <span className="badge badge-green">⠿ Running: {runningScript}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
                {scripts.map(name => (
                    <ScriptCard
                        key={name}
                        name={name}
                        meta={SCRIPT_META[name]}
                        onRun={runScript}
                    />
                ))}
            </div>

            {log && (
                <div className="card">
                    <div className="card-title flex justify-between">
                        🖥️ Script Output
                        <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setLog('')}>Clear</button>
                    </div>
                    <div className="script-log" ref={logRef}>{log}</div>
                </div>
            )}
        </div>
    )
}
