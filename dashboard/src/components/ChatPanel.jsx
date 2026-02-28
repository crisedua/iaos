import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'

const API = 'http://localhost:3001'

const QUICK_COMMANDS = [
    { label: '/prime', prompt: '/prime — Load full context and confirm you understand my workspace, business, role, current priorities, and available commands.' },
    { label: 'Review Plans', prompt: 'Review my current plans and priorities. What should I focus on today based on my strategy and current data?' },
    { label: 'Weekly Review', prompt: '/ia-os-session review personal — Run my weekly IA OS review. Synthesize what happened, surface key insights, and give me 3 clear priorities for this week.' },
    { label: 'Create Plan', prompt: '/create-plan ' },
    { label: 'Outreach Script', prompt: 'Write me a personalized outreach script for a [type of business] owner who feels overwhelmed with operations. Use the tone and frameworks from my outreach scripts.' },
    { label: 'LinkedIn Post', prompt: 'Write a LinkedIn post for this week based on my current strategy and what I\'m working on. Use my voice and positioning.' },
    { label: 'Sprint Session', prompt: '/ia-os-session sprint personal — I want to run a focused work session. Here\'s what I need to accomplish: ' },
    { label: 'Challenge Update', prompt: 'Review the AI CEO Challenge funnel status in my current-data.md. What actions should I take today to hit my March targets?' },
]

function MessageBubble({ msg }) {
    const isUser = msg.role === 'user'

    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: 16,
        }}>
            {!isUser && (
                <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0, marginRight: 10, marginTop: 2,
                }}>🤖</div>
            )}
            <div style={{
                maxWidth: '78%',
                background: isUser ? 'var(--gold-dim)' : 'var(--bg-card)',
                border: `1px solid ${isUser ? 'rgba(201,162,39,0.3)' : 'var(--border)'}`,
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '12px 16px',
            }}>
                {isUser ? (
                    <p style={{ color: 'var(--text-primary)', fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
                        {msg.content}
                    </p>
                ) : (
                    <div
                        className="md-content"
                        style={{ fontSize: 13.5 }}
                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || '') }}
                    />
                )}
            </div>
            {isUser && (
                <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--bg-hover)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0, marginLeft: 10, marginTop: 2,
                }}>👤</div>
            )}
        </div>
    )
}

function SaveModal({ content, onClose, onSave }) {
    const [filename, setFilename] = useState('session-output.md')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSave() {
        setSaving(true)
        const res = await fetch(`${API}/api/save-output`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content }),
        })
        const d = await res.json()
        setSaving(false)
        setSaved(true)
        setTimeout(() => { onSave(d.path); onClose() }, 1200)
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 480 }}>
                <div className="modal-header">
                    <h2>💾 Save to outputs/</h2>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Filename (inside outputs/)
                    </label>
                    <input
                        type="text"
                        value={filename}
                        onChange={e => setFilename(e.target.value)}
                        style={{
                            width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13,
                            outline: 'none',
                        }}
                    />
                    <p className="text-sm text-muted mt-2" style={{ marginTop: 8 }}>
                        Will be saved to: <code>c:\ClaudeCode\outputs\{filename}</code>
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-gold" onClick={handleSave} disabled={saving || saved}>
                        {saved ? '✅ Saved!' : saving ? 'Saving…' : '💾 Save File'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ChatPanel() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [streaming, setStreaming] = useState(false)
    const [streamBuffer, setStreamBuffer] = useState('')
    const [saveModal, setSaveModal] = useState(null)
    const [savedNotif, setSavedNotif] = useState('')
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const abortRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamBuffer])

    function quickCommand(cmd) {
        setInput(cmd.prompt)
        inputRef.current?.focus()
    }

    async function send() {
        const text = input.trim()
        if (!text || streaming) return
        setInput('')

        const newMessages = [...messages, { role: 'user', content: text }]
        setMessages(newMessages)
        setStreaming(true)
        setStreamBuffer('')

        // Build message history for API (only role + content)
        const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))

        try {
            const controller = new AbortController()
            abortRef.current = controller

            const res = await fetch(`${API}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages }),
                signal: controller.signal,
            })

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let assistantText = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    try {
                        const data = JSON.parse(line.slice(6))
                        if (data.type === 'text') {
                            assistantText += data.text
                            setStreamBuffer(assistantText)
                        } else if (data.type === 'done') {
                            setMessages(prev => [...prev, { role: 'assistant', content: assistantText }])
                            setStreamBuffer('')
                            setStreaming(false)
                        } else if (data.type === 'error') {
                            setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: `❌ **Error:** ${data.error}`
                            }])
                            setStreamBuffer('')
                            setStreaming(false)
                        }
                    } catch { }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `❌ **Connection error:** ${err.message}\n\nMake sure the API server is running: \`node api-server.js\``
                }])
            }
            setStreamBuffer('')
            setStreaming(false)
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    function stopStreaming() {
        abortRef.current?.abort()
        setStreaming(false)
        setStreamBuffer('')
    }

    function clearChat() {
        setMessages([])
        setStreamBuffer('')
    }

    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Claude Chat</h2>
                    <p className="text-sm text-muted mt-2">
                        Context-loaded — Claude knows your full workspace on every message
                    </p>
                </div>
                <div className="flex gap-2">
                    {lastAssistantMsg && (
                        <button className="btn btn-ghost" style={{ fontSize: 12 }}
                            onClick={() => setSaveModal(lastAssistantMsg.content)}>
                            💾 Save Last Response
                        </button>
                    )}
                    {messages.length > 0 && (
                        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={clearChat}>
                            🗑 Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Quick commands */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {QUICK_COMMANDS.map(cmd => (
                    <button
                        key={cmd.label}
                        className="btn btn-ghost"
                        style={{ fontSize: 11.5, padding: '4px 10px' }}
                        onClick={() => quickCommand(cmd)}
                    >
                        {cmd.label}
                    </button>
                ))}
            </div>

            {/* Chat window */}
            <div style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px',
                overflowY: 'auto',
                minHeight: 300,
                maxHeight: 'calc(100vh - 360px)',
                marginBottom: 14,
            }}>
                {messages.length === 0 && !streamBuffer ? (
                    <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                        <h3>Claude is ready</h3>
                        <p>Your full workspace context is loaded automatically.<br />
                            Type a command or click a quick button above.</p>
                        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                            Try: <em>/prime</em> or <em>Review Plans</em>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} msg={msg} />
                        ))}
                        {streamBuffer && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, flexShrink: 0, marginRight: 10, marginTop: 2,
                                }}>🤖</div>
                                <div style={{
                                    maxWidth: '78%',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px 16px 16px 4px',
                                    padding: '12px 16px',
                                }}>
                                    <div
                                        className="md-content"
                                        style={{ fontSize: 13.5 }}
                                        dangerouslySetInnerHTML={{ __html: marked.parse(streamBuffer) }}
                                    />
                                    <div style={{
                                        display: 'inline-block', width: 8, height: 14,
                                        background: 'var(--gold)', borderRadius: 2,
                                        animation: 'blink 0.8s step-end infinite', marginLeft: 2,
                                    }} />
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-end',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 14px',
            }}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or question… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    disabled={streaming}
                    style={{
                        flex: 1, background: 'transparent', border: 'none',
                        color: 'var(--text-primary)', fontSize: 13.5, resize: 'none',
                        outline: 'none', lineHeight: 1.6, fontFamily: 'Inter, sans-serif',
                    }}
                />
                {streaming ? (
                    <button className="btn btn-danger" onClick={stopStreaming} style={{ flexShrink: 0 }}>
                        ⏹ Stop
                    </button>
                ) : (
                    <button
                        className="btn btn-gold"
                        onClick={send}
                        disabled={!input.trim()}
                        style={{ flexShrink: 0 }}
                    >
                        Send ↑
                    </button>
                )}
            </div>

            <p className="text-sm text-muted" style={{ marginTop: 8, textAlign: 'center' }}>
                Context auto-loaded: CLAUDE.md · personal-info · business-info · strategy · current-data · plans
            </p>

            {/* Save modal */}
            {saveModal && (
                <SaveModal
                    content={saveModal}
                    onClose={() => setSaveModal(null)}
                    onSave={(p) => {
                        setSavedNotif(`Saved to ${p}`)
                        setTimeout(() => setSavedNotif(''), 3000)
                    }}
                />
            )}

            {savedNotif && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24,
                    background: 'var(--green-dim)', border: '1px solid var(--green)',
                    borderRadius: 8, padding: '10px 16px', fontSize: 13,
                    color: 'var(--green)', animation: 'fadeIn 0.2s ease',
                }}>
                    ✅ {savedNotif}
                </div>
            )}

            <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
        </div>
    )
}
