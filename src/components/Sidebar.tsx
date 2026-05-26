import { X } from 'lucide-react'
import { navigationItems } from '../data/dashboardData'

type SidebarProps = {
  activeView: string
  isOpen: boolean
  onNavigate: (view: string) => void
  onClose: () => void
  systemCount: number
}

export function Sidebar({
  activeView,
  isOpen,
  onClose,
  onNavigate,
  systemCount,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#020617]/70 backdrop-blur-sm transition lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0f172a]/92 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl transition duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#009FD1]">
              NEXORA
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-normal text-white">
              HUB V1
            </h1>
          </div>
          <button
            aria-label="Close navigation"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-300 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
          <p className="text-xs text-slate-400">สถานะ Workspace</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-white">ระบบพร้อมใช้</span>
            <span className="rounded-full bg-[#009FD1]/15 px-2 py-1 text-xs text-[#70dfff]">
              {systemCount}
            </span>
          </div>
        </div>

        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.label

            return (
              <button
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? 'border border-[#009FD1]/25 bg-[#009FD1]/12 text-white shadow-lg shadow-[#009FD1]/10'
                    : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'
                }`}
                key={item.label}
                onClick={() => {
                  onNavigate(item.label)
                  onClose()
                }}
                type="button"
              >
                <Icon
                  className={isActive ? 'text-[#70dfff]' : 'text-slate-500'}
                  size={18}
                  strokeWidth={1.8}
                />
                {item.displayLabel}
              </button>
            )
          })}
        </nav>

        <div className="mt-5 rounded-2xl border border-[#f05193]/20 bg-[#f05193]/10 p-4">
          <p className="text-sm font-semibold text-white">โหมด AI dashboard</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            ระบบและลิงก์ถูกบันทึกในเครื่อง และซิงก์กับ Cloud Sync เมื่อพร้อม.
          </p>
        </div>
      </aside>
    </>
  )
}
