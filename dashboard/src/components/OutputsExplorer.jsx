import { useState, useEffect } from 'react'
import { marked } from 'marked'

const API = 'http://localhost:3001'

function FileNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(depth === 0)
    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(false)

    function openFile() {
        if (node.isDir) { setOpen(o => !o); return }
        setLoading(true)
        fetch(`${API}/api/file?path=${encodeURIComponent(node.path)}`)
            .then(r => r.json())
            .then(d => { setContent(d.content); setLoading(false) })
    }

    return (
        <div>
            <div
                className={`tree-item ${node.isDir ? 'dir' : ''}`}
                style={{ paddingLeft: depth * 14 + 8 }}
                onClick={openFile}
            >
                <span>{node.isDir ? (open ? '📂' : '📁') : '📄'}</span>
                <span>{node.name}</span>
                {!node.isDir && node.size && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
                        {(node.size / 1024).toFixed(1)}kb
                    </span>
                )}
            </div>
            {node.isDir && open && node.children?.map((child, i) => (
                <FileNode key={i} node={child} depth={depth + 1} />
            ))}
            {content !== null && (
                <div style={{ margin: '8px 0 12px', paddingLeft: depth * 14 + 22 }}>
                    <div className="card" style={{ padding: 14 }}>
                        <div className="flex justify-between mb-4" style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'monospace' }}>{node.path}</span>
                            <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setContent(null)}>
                                ✕ Close
                            </button>
                        </div>
                        {node.name.endsWith('.md') ? (
                            <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                        ) : node.name.endsWith('.json') ? (
                            <pre style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', overflowX: 'auto', maxHeight: 300 }}>
                                {JSON.stringify(JSON.parse(content), null, 2)}
                            </pre>
                        ) : (
                            <pre style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', overflowX: 'auto', maxHeight: 300 }}>
                                {content}
                            </pre>
                        )}
                    </div>
                    {loading && <div className="loading" style={{ padding: 10 }}><div className="spinner" /></div>}
                </div>
            )}
        </div>
    )
}

export default function OutputsExplorer() {
    const [tree, setTree] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API}/api/tree?path=${encodeURIComponent('outputs')}`)
            .then(r => r.json())
            .then(d => { setTree(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Outputs Explorer</h2>
                    <p className="text-sm text-muted mt-2">Browse all deliverables and work products</p>
                </div>
            </div>

            <div className="card" style={{ padding: '12px 8px' }}>
                <div className="file-tree">
                    <div className="tree-item dir" style={{ paddingLeft: 8, fontWeight: 700, color: 'var(--gold)' }}>
                        <span>📁</span> outputs/
                    </div>
                    {tree.map((node, i) => (
                        <FileNode key={i} node={node} depth={1} />
                    ))}
                </div>
            </div>
        </div>
    )
}
