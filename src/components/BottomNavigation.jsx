const navItems = [
  { id: 'home',         label: 'Mi POS',      icon: '🏠' },
  { id: 'calendario',   label: 'Calendario',  icon: '📅' },
  { id: 'worldcup2026', label: 'Mundial 2026', icon: '🌍' },
  { id: 'puntoventa',   label: 'Cómo Ofrecer', icon: '🛒' },
  { id: 'more',         label: 'Más',          icon: '⋯'  },
]

export default function BottomNavigation({ current, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-dark border-t border-white/10 bottom-nav-safe lg:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-200 relative ${
                active ? 'text-brand-orange' : 'text-gray-500'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-orange rounded-full" />
              )}
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
