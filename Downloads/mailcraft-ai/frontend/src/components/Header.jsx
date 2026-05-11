import { History, Mail } from 'lucide-react'

export function Header({ historyCount, onHistoryClick }) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
          <Mail size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">MailCraft AI</h1>
          <p className="text-[11px] text-gray-400 leading-tight">Built by Shakeer Khan</p>
        </div>
      </div>

      {/* History button */}
      <button
        onClick={onHistoryClick}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
      >
        <History size={15} />
        History
        {historyCount > 0 && (
          <span className="ml-0.5 bg-brand-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
            {historyCount}
          </span>
        )}
      </button>
    </header>
  )
}
