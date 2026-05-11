import { Briefcase, Coffee, Crown, Heart } from 'lucide-react'

const TONES = [
  {
    id:    'professional',
    label: 'Professional',
    icon:  Briefcase,
    desc:  'Business-ready & polished',
    color: 'blue',
  },
  {
    id:    'friendly',
    label: 'Friendly',
    icon:  Heart,
    desc:  'Warm & approachable',
    color: 'rose',
  },
  {
    id:    'formal',
    label: 'Formal',
    icon:  Crown,
    desc:  'Strict & ceremonial',
    color: 'amber',
  },
  {
    id:    'casual',
    label: 'Casual',
    icon:  Coffee,
    desc:  'Relaxed & conversational',
    color: 'emerald',
  },
]

const COLOR_MAP = {
  blue:    'border-blue-400 bg-blue-50 text-blue-700',
  rose:    'border-rose-400 bg-rose-50 text-rose-700',
  amber:   'border-amber-400 bg-amber-50 text-amber-700',
  emerald: 'border-emerald-400 bg-emerald-50 text-emerald-700',
}

const ICON_COLOR_MAP = {
  blue:    'text-blue-500',
  rose:    'text-rose-500',
  amber:   'text-amber-500',
  emerald: 'text-emerald-500',
}

export function ToneSelector({ value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TONES.map((tone) => {
        const isActive = value === tone.id
        const Icon = tone.icon
        return (
          <button
            key={tone.id}
            onClick={() => onChange(tone.id)}
            disabled={disabled}
            className={`
              flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive
                ? `${COLOR_MAP[tone.color]} border shadow-sm`
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <Icon
              size={16}
              className={`mt-0.5 shrink-0 ${isActive ? ICON_COLOR_MAP[tone.color] : 'text-gray-400'}`}
            />
            <div>
              <div className="text-[13px] font-medium leading-tight">{tone.label}</div>
              <div className={`text-[11px] mt-0.5 leading-tight ${isActive ? 'opacity-70' : 'text-gray-400'}`}>
                {tone.desc}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export { TONES }
