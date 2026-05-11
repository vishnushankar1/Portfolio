import { AlertCircle, Sparkles, Square } from 'lucide-react'
import { LengthSelector } from './LengthSelector'
import { ToneSelector } from './ToneSelector'

const EXAMPLES = [
  'Follow-up email after a job interview',
  'Leave request email for next week',
  'Cold outreach email for a SaaS product',
  'Apology email to client for delayed project',
  'Meeting request with a busy executive',
  'Thank-you email after a networking event',
]

export function PromptForm({
  prompt, tone, length, status,
  onPromptChange, onToneChange, onLengthChange,
  onGenerate, onStop,
  error,
}) {
  const isGenerating = status === 'generating'
  const disabled     = isGenerating

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !disabled) {
      onGenerate()
    }
  }

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Prompt textarea */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Describe your email
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="e.g. Write a follow-up email after interviewing for a Senior Frontend Developer role at Acme Corp…"
          rows={4}
          className="
            w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
            text-[14px] text-gray-800 placeholder-gray-300
            resize-none leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow
          "
        />

        {/* Quick-fill example chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onPromptChange(ex)}
              disabled={disabled}
              className="
                text-[11px] px-2.5 py-1 rounded-full border border-gray-200
                text-gray-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50
                transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Tone
        </label>
        <ToneSelector value={tone} onChange={onToneChange} disabled={disabled} />
      </div>

      {/* Length */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Length
        </label>
        <LengthSelector value={length} onChange={onLengthChange} disabled={disabled} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] animate-fade-in">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={onGenerate}
          disabled={disabled || !prompt.trim()}
          className="
            flex-1 flex items-center justify-center gap-2 py-3 px-5
            rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[.98]
            text-white text-[14px] font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all shadow-sm
          "
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generate Email
            </>
          )}
        </button>

        {isGenerating && (
          <button
            onClick={onStop}
            className="
              flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200
              text-gray-600 text-[13px] font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200
              transition-colors
            "
          >
            <Square size={13} className="fill-current" />
            Stop
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-center -mt-3">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">⌘ Enter</kbd> to generate
      </p>
    </div>
  )
}
