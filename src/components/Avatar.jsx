// DiceBear adventurer avatars — seed puede ser nombre ("Leona") o emoji legacy ("🦁")
const BASE = 'https://api.dicebear.com/9.x/adventurer/svg'

export const avatarUrl = seed =>
  `${BASE}?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf,d1f4d6&backgroundType=gradientLinear&radius=50`

// Detecta emojis legacy (1-2 chars unicode)
const isEmoji = v => v && [...v].length <= 2

const sizeMap = {
  xs: 'w-6 h-6 text-sm',
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-xl',
  lg: 'w-12 h-12 text-2xl',
  xl: 'w-16 h-16 text-3xl',
  '2xl': 'w-20 h-20 text-4xl',
}

export default function Avatar({ seed, size = 'md', className = '', fallback = '🦁' }) {
  const sz = sizeMap[size] || sizeMap.md
  const val = seed || fallback

  if (isEmoji(val)) {
    return (
      <span className={`${sz} rounded-full bg-brand-medium flex items-center justify-center flex-shrink-0 ${className}`}>
        {val}
      </span>
    )
  }

  return (
    <img
      src={avatarUrl(val)}
      alt={val}
      className={`${sz} rounded-full object-cover flex-shrink-0 ${className}`}
    />
  )
}
