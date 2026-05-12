import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useSimulationStore from '../../store/simulationStore'
import { getEngine } from '../../physics/engineInstance'
import Matter from 'matter-js'

export default function ExperimentAnalytics() {
  const { activeExperimentConfig, runState } = useSimulationStore()
  const [data, setData] = useState([])
  const [energySummary, setEnergySummary] = useState(null)

  /* ── Collision event hooks for energy balance ── */
  useEffect(() => {
    if (activeExperimentConfig?.customUI !== 'collision') return
    const engine = getEngine()
    if (!engine) return

    let keBefore = null

    const computeKE = (body) => {
      const v = Matter.Vector.magnitude(body.velocity)
      const translational = 0.5 * body.mass * (v * v)
      const rotational = 0.5 * body.inertia * (body.angularVelocity * body.angularVelocity)
      return translational + rotational
    }

    const handleCollisionStart = (e) => {
      for (const pair of e.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label]
        if (labels.includes('SphereA') && labels.includes('SphereB')) {
          keBefore = computeKE(pair.bodyA) + computeKE(pair.bodyB)
        }
      }
    }

    const handleCollisionEnd = (e) => {
      for (const pair of e.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label]
        if (labels.includes('SphereA') && labels.includes('SphereB') && keBefore !== null) {
          setTimeout(() => {
            const keAfter = computeKE(pair.bodyA) + computeKE(pair.bodyB)
            const heat = keBefore - keAfter
            setEnergySummary({
              keBefore,
              keAfter,
              heat: Math.max(0, heat)
            })
            keBefore = null
          }, 80)
        }
      }
    }

    Matter.Events.on(engine, 'collisionStart', handleCollisionStart)
    Matter.Events.on(engine, 'collisionEnd', handleCollisionEnd)

    return () => {
      Matter.Events.off(engine, 'collisionStart', handleCollisionStart)
      Matter.Events.off(engine, 'collisionEnd', handleCollisionEnd)
    }
  }, [activeExperimentConfig])

  /* ── Continuous data collection ── */
  useEffect(() => {
    if (runState !== 'running' && runState !== 'slowmo') return
    if (!activeExperimentConfig) return

    const interval = setInterval(() => {
      const engine = getEngine()
      if (!engine) return

      const bodies = Matter.Composite.allBodies(engine.world)
      const t = Date.now()

      if (activeExperimentConfig.customUI === 'pendulum') {
        const bob = bodies.find(b => b.label === 'PendulumBob')
        const pivot = bodies.find(b => b.label === 'PendulumBeam')
        if (bob && pivot) {
          // Calculate angle from the vertical line below the pivot
          const dx = bob.position.x - pivot.position.x
          const dy = bob.position.y - pivot.position.y
          const theta = Math.atan2(dx, dy) * (180 / Math.PI)

          const v = Matter.Vector.magnitude(bob.velocity)
          const ropeLen = Math.sqrt(dx * dx + dy * dy) || 1
          const height = ropeLen - dy  // height above lowest point
          const ke = 0.5 * bob.mass * v * v
          const pe = bob.mass * 0.001 * height  // simplified PE

          setData(prev => [...prev, { time: t, angle: theta, ke, pe }].slice(-120))
        }
      } else if (activeExperimentConfig.customUI === 'collision') {
        const sphereA = bodies.find(b => b.label === 'SphereA')
        const sphereB = bodies.find(b => b.label === 'SphereB')
        if (sphereA && sphereB) {
          const vA = Matter.Vector.magnitude(sphereA.velocity)
          const vB = Matter.Vector.magnitude(sphereB.velocity)
          const keA = 0.5 * sphereA.mass * vA * vA + 0.5 * sphereA.inertia * sphereA.angularVelocity ** 2
          const keB = 0.5 * sphereB.mass * vB * vB + 0.5 * sphereB.inertia * sphereB.angularVelocity ** 2
          setData(prev => [...prev, { time: t, keA, keB, keTotal: keA + keB }].slice(-120))
        }
      } else if (activeExperimentConfig.customUI === 'spring') {
        const block = bodies.find(b => b.label === 'AttachedBlock')
        const wall = bodies.find(b => b.label === 'WallMount')
        if (block && wall) {
          // Displacement from the wall + offset
          const eqX = wall.position.x + 180
          const displacement = block.position.x - eqX
          const v = Matter.Vector.magnitude(block.velocity)
          setData(prev => [...prev, { time: t, x: displacement, v }].slice(-120))
        }
      } else if (activeExperimentConfig.customUI === 'incline') {
        const slider = bodies.find(b => b.label === 'SliderBlock')
        if (slider) {
          const v = Matter.Vector.magnitude(slider.velocity)
          const ke = 0.5 * slider.mass * v * v
          setData(prev => [...prev, { time: t, v, ke }].slice(-120))
        }
      } else if (activeExperimentConfig.customUI === 'projectile') {
        const proj = bodies.find(b => b.label === 'Projectile')
        const ground = bodies.find(b => b.label === 'GroundPlane')
        if (proj) {
          const groundY = ground ? ground.position.y : window.innerHeight * 0.88
          const h = Math.max(0, groundY - proj.position.y)
          const d = proj.position.x
          setData(prev => [...prev, { time: t, h, d }].slice(-120))
        }
      } else if (activeExperimentConfig.customUI === 'pulley') {
        const massA = bodies.find(b => b.label === 'HangingMassA')
        const massB = bodies.find(b => b.label === 'HangingMassB')
        if (massA && massB) {
          setData(prev => [...prev, {
            time: t,
            posA: massA.position.y,
            posB: massB.position.y,
            vA: massA.velocity.y,
            vB: massB.velocity.y
          }].slice(-120))
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [activeExperimentConfig, runState])

  // Clear data when experiment changes
  useEffect(() => {
    setData([])
    setEnergySummary(null)
  }, [activeExperimentConfig])

  if (!activeExperimentConfig) return null

  const renderChart = () => {
    const tooltipStyle = { backgroundColor: '#1c1b1b', border: '1px solid #333', fontSize: '10px' }

    switch (activeExperimentConfig.customUI) {
      case 'pendulum':
        return (
          <div className="w-full mt-4 flex flex-col gap-3">
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Angular Displacement (θ°)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[-90, 90]} hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="angle" stroke="#2ff5ff" dot={false} strokeWidth={2} isAnimationActive={false} name="θ (deg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">KE vs PE</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="ke" stroke="#4ade80" dot={false} strokeWidth={1.5} isAnimationActive={false} name="KE" />
                  <Line type="monotone" dataKey="pe" stroke="#f97316" dot={false} strokeWidth={1.5} isAnimationActive={false} name="PE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'collision':
        return (
          <div className="w-full mt-4 flex flex-col gap-4">
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Kinetic Energy (KE)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="keA" stroke="#38bdf8" dot={false} strokeWidth={2} isAnimationActive={false} name="Sphere A" />
                  <Line type="monotone" dataKey="keB" stroke="#f97316" dot={false} strokeWidth={2} isAnimationActive={false} name="Sphere B" />
                  <Line type="monotone" dataKey="keTotal" stroke="#4ade80" dot={false} strokeWidth={2} isAnimationActive={false} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#0c1829] border border-[#1e3a5f] rounded-lg p-3">
              <h4 className="text-[10px] font-bold uppercase text-[#38bdf8] mb-2 tracking-widest">Energy Balance</h4>
              {!energySummary ? (
                <div className="text-[10px] text-slate-500 text-center py-2">
                  Launch the balls to see energy analysis after collision
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1e3a5f] pb-1">
                    <span className="text-slate-400">KE Before</span>
                    <span className="font-bold text-slate-200">{energySummary.keBefore.toFixed(3)} J</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1e3a5f] pb-1">
                    <span className="text-slate-400">KE After</span>
                    <span className="font-bold text-slate-200">{energySummary.keAfter.toFixed(3)} J</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1e3a5f] pb-1">
                    <span className="text-slate-400">Heat Lost (ΔKE)</span>
                    <span className={`font-bold ${energySummary.heat > 0.05 ? 'text-orange-400' : 'text-green-400'}`}>
                      {energySummary.heat.toFixed(3)} J
                    </span>
                  </div>
                  <div className="mt-1 text-[9px] text-slate-500 text-center">
                    {energySummary.heat < 0.05
                      ? "✅ Nearly elastic — kinetic energy conserved"
                      : `⚡ Inelastic — ${((energySummary.heat / energySummary.keBefore) * 100).toFixed(1)}% energy lost`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'spring':
        return (
          <div className="w-full mt-4 flex flex-col gap-3">
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Displacement (x) from equilibrium</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="x" stroke="#ffb703" dot={false} strokeWidth={2} isAnimationActive={false} name="x (px)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Speed (|v|)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="v" stroke="#2ff5ff" dot={false} strokeWidth={1.5} isAnimationActive={false} name="|v|" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'incline':
        return (
          <div className="w-full mt-4 flex flex-col gap-3">
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Speed (|v|)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="v" stroke="#a855f7" dot={false} strokeWidth={2} isAnimationActive={false} name="|v|" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Kinetic Energy</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="ke" stroke="#4ade80" dot={false} strokeWidth={1.5} isAnimationActive={false} name="KE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'projectile':
        return (
          <div className="h-40 w-full mt-4">
            <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Height vs Distance</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="d" hide />
                <YAxis dataKey="h" hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="h" stroke="#ff0055" dot={false} strokeWidth={2} isAnimationActive={false} name="Height" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )

      case 'pulley':
        return (
          <div className="w-full mt-4 flex flex-col gap-3">
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Position Y</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="posA" stroke="#2ff5ff" dot={false} strokeWidth={2} isAnimationActive={false} name="Mass A" />
                  <Line type="monotone" dataKey="posB" stroke="#f43f5e" dot={false} strokeWidth={2} isAnimationActive={false} name="Mass B" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-36">
              <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Velocity Y</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="vA" stroke="#2ff5ff" dot={false} strokeWidth={1.5} isAnimationActive={false} name="Mass A (v)" />
                  <Line type="monotone" dataKey="vB" stroke="#f43f5e" dot={false} strokeWidth={1.5} isAnimationActive={false} name="Mass B (v)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-4 bg-surface-container/50 border-t border-outline-variant/20">
      <h3 className="text-sm font-headline font-bold text-on-surface">Lab Analytics</h3>
      {renderChart()}
    </div>
  )
}
