import { Clock, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

// Badge color per tone
const TONE_COLORS = {
  professional: 'bg-blue-50   text-blue-600   border-blue-200',
  friendly:     'bg-rose-50   text-rose-600   border-rose-200',
  formal:       'bg-amber-50  text-amber-600  border-amber-200',
  casual:       'bg-emerald-50 text-emerald-600 border-emerald-200',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
  const now   = new Date()
  const diff  = now - date   // ms

  if (diff < 60_000)             return 'Just now'
  if (diff < 3_600_000)          return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000)         return `${Math.floor(diff / 3_600_000)}h ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Single history card
// ---------------------------------------------------------------------------
function HistoryCard({ item, onLoad, onDelete }) {
  function handleDelete(e) {
    e.stopPropagation()
    onDelete(item.id)
  }

  return (
    <div
      onClick={() => onLoad(item)}
      className="group flex flex-col gap-1.5 p-3.5 rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition-all"
    >
      {/* Subject */}
      <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">
        {item.subject || 'Untitled email'}
      </p>

      {/* Prompt snippet */}
      <p className="text-[11px] text-gray-400 line-clamp-1">{item.prompt}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TONE_COLORS[item.tone] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            {item.tone}
          </span>
          <span className="text-[10px] text-gray-300 border border-gray-200 rounded-full px-2 py-0.5">
            {item.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-gray-300">
            <Clock size={10} />
            {formatDate(item.created_at)}
          </span>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// History panel (slide-in drawer)
// ---------------------------------------------------------------------------
export function HistoryPanel({ open, history, onClose, onLoad, onDelete, onClear }) {
  async function handleClear() {
    if (!window.confirm('Clear all email history? This cannot be undone.')) return
    onClear()
    toast.success('History cleared')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50
          flex flex-col transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900">Email history</h2>
            <p className="text-[11px] text-gray-400">{history.length} email{history.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Clock size={32} className="text-gray-200" />
              <p className="text-[13px] text-gray-400 font-medium">No history yet</p>
              <p className="text-[12px] text-gray-300">Generated emails will appear here</p>
            </div>
          ) : (
            history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onLoad={(i) => { onLoad(i); onClose() }}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
