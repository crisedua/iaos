import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

const RECURRENCE_OPTIONS = ['none', 'daily', 'weekly', 'monthly']

function ReminderCard({ reminder, onDelete }) {
    const isPast = new Date(reminder.scheduled_at) < new Date() && !reminder.sent
    const isSent = reminder.sent

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${isSent ? 'var(--border)' : isPast ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
            borderLeft: `3px solid ${isSent ? 'var(--green)' : isPast ? '#ef4444' : 'var(--gold)'}`,
            borderRadius: 8, padding: '12px 14px', marginBottom: 8,
            opacity: isSent ? 0.6 : 1,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {isSent ? '✅ ' : isPast ? '⚠️ ' : '⏰ '}{reminder.text}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(reminder.scheduled_at).toLocaleString()}
                        {reminder.recurrence && reminder.recurrence !== 'none' && (
                            <span style={{
                                marginLeft: 8, background: 'var(--bg-surface)',
                                border: '1px solid var(--border)', borderRadius: 4,
                                padding: '1px 6px', fontSize: 10
                            }}>🔁 {reminder.recurrence}</span>
                        )}
                    </div>
                </div>
                {!isSent && (
                    <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '2px 8px', color: '#ef4444' }}
                        onClick={() => onDelete(reminder.id)}
                    >✕</button>
                )}
            </div>
        </div>
    )
}

function BriefPreview({ brief }) {
    if (!brief) return null
    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '16px',
        }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12/*, color: 'var(--gold)'*/ }}>
                📋 Daily Brief Preview — Tomorrow
            </div>
            {brief.sections?.map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        {s.title}
                    </div>
                    {s.items?.length > 0 ? (
                        s.items.map((item, j) => (
                            <div key={j} style={{ fontSize: 12, color: 'var(--text-primary)', paddingLeft: 12, marginBottom: 2 }}>
                                • {item}
                            </div>
                        ))
                    ) : (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 12 }}>Nothing scheduled</div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default function RemindersPanel() {
    const [reminders, setReminders] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ text: '', scheduled_at: '', recurrence: 'none' })
    const [saving, setSaving] = useState(false)
    const [briefEnabled, setBriefEnabled] = useState(true)
    const [briefTime, setBriefTime] = useState('08:00')
    const [activeTab, setActiveTab] = useState('reminders') // 'reminders' | 'brief'

    // Default tomorrow's date/time for the form
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultDt = tomorrow.toISOString().slice(0, 16)

    useEffect(() => {
        loadReminders()
    }, [])

    async function loadReminders() {
        setLoading(true)
        try {
            const res = await fetch(`${API}/api/reminders`)
            if (res.ok) {
                const d = await res.json()
                setReminders(d.reminders || [])
            }
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    async function createReminder() {
        if (!form.text || !form.scheduled_at) return
        setSaving(true)
        try {
            const res = await fetch(`${API}/api/reminders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (res.ok) {
                setForm({ text: '', scheduled_at: '', recurrence: 'none' })
                setShowForm(false)
                await loadReminders()
            }
        } catch (e) { console.error(e) }
        setSaving(false)
    }

    async function deleteReminder(id) {
        try {
            await fetch(`${API}/api/reminders/${id}`, { method: 'DELETE' })
            setReminders(prev => prev.filter(r => r.id !== id))
        } catch (e) { console.error(e) }
    }

    const pending = reminders.filter(r => !r.sent)
    const sent = reminders.filter(r => r.sent)

    const mockBrief = {
        sections: [
            { title: 'Tasks Due Today', items: ['Review Q1 proposal', 'Follow up with Acme'] },
            { title: 'Overdue', items: [] },
            { title: "Today's Reminders", items: pending.slice(0, 3).map(r => r.text) },
            { title: 'Weekly Context', items: ['3 leads contacted this week', '1 proposal sent'] },
        ]
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Reminders & Daily Brief</h2>
                    <p className="text-sm text-muted mt-2">Scheduled reminders · Daily brief configuration</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={loadReminders}>🔄</button>
                    <button className="btn btn-gold" style={{ fontSize: 12 }} onClick={() => { setShowForm(true); setForm(f => ({ ...f, scheduled_at: defaultDt })) }}>
                        + New Reminder
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                {[['reminders', '⏰ Reminders'], ['brief', '📋 Daily Brief']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 13, padding: '8px 14px',
                            color: activeTab === id ? 'var(--gold)' : 'var(--text-muted)',
                            borderBottom: activeTab === id ? '2px solid var(--gold)' : '2px solid transparent',
                            marginBottom: -1,
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'reminders' && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Create form inline */}
                    {showForm && (
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '16px', marginBottom: 16,
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>New Reminder</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <textarea
                                    placeholder="What should I remind you about?"
                                    value={form.text}
                                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                                    rows={2}
                                    style={{
                                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                        borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)',
                                        fontSize: 13, resize: 'none', outline: 'none', width: '100%',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input
                                        type="datetime-local"
                                        value={form.scheduled_at}
                                        onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                                        style={{
                                            flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                            borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)',
                                            fontSize: 13, outline: 'none',
                                        }}
                                    />
                                    <select
                                        value={form.recurrence}
                                        onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}
                                        style={{
                                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                            borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)',
                                            fontSize: 13, outline: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        {RECURRENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowForm(false)}>Cancel</button>
                                    <button className="btn btn-gold" style={{ fontSize: 12 }} onClick={createReminder} disabled={saving || !form.text}>
                                        {saving ? 'Saving…' : 'Save Reminder'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="empty-state"><div className="loading-dots"><span /><span /><span /></div></div>
                    ) : (
                        <>
                            {pending.length === 0 && sent.length === 0 ? (
                                <div className="empty-state" style={{ padding: '48px 20px' }}>
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>⏰</div>
                                    <h3>No reminders yet</h3>
                                    <p>Create a reminder and Gravity Claw will send it when the time comes.</p>
                                </div>
                            ) : (
                                <>
                                    {pending.length > 0 && (
                                        <>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                                Upcoming ({pending.length})
                                            </div>
                                            {pending.map(r => <ReminderCard key={r.id} reminder={r} onDelete={deleteReminder} />)}
                                        </>
                                    )}
                                    {sent.length > 0 && (
                                        <>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>
                                                Sent ({sent.length})
                                            </div>
                                            {sent.map(r => <ReminderCard key={r.id} reminder={r} onDelete={deleteReminder} />)}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'brief' && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '16px', marginBottom: 16,
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Daily Brief Settings</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>Enable daily brief</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sent via Telegram each morning</div>
                                </div>
                                <button
                                    onClick={() => setBriefEnabled(!briefEnabled)}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: briefEnabled ? 'var(--gold)' : 'var(--border)',
                                        transition: 'background 0.2s', position: 'relative',
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute', top: 3,
                                        left: briefEnabled ? 22 : 3, width: 18, height: 18,
                                        background: 'white', borderRadius: '50%', transition: 'left 0.2s',
                                    }} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>Send time</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Local time</div>
                                </div>
                                <input type="time" value={briefTime}
                                    onChange={e => setBriefTime(e.target.value)}
                                    style={{
                                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                        borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)',
                                        fontSize: 13, outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <BriefPreview brief={mockBrief} />
                </div>
            )}
        </div>
    )
}
