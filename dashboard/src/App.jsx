import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import ContextOS from './components/ContextOS.jsx'
import MetricsPanel from './components/MetricsPanel.jsx'
import OutreachPanel from './components/OutreachPanel.jsx'
import ChallengeFunnel from './components/ChallengeFunnel.jsx'
import ReferenceLibrary from './components/ReferenceLibrary.jsx'
import OutputsExplorer from './components/OutputsExplorer.jsx'
import ScriptsPanel from './components/ScriptsPanel.jsx'
import MCPStatus from './components/MCPStatus.jsx'
import FreedcampPanel from './components/FreedcampPanel.jsx'
import RemindersPanel from './components/RemindersPanel.jsx'
import DocumentsPanel from './components/DocumentsPanel.jsx'
import MemoryPanel from './components/MemoryPanel.jsx'

const PANELS = {
  chat: { label: 'Claude Chat', component: ChatPanel },
  context: { label: 'Context OS', component: ContextOS },
  metrics: { label: 'Pipeline & Metrics', component: MetricsPanel },
  challenge: { label: 'Challenge Funnel', component: ChallengeFunnel },
  outreach: { label: 'Outreach', component: OutreachPanel },
  reference: { label: 'Reference Library', component: ReferenceLibrary },
  outputs: { label: 'Outputs', component: OutputsExplorer },
  scripts: { label: 'Scripts', component: ScriptsPanel },
  mcp: { label: 'MCP Services', component: MCPStatus },
  freedcamp: { label: 'Freedcamp Tasks', component: FreedcampPanel },
  reminders: { label: 'Reminders & Briefs', component: RemindersPanel },
  documents: { label: 'Documents', component: DocumentsPanel },
  memory: { label: 'Core Memory', component: MemoryPanel },
}

export default function App() {
  const [activePanel, setActivePanel] = useState('chat')
  const Panel = PANELS[activePanel]?.component

  return (
    <div className="app-layout">
      <Sidebar active={activePanel} onNavigate={setActivePanel} />
      <div className="main-area">
        <Header title={PANELS[activePanel]?.label} />
        <div className="content-area">
          {Panel && <Panel />}
        </div>
      </div>
    </div>
  )
}
