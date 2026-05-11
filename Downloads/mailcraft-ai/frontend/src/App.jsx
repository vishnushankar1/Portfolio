import { useCallback, useEffect, useState } from 'react'
import { clearAllHistory, deleteHistoryItem, fetchHistory } from './api/emailService'
import { Header }      from './components/Header'
import { PromptForm }  from './components/PromptForm'
import { EmailOutput } from './components/EmailOutput'
import { HistoryPanel } from './components/HistoryPanel'
import { useEmailGenerator } from './hooks/useEmailGenerator'

export default function App() {
  // ---- Form state --------------------------------------------------------
  const [prompt, setPrompt] = useState('')
  const [tone,   setTone]   = useState('professional')
  const [length, setLength] = useState('Medium')

  // ---- Email generation --------------------------------------------------
  const { status, subject, body, error, generate, stop, reset, loadEmail } = useEmailGenerator()

  // ---- History -----------------------------------------------------------
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history,     setHistory]     = useState([])

  const refreshHistory = useCallback(async () => {
    try {
      const data = await fetchHistory()
      setHistory(data)
    } catch (e) {
      console.warn('Could not load history:', e.message)
    }
  }, [])

  // Load history on mount
  useEffect(() => { refreshHistory() }, [refreshHistory])

  // Refresh history after each successful generation
  useEffect(() => {
    if (status === 'done') refreshHistory()
  }, [status, refreshHistory])

  // ---- Handlers ----------------------------------------------------------
  function handleGenerate() {
    if (!prompt.trim()) return
    generate({ prompt, tone, length })
  }

  function handleLoadHistory(item) {
    setPrompt(item.prompt)
    setTone(item.tone)
    setLength(item.length)
    loadEmail({ subject: item.subject ?? '', body: item.body })
  }

  async function handleDeleteHistory(id) {
    try {
      await deleteHistoryItem(id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
    } catch (e) {
      console.warn('Delete failed:', e.message)
    }
  }

  async function handleClearHistory() {
    try {
      await clearAllHistory()
      setHistory([])
    } catch (e) {
      console.warn('Clear failed:', e.message)
    }
  }

  // ---- Render ------------------------------------------------------------
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header historyCount={history.length} onHistoryClick={() => setHistoryOpen(true)} />

      {/* Two-column layout */}
      <main className="flex flex-1 overflow-hidden">

        {/* Left panel — form */}
        <section className="w-[420px] shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto custom-scroll p-6">
          <PromptForm
            prompt={prompt}
            tone={tone}
            length={length}
            status={status}
            error={error}
            onPromptChange={setPrompt}
            onToneChange={setTone}
            onLengthChange={setLength}
            onGenerate={handleGenerate}
            onStop={stop}
          />
        </section>

        {/* Right panel — output */}
        <section className="flex-1 bg-white overflow-y-auto custom-scroll p-6">
          <EmailOutput
            status={status}
            subject={subject}
            body={body}
            onReset={reset}
          />
        </section>
      </main>

      {/* Slide-in history drawer */}
      <HistoryPanel
        open={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadHistory}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
      />
    </div>
  )
}
