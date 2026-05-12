import useSimulationStore from '../store/simulationStore'

const TABS = [
  { id: 'objects', icon: 'category',     label: 'Objects' },
  { id: 'joints',  icon: 'link',         label: 'Joints'  },
  { id: 'locks',   icon: 'lock_open',    label: 'Locks'   },
  { id: 'forces',  icon: 'dynamic_form', label: 'Forces'  },
]

export default function SideNav() {
  const { activeTab, setActiveTab } = useSimulationStore()

  return (
    <aside className="fixed left-0 top-16 bottom-0 z-40 w-20 bg-surface-container-low border-r border-white/5 flex flex-col">
      <div className="flex flex-col items-center py-6 gap-3">
        {TABS.map(({ id, icon, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              id={`sidenav-${id}`}
              onClick={() => setActiveTab(id)}
              title={label}
              className={`group flex flex-col items-center gap-1 w-16 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive ? 'sidenav-tab-active' : 'sidenav-tab'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-colors ${
                  isActive ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-300'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 0.3" } : {}}
              >
                {icon}
              </span>
              <span
                className={`font-headline text-[9px] tracking-wide uppercase font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Divider ── */}
      <div className="mx-auto w-8 h-px bg-outline-variant/20 my-2" />

      {/* ── Bottom utility icons ── */}
      <div className="flex flex-col items-center gap-3 pb-6 mt-auto">
        {[
          { icon: 'grid_view',    title: 'Grid' },
          { icon: 'straighten',   title: 'Measure' },
          { icon: 'help_outline', title: 'Help' },
        ].map(({ icon, title }) => (
          <button
            key={icon}
            id={`sidenav-util-${icon}`}
            title={title}
            className="material-symbols-outlined text-[20px] text-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            {icon}
          </button>
        ))}
      </div>
    </aside>
  )
}
