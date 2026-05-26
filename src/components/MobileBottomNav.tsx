import { Home, Plus, Search, Star, Zap } from 'lucide-react'

type MobileBottomNavProps = {
  onAdd: () => void
  onNavigate: (view: string) => void
  onSearchFocus: () => void
}

export function MobileBottomNav({
  onAdd,
  onNavigate,
  onSearchFocus,
}: MobileBottomNavProps) {
  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-3xl border border-white/10 bg-[#0f172a]/85 p-2 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:hidden">
        {[
          { label: 'Home', icon: Home, action: () => onNavigate('Dashboard') },
          { label: 'Fav', icon: Star, action: () => onNavigate('Favorites') },
          { label: 'Add', icon: Plus, action: onAdd },
          { label: 'Search', icon: Search, action: onSearchFocus },
          { label: 'Recent', icon: Zap, action: () => onNavigate('Recent') },
        ].map((item) => {
          const Icon = item.icon

          return (
            <button
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
              key={item.label}
              onClick={item.action}
              type="button"
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <button
        aria-label="Add system"
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl border border-[#f05193]/35 bg-[#f05193]/25 text-[#ffd1e4] shadow-2xl shadow-[#f05193]/20 backdrop-blur-2xl lg:hidden"
        onClick={onAdd}
        type="button"
      >
        <Plus size={24} />
      </button>
    </>
  )
}
