import { Check, Copy, Mail, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ---------------------------------------------------------------------------
// Empty / Idle state
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Mail size={28} className="text-gray-300" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-gray-400">Your email will appear here</p>
        <p className="text-[13px] text-gray-300 mt-1">
          Fill in a prompt on the left and click <strong className="font-medium text-gray-400">Generate Email</strong>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Copy button with feedback
// ---------------------------------------------------------------------------
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium
        transition-all
        ${copied
          ? 'border-green-300 bg-green-50 text-green-600'
          : 'border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300'
        }
      `}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy email'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main output component
// ---------------------------------------------------------------------------
export function EmailOutput({ status, subject, body, onReset }) {
  const isGenerating = status === 'generating'
  const hasContent   = subject || body
  const showContent  = isGenerating || status === 'done' || status === 'error'

  // Build the full text for copying
  const fullText = subject ? `Subject: ${subject}\n\n${body}` : body

  if (!showContent) return <EmptyState />

  return (
    <div className="flex flex-col gap-4 h-full animate-fade-in">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {isGenerating ? 'Writing your email…' : 'Generated email'}
        </span>
        <div className="flex items-center gap-2">
          {hasContent && !isGenerating && (
            <CopyButton text={fullText} />
          )}
          {status === 'done' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 text-[12px] font-medium hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Subject */}
      {(subject || isGenerating) && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-1">Subject</p>
          <p className={`text-[15px] font-semibold text-brand-800 leading-snug ${isGenerating && !subject ? 'typing-cursor' : ''}`}>
            {subject || <span className="opacity-40">Generating subject…</span>}
          </p>
        </div>
      )}

      {/* Email body */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 overflow-y-auto custom-scroll">
        {body ? (
          <pre
            className={`
              font-mono text-[13px] leading-[1.8] text-gray-700 whitespace-pre-wrap break-words
              ${isGenerating ? 'typing-cursor' : ''}
            `}
          >
            {body}
          </pre>
        ) : isGenerating ? (
          <div className="space-y-3 pt-1">
            {[100, 85, 92, 75, 88, 60].map((w, i) => (
              <div
                key={i}
                className="h-3.5 bg-gray-100 rounded-full animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Word count footer */}
      {body && (
        <p className="text-[11px] text-gray-400 text-right">
          {body.split(/\s+/).filter(Boolean).length} words
        </p>
      )}
    </div>
  )
}
