import useSimulationStore from '../store/simulationStore'

const PRIMARY_ACTIONS = [
  { id: 'run',     icon: 'play_arrow',  label: 'Run',     targetState: 'running', filled: true  },
  { id: 'pause',   icon: 'pause',       label: 'Pause',   targetState: 'paused',  filled: true  },
  { id: 'reset',   icon: 'restart_alt', label: 'Reset',   targetState: 'idle',    filled: false },
  { id: 'slowmo',  icon: 'speed',       label: 'Slow-mo', targetState: 'slowmo',  filled: false },
]

const SECONDARY_ACTIONS = [
  { id: 'export',  icon: 'ios_share',   label: 'Export'  },
  { id: 'capture', icon: 'photo_camera',label: 'Capture' },
]

export default function BottomBar() {
  const { runState, setRunState } = useSimulationStore()

  const handleAction = (action) => {
    if (action.id === 'reset') {
      setRunState('idle')
    } else if (action.id === 'run' && runState === 'running') {
      setRunState('paused')
    } else if (action.id === 'pause') {
      setRunState('paused')
    } else {
      setRunState(action.targetState)
    }
  }

  // Derive the visible primary actions: show Run OR Pause depending on state
  const visiblePrimary = PRIMARY_ACTIONS.filter(
    (a) => !(a.id === 'pause' && runState !== 'running')
           && !(a.id === 'run'   && runState === 'running')
  )

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pointer-events-none">
      <div className="pointer-events-auto bg-surface-container-high/85 backdrop-blur-xl rounded-t-xl px-8 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] flex items-center gap-10 border-x border-t border-white/[0.07]">

        {/* ── Primary actions ── */}
        {visiblePrimary.map((action) => {
          const isActive =
            (action.id === 'run'    && runState === 'running') ||
            (action.id === 'pause'  && runState === 'paused')  ||
            (action.id === 'slowmo' && runState === 'slowmo')  ||
            (action.id === 'reset'  && runState === 'idle')

          return (
            <button
              key={action.id}
              id={`bottombar-${action.id}`}
              onClick={() => handleAction(action)}
              className={`flex flex-col items-center gap-1 group transition-all duration-200 active:scale-90 ${
                isActive ? 'bottom-btn-active' : 'bottom-btn'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={
                  action.filled && isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {action.icon}
              </span>
              <span className="font-headline text-[9px] uppercase font-bold tracking-widest">
                {action.label}
              </span>
            </button>
          )
        })}

        {/* ── Divider ── */}
        <div className="h-8 w-px bg-white/10" />

        {/* ── Secondary actions ── */}
        {SECONDARY_ACTIONS.map((action) => (
          <button
            key={action.id}
            id={`bottombar-${action.id}`}
            className="bottom-btn flex flex-col items-center gap-1 group transition-all duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[22px]">
              {action.icon}
            </span>
            <span className="font-headline text-[9px] uppercase font-bold tracking-widest">
              {action.label}
            </span>
          </button>
        ))}

        {/* ── Run state indicator pill ── */}
        {runState !== 'idle' && (
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold font-label uppercase tracking-widest border flex items-center gap-1.5 ${
              runState === 'running'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : runState === 'slowmo'
                ? 'bg-secondary/10 border-secondary/30 text-secondary'
                : 'bg-tertiary/10 border-tertiary/30 text-tertiary'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {runState === 'running' ? 'Simulation Running'
              : runState === 'slowmo' ? 'Slow Motion'
              : 'Paused'}
          </div>
        )}
      </div>
    </footer>
  )
}
