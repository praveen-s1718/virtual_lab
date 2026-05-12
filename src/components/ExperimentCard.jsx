/* ── Inline SVG thumbnails keyed by experiment id ── */
const THUMBS = {
  pendulum: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <line x1="60" y1="5" x2="60" y2="5" stroke="#3c494e" strokeWidth="1" />
      <line x1="60" y1="5" x2="45" y2="55" stroke="#2ff5ff" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="45" cy="58" r="7" fill="rgba(47,245,255,0.15)" stroke="#2ff5ff" strokeWidth="1.5" className="animate-pulse" />
      <line x1="60" y1="5" x2="72" y2="48" stroke="#3c494e" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
      <circle cx="72" cy="51" r="5" fill="rgba(60,73,78,0.3)" stroke="#3c494e" strokeWidth="1" />
      <line x1="10" y1="5" x2="110" y2="5" stroke="#3c494e" strokeWidth="2" />
      {[15,25,35,45,55,65,75,85,95,105].map(x => (
        <line key={x} x1={x} y1="5" x2={x-2} y2="10" stroke="#3c494e" strokeWidth="1" strokeOpacity="0.5" />
      ))}
      <text x="60" y="82" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">T = 2π√(L/g)</text>
    </svg>
  ),
  cradle: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      {[20,33,46,59,72].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="10" x2={x} y2="58" stroke="#3c494e" strokeWidth="1" strokeDasharray="2 1" />
          <circle cx={x} cy="62" r="7" fill="rgba(255,243,210,0.15)" stroke="#fff3d2" strokeWidth="1.2" />
        </g>
      ))}
      <line x1="10" y1="10" x2="85" y2="10" stroke="#3c494e" strokeWidth="1.5" />
      <circle cx="5" cy="62" r="7" fill="rgba(255,243,210,0.3)" stroke="#fff3d2" strokeWidth="1.5" />
      <line x1="5" y1="10" x2="5" y2="58" stroke="#fff3d2" strokeWidth="1" strokeDasharray="2 1" />
      <text x="60" y="82" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">p = mv (conserved)</text>
    </svg>
  ),
  truss: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <path d="M 10 75 L 35 20 L 60 75 L 85 20 L 110 75 Z" fill="none" stroke="#3c494e" strokeWidth="2" strokeDasharray="3 2" />
      <line x1="10" y1="75" x2="110" y2="75" stroke="#3c494e" strokeWidth="2" />
      <circle cx="35" cy="20" r="4" fill="#ffd5cb" className="animate-pulse" />
      <circle cx="85" cy="20" r="4" fill="#ffd5cb" className="animate-pulse" />
      <line x1="35" y1="20" x2="35" y2="45" stroke="#ffd5cb" strokeWidth="1.5" markerEnd="url(#a)" />
      <line x1="85" y1="20" x2="85" y2="50" stroke="#ffd5cb" strokeWidth="1.5" />
      <text x="60" y="85" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">Stress Peak: 44.2kN</text>
    </svg>
  ),
  projectile: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <path d="M 10 75 Q 55 10 110 65" fill="none" stroke="#2ff5ff" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.6" />
      {[10,30,55,80,105].map((x, i) => {
        const ys = [75, 38, 16, 38, 65]
        return <circle key={i} cx={x} cy={ys[i]} r="4" fill={`rgba(47,245,255,${0.3 + i*0.1})`} stroke="#2ff5ff" strokeWidth="1" />
      })}
      <line x1="10" y1="75" x2="110" y2="75" stroke="#3c494e" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="10" y2="75" stroke="#3c494e" strokeWidth="1.5" />
      <text x="60" y="85" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">x = v₀cosθ · t</text>
    </svg>
  ),
  spring: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <line x1="60" y1="5" x2="60" y2="15" stroke="#2ff5ff" strokeWidth="2" />
      {[0,1,2,3,4,5,6].map(i => (
        <line key={i} x1={i%2===0?48:72} y1={15+i*7} x2={i%2===0?72:48} y2={15+(i+1)*7} stroke="#fff3d2" strokeWidth="1.5" />
      ))}
      <rect x="40" y="64" width="40" height="20" rx="2" fill="rgba(47,245,255,0.12)" stroke="#2ff5ff" strokeWidth="1.5" />
      <line x1="10" y1="5" x2="110" y2="5" stroke="#3c494e" strokeWidth="2" />
      <text x="60" y="88" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">F = -kx</text>
    </svg>
  ),
  incline: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <polygon points="10,80 110,80 110,35" fill="rgba(60,73,78,0.2)" stroke="#3c494e" strokeWidth="1.5" />
      <rect x="38" y="46" width="22" height="16" rx="2" fill="rgba(47,245,255,0.15)" stroke="#2ff5ff" strokeWidth="1.5"
        transform="rotate(-27,49,54)" />
      <line x1="76" y1="57" x2="76" y2="35" stroke="#ffd5cb" strokeWidth="1" strokeDasharray="2 1" />
      <text x="82" y="48" fill="#ffd5cb" fontSize="7" fontFamily="Space Grotesk">N</text>
      <text x="60" y="87" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">a = g(sinθ − μcosθ)</text>
    </svg>
  ),
  collision: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <circle cx="28" cy="45" r="14" fill="rgba(47,245,255,0.12)" stroke="#2ff5ff" strokeWidth="1.5" />
      <circle cx="75" cy="45" r="14" fill="rgba(255,243,210,0.12)" stroke="#fff3d2" strokeWidth="1.5" />
      <line x1="42" y1="45" x2="58" y2="45" stroke="#ffd5cb" strokeWidth="1" strokeDasharray="2 1" strokeOpacity="0.6" />
      <line x1="9" y1="45" x2="22" y2="45" stroke="#2ff5ff" strokeWidth="1.5" markerEnd="url(#b)" />
      <text x="16" y="40" fill="#2ff5ff" fontSize="7" fontFamily="Space Grotesk">v₁</text>
      <text x="60" y="87" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">m₁v₁ + m₂v₂ = const</text>
    </svg>
  ),
  domino: (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      {[12,27,42,57,72,87].map((x, i) => (
        <rect
          key={i} x={x} y={i === 0 ? 38 : 48} width="10" height={i === 0 ? 30 : 24}
          rx="1" fill={`rgba(47,245,255,${0.08 + i*0.04})`} stroke="#2ff5ff" strokeWidth="1.2"
          transform={i === 0 ? `rotate(-15,${x+5},${38+15})` : ''}
        />
      ))}
      <line x1="5" y1="76" x2="105" y2="76" stroke="#3c494e" strokeWidth="1.5" />
      <text x="60" y="87" textAnchor="middle" fill="#3c494e" fontSize="7" fontFamily="Space Grotesk">Chain Reaction</text>
    </svg>
  ),
}

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'bg-primary/10',   text: 'text-primary',   border: 'border-primary/20'   },
  Intermediate: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  Advanced:     { bg: 'bg-tertiary/10',  text: 'text-tertiary',  border: 'border-tertiary/20'  },
}

const AUTHOR_COLORS = {
  primary:   'bg-primary/20 text-primary border-primary/25',
  secondary: 'bg-secondary/20 text-secondary border-secondary/25',
  tertiary:  'bg-tertiary/20 text-tertiary border-tertiary/25',
}

export default function ExperimentCard({ experiment, onLoad }) {
  const diff = DIFFICULTY_COLORS[experiment.difficulty] ?? DIFFICULTY_COLORS.Beginner

  return (
    <div className="group relative flex flex-col bg-surface-container-high/70 border border-white/[0.07] rounded-xl overflow-hidden hover:border-primary/25 hover:bg-surface-container-high transition-all duration-200 shadow-panel cursor-pointer">

      {/* ── Thumbnail ── */}
      <div className="h-32 bg-surface-container-lowest border-b border-white/[0.05] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Blueprint grid in thumbnail */}
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        <div className="relative w-full h-full">
          {THUMBS[experiment.svgPreview] ?? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-3xl">science</span>
            </div>
          )}
        </div>
        {/* Difficulty badge */}
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded border text-[8px] font-label font-bold uppercase tracking-widest ${diff.bg} ${diff.text} ${diff.border}`}>
          {experiment.difficulty}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Title + category */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
              {experiment.title}
            </h3>
            <span className="shrink-0 text-[8px] font-label text-zinc-600 uppercase tracking-widest mt-0.5">
              {experiment.category}
            </span>
          </div>
          <p className="text-[10px] font-body text-zinc-600 leading-snug line-clamp-2">
            {experiment.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {experiment.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-surface-container-lowest rounded text-[8px] font-label text-zinc-600 uppercase tracking-wider border border-outline-variant/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[9px] font-label text-zinc-700 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">category</span>
            {experiment.stats.bodies} bodies
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">link</span>
            {experiment.stats.joints} joints
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <span className="material-symbols-outlined text-xs">schedule</span>
            {experiment.stats.runtime}
          </span>
        </div>

        {/* Author + Load button */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] mt-auto">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-label font-semibold uppercase tracking-wider ${AUTHOR_COLORS[experiment.authorColor]}`}>
            <span className="material-symbols-outlined text-xs">account_circle</span>
            {experiment.author}
          </div>
          <button
            id={`load-${experiment.id}`}
            onClick={(e) => { e.stopPropagation(); onLoad(experiment) }}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary rounded-lg text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-150 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            Load
          </button>
        </div>
      </div>
    </div>
  )
}
