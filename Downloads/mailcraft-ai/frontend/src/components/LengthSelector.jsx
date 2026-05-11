const LENGTHS = [
  { id: 'Short',  desc: '3–5 sentences' },
  { id: 'Medium', desc: '2–3 paragraphs' },
  { id: 'Long',   desc: '4–6 paragraphs' },
]

export function LengthSelector({ value, onChange, disabled }) {
  return (
    <div className="flex gap-2">
      {LENGTHS.map((len) => {
        const isActive = value === len.id
        return (
          <button
            key={len.id}
            onClick={() => onChange(len.id)}
            disabled={disabled}
            className={`
              flex-1 py-2 px-3 rounded-lg border text-center transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive
                ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-[13px] font-medium leading-tight">{len.id}</div>
            <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-brand-500' : 'text-gray-400'}`}>
              {len.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}
