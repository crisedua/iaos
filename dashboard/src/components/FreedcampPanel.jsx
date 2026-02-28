import { useState, useEffect } from 'react'

const API = 'http://localhost:3001'

function TaskCard({ task, type }) {
    const isHuman = type === 'human'

    function openFreedcamp() {
        if (task.link) window.open(task.link, '_blank')
    }

    const statusColor = {
        'done': 'var(--green)', 'completed': 'var(--green)',
        'in_progress': 'var(--gold)', 'pending': 'var(--text-muted)',
        'overdue': '#ef4444', 'failed': '#ef4444',
    }[task.status?.toLowerCase()] || 'var(--text-muted)'

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${isHuman ? 'var(--gold)' : '#7c3aed'}`,
            borderRadius: 8, padding: '12px 14px', marginBottom: 8,
            cursor: isHuman && task.link ? 'pointer' : 'default',
            transition: 'background 0.15s',
        }}
            onClick={isHuman ? openFreedcamp : undefined}
            title={isHuman && task.link ? 'Click to open in Freedcamp' : ''}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {isHuman && task.link && <span style={{ fontSize: 11, marginRight: 6, opacity: 0.5 }}>↗</span>}
                        {task.title || task.summary}
                    </div>
                    {task.project && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.project}</div>
                    )}
                    {task.details && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.details}</div>
                    )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                        fontSize: 10, background: 'var(--bg-surface)',
                        border: `1px solid ${statusColor}`,
                        color: statusColor, borderRadius: 4,
                        padding: '2px 8px', marginBottom: 4,
                    }}>
                        {task.status || 'pending'}
                    </div>
                    {task.due_date && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            Due {new Date(task.due_date).toLocaleDateString()}
                        </div>
                    )}
                    {task.created_at && !task.due_date && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {new Date(task.created_at).toLocaleString()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ConnectPrompt({ service }) {
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px dashed var(--border)',
            borderRadius: 10, padding: '32px 20px', textAlign: 'center',
        }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔗</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                Connect {service}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto 16px' }}>
                Add <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>
                    FREEDCAMP_API_KEY
                </code> and{' '}
                <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>
                    FREEDCAMP_USER_ID
                </code> to <code>.env</code> and restart the API server.
            </div>
        </div>
    )
}

export default function FreedcampPanel() {
    const [humanTasks, setHumanTasks] = useState([])
    const [aiJobs, setAiJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [noFreedcamp, setNoFreedcamp] = useState(false)
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [fcRes, jobsRes] = await Promise.allSettled([
                fetch(`${API}/api/freedcamp/tasks`),
                fetch(`${API}/api/agent-jobs`),
            ])

            if (fcRes.status === 'fulfilled' && fcRes.value.ok) {
                const d = await fcRes.value.json()
                if (d.notConfigured) setNoFreedcamp(true)
                else setHumanTasks(d.tasks || [])
            } else {
                setNoFreedcamp(true)
            }

            if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
                const d = await jobsRes.value.json()
                setAiJobs(d.jobs || [])
            }
        } catch (e) {
            console.error(e)
            setNoFreedcamp(true)
        }
        setLoading(false)
    }

    const statuses = ['all', 'pending', 'in_progress', 'done', 'overdue']
    const filteredHuman = filterStatus === 'all'
        ? humanTasks
        : humanTasks.filter(t => t.status?.toLowerCase() === filterStatus)

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Freedcamp Tasks</h2>
                    <p className="text-sm text-muted mt-2">Human tasks from Freedcamp · AI job log from Gravity Claw</p>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={loadData}>
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className="empty-state"><div className="loading-dots"><span /><span /><span /></div></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, minHeight: 0 }}>

                    {/* Human Tasks Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: 'var(--gold)', flexShrink: 0
                            }} />
                            <h3 style={{ fontSize: 13, fontWeight: 600 }}>Human Tasks</h3>
                            <span style={{
                                marginLeft: 'auto', fontSize: 11,
                                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 10, padding: '1px 8px', color: 'var(--text-muted)'
                            }}>{humanTasks.length}</span>
                        </div>

                        {/* Status filter */}
                        {!noFreedcamp && humanTasks.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                                {statuses.map(s => (
                                    <button key={s} onClick={() => setFilterStatus(s)}
                                        className="btn btn-ghost"
                                        style={{
                                            fontSize: 10, padding: '2px 8px',
                                            background: filterStatus === s ? 'var(--gold-dim)' : undefined,
                                            borderColor: filterStatus === s ? 'var(--gold)' : undefined,
                                        }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {noFreedcamp ? (
                                <ConnectPrompt service="Freedcamp" />
                            ) : filteredHuman.length === 0 ? (
                                <div className="empty-state" style={{ padding: '32px 20px', fontSize: 12 }}>
                                    No tasks found
                                </div>
                            ) : (
                                filteredHuman.map((t, i) => <TaskCard key={i} task={t} type="human" />)
                            )}
                        </div>
                    </div>

                    {/* AI Jobs Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: '#7c3aed', flexShrink: 0
                            }} />
                            <h3 style={{ fontSize: 13, fontWeight: 600 }}>AI Job Log</h3>
                            <span style={{
                                marginLeft: 'auto', fontSize: 11,
                                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 10, padding: '1px 8px', color: 'var(--text-muted)'
                            }}>{aiJobs.length}</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {aiJobs.length === 0 ? (
                                <div style={{
                                    background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                                    borderRadius: 10, padding: '32px 20px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                                        No jobs yet
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        Connect Supabase to see Gravity Claw's action log
                                    </div>
                                </div>
                            ) : (
                                aiJobs.map((j, i) => <TaskCard key={i} task={{
                                    title: j.summary, status: j.status,
                                    created_at: j.created_at, details: j.type
                                }} type="ai" />)
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
