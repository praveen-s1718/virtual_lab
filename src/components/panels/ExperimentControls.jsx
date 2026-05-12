import { useState, useEffect } from 'react'
import useSimulationStore from '../../store/simulationStore'
import { getEngine } from '../../physics/engineInstance'
import Matter from 'matter-js'

export default function ExperimentControls() {
  const { activeExperimentConfig } = useSimulationStore()
  const [engineUpdateTick, setEngineUpdateTick] = useState(0)
  const [angleInputText, setAngleInputText] = useState(null)

  // Force re-render periodically to stay in sync with the physics engine
  useEffect(() => {
    const interval = setInterval(() => setEngineUpdateTick(t => t + 1), 500)
    return () => clearInterval(interval)
  }, [])

  if (!activeExperimentConfig || !activeExperimentConfig.customUI) return null

  const engine = getEngine()
  const bodies = engine ? Matter.Composite.allBodies(engine.world) : []
  const constraints = engine ? Matter.Composite.allConstraints(engine.world) : []

  const updateBodyMass = (label, mass) => {
    const body = bodies.find(b => b.label === label)
    if (body) Matter.Body.setMass(body, mass)
  }

  /* ──────────────────── PENDULUM ──────────────────── */
  const renderPendulumControls = () => {
    const bob = bodies.find(b => b.label === 'PendulumBob')
    const beam = bodies.find(b => b.label === 'PendulumBeam')
    // Find the rope constraint connecting beam to bob
    const ropeConstraint = constraints.find(c =>
      (c.bodyA === beam && c.bodyB === bob) ||
      (c.bodyA === bob && c.bodyB === beam)
    )

    const currentLength = ropeConstraint ? Math.round(ropeConstraint.length) : 250
    const currentMass = bob ? bob.mass : 5
    const currentDamping = bob ? bob.frictionAir : 0.005

    // Calculate current angle from vertical
    const dx = bob && beam ? bob.position.x - beam.position.x : 0
    const dy = bob && beam ? bob.position.y - beam.position.y : 1
    const currentAngleRad = Math.atan2(dx, dy)
    const currentAngleDeg = bob && beam ? Math.round(currentAngleRad * (180 / Math.PI)) : 30
    
    // We only want to adjust initial angle when idle
    const isRunning = useSimulationStore(state => state.runState) !== 'idle'

    return (
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Pendulum Controls</h3>

        <div className="flex items-center justify-between">
          <label className="text-[10px] text-zinc-400">Initial Angle (°)</label>
          <input
            type="number"
            className="w-16 bg-surface text-[10px] text-on-surface border border-outline-variant rounded px-2 py-1 focus:outline-none focus:border-primary disabled:opacity-50"
            value={currentAngleDeg}
            disabled={isRunning}
            onChange={(e) => {
              const val = e.target.value
              if (val === '' || isNaN(val)) return
              const newAngleDeg = parseInt(val)
              const newAngleRad = newAngleDeg * (Math.PI / 180)
              if (bob && beam) {
                const ropeLen = ropeConstraint ? ropeConstraint.length : 250
                const newX = beam.position.x + Math.sin(newAngleRad) * ropeLen
                const newY = beam.position.y + Math.cos(newAngleRad) * ropeLen
                Matter.Body.setPosition(bob, { x: newX, y: newY })
                Matter.Body.setVelocity(bob, { x: 0, y: 0 })
                Matter.Body.setAngularVelocity(bob, 0)
              }
            }}
          />
        </div>

        <label className="text-[10px] text-zinc-400">Rope Length: {currentLength} px</label>
        <input
          type="range" min="100" max="400" value={currentLength}
          onChange={(e) => {
            const newLen = parseInt(e.target.value)
            if (ropeConstraint) ropeConstraint.length = newLen
            // Reposition bob to preserve current angle
            if (bob && beam) {
              const newX = beam.position.x + Math.sin(currentAngleRad) * newLen
              const newY = beam.position.y + Math.cos(currentAngleRad) * newLen
              Matter.Body.setPosition(bob, { x: newX, y: newY })
              Matter.Body.setVelocity(bob, { x: 0, y: 0 })
            }
          }}
        />
        <label className="text-[10px] text-zinc-400">Bob Mass: {currentMass.toFixed(1)} kg</label>
        <input
          type="range" min="1" max="50"
          value={currentMass}
          onChange={(e) => updateBodyMass('PendulumBob', parseFloat(e.target.value))}
        />
        <label className="text-[10px] text-zinc-400">Air Resistance: {currentDamping.toFixed(3)}</label>
        <input
          type="range" min="0" max="0.1" step="0.005"
          value={currentDamping}
          onChange={(e) => { if (bob) bob.frictionAir = parseFloat(e.target.value) }}
        />

        <div className="text-[9px] text-zinc-600 leading-relaxed border-t border-white/5 pt-2">
          Adjust the initial angle and rope length, then press <b>RUN ▶</b>. The bob swings from its initial angle. Period T = 2π√(L/g) depends only on rope length, not mass.
        </div>
      </div>
    )
  }

  /* ──────────────────── PROJECTILE ──────────────────── */
  const renderProjectileControls = () => {
    const cannon = bodies.find(b => b.label === 'Launcher')
    const [angle, setAngle] = useState(45)
    const [speed, setSpeed] = useState(20)

    const handleFire = () => {
      if (!cannon || !engine) return
      const rad = angle * (Math.PI / 180)
      // Spawn projectile at the tip of the barrel
      const barrelLen = 50  // half the cannon width
      const px = cannon.position.x + Math.cos(-rad) * barrelLen
      const py = cannon.position.y + Math.sin(-rad) * barrelLen
      const proj = Matter.Bodies.circle(px, py, 12, {
        restitution: 0.4, friction: 0.2, frictionAir: 0.01, label: 'Projectile',
        render: { fillStyle: 'rgba(255, 0, 85, 0.5)', strokeStyle: '#ff0055', lineWidth: 2 }
      })
      proj.appliedForces = []
      Matter.Body.setVelocity(proj, {
        x: Math.cos(-rad) * speed * 0.5,
        y: Math.sin(-rad) * speed * 0.5
      })
      Matter.Composite.add(engine.world, proj)
    }

    return (
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Projectile Controls</h3>
        <label className="text-[10px] text-zinc-400">Launch Angle: {angle}°</label>
        <input
          type="range" min="5" max="85" value={angle}
          onChange={(e) => {
            const a = parseInt(e.target.value)
            setAngle(a)
            if (cannon) Matter.Body.setAngle(cannon, -a * (Math.PI / 180))
          }}
        />
        <label className="text-[10px] text-zinc-400">Initial Speed: {speed} m/s</label>
        <input type="range" min="5" max="50" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} />
        <button onClick={handleFire} className="py-2 bg-secondary text-on-secondary rounded font-bold text-xs">
          🚀 FIRE
        </button>
        <button
          onClick={() => {
            // Remove all projectiles
            if (!engine) return
            const projs = Matter.Composite.allBodies(engine.world).filter(b => b.label === 'Projectile')
            projs.forEach(p => Matter.Composite.remove(engine.world, p))
          }}
          className="py-2 border border-outline-variant text-zinc-400 rounded font-bold text-xs hover:bg-white/5"
        >
          Clear Projectiles
        </button>
      </div>
    )
  }

  /* ──────────────────── PULLEY ──────────────────── */
  const renderPulleyControls = () => {
    const massA = bodies.find(b => b.label === 'HangingMassA')
    const massB = bodies.find(b => b.label === 'HangingMassB')

    return (
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-tertiary">Pulley Controls</h3>
        <label className="text-[10px] text-zinc-400">Mass A: {massA ? massA.mass.toFixed(1) : '-'} kg</label>
        <input type="range" min="1" max="80" step="1" value={massA ? massA.mass : 10} onChange={(e) => updateBodyMass('HangingMassA', parseFloat(e.target.value))} />
        <label className="text-[10px] text-zinc-400">Mass B: {massB ? massB.mass.toFixed(1) : '-'} kg</label>
        <input type="range" min="1" max="80" step="1" value={massB ? massB.mass : 10} onChange={(e) => updateBodyMass('HangingMassB', parseFloat(e.target.value))} />
        <div className="text-[9px] text-zinc-600 mt-1 leading-relaxed">
          Make masses unequal and press RUN. The heavier side accelerates downward.
          <br/>a = g(m₂ − m₁) / (m₁ + m₂)
        </div>
      </div>
    )
  }

  /* ──────────────────── COLLISION ──────────────────── */
  const renderCollisionControls = () => {
    const sphereA = bodies.find(b => b.label === 'SphereA')
    const sphereB = bodies.find(b => b.label === 'SphereB')
    const ground = bodies.find(b => b.label === 'ground')
    const [speedA, setSpeedA] = useState(8)
    const [speedB, setSpeedB] = useState(6)
    const [airDrag, setAirDrag] = useState(0.01)
    const [surfaceFriction, setSurfaceFriction] = useState(0.05)
    const [restitution, setRestitution] = useState(0.85)

    // Store _pushSpeed on bodies so physics engine can read them on RUN
    useEffect(() => {
      if (sphereA) sphereA._pushSpeed = speedA
      if (sphereB) sphereB._pushSpeed = -speedB  // negative = leftward
    }, [sphereA, sphereB, speedA, speedB])

    // Apply physics params dynamically to both spheres AND the ground
    useEffect(() => {
      if (sphereA) {
        sphereA.frictionAir = airDrag
        sphereA.friction = surfaceFriction
        sphereA.frictionStatic = surfaceFriction * 1.3
        sphereA.restitution = restitution
      }
      if (sphereB) {
        sphereB.frictionAir = airDrag
        sphereB.friction = surfaceFriction
        sphereB.frictionStatic = surfaceFriction * 1.3
        sphereB.restitution = restitution
      }
      if (ground) {
        ground.friction = surfaceFriction
        ground.frictionStatic = surfaceFriction * 1.3
      }
    }, [sphereA, sphereB, ground, airDrag, surfaceFriction, restitution])

    const radiusA = sphereA?.circleRadius || 22
    const radiusB = sphereB?.circleRadius || 35
    const groundTopY = ground ? ground.position.y - 25 : window.innerHeight

    return (
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Collision Controls</h3>

        {/* ── Sphere A ── */}
        <div className="bg-[#0c1929] border border-[#1e3a5f] rounded-lg p-2.5">
          <div className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest mb-2">Sphere A (r={radiusA}px)</div>
          <label className="text-[10px] text-zinc-400">Mass: {sphereA ? sphereA.mass.toFixed(1) : '-'} kg</label>
          <input type="range" min="1" max="30" step="0.5" value={sphereA ? sphereA.mass : 3} onChange={(e) => updateBodyMass('SphereA', parseFloat(e.target.value))} />
          <label className="text-[10px] text-zinc-400">Initial Speed → : {speedA} m/s</label>
          <input type="range" min="1" max="20" value={speedA} onChange={(e) => setSpeedA(parseInt(e.target.value))} />
        </div>

        {/* ── Sphere B ── */}
        <div className="bg-[#1a0f0a] border border-[#5f3a1e] rounded-lg p-2.5">
          <div className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest mb-2">Sphere B (r={radiusB}px)</div>
          <label className="text-[10px] text-zinc-400">Mass: {sphereB ? sphereB.mass.toFixed(1) : '-'} kg</label>
          <input type="range" min="1" max="50" step="0.5" value={sphereB ? sphereB.mass : 8} onChange={(e) => updateBodyMass('SphereB', parseFloat(e.target.value))} />
          <label className="text-[10px] text-zinc-400">Initial Speed ← : {speedB} m/s</label>
          <input type="range" min="1" max="20" value={speedB} onChange={(e) => setSpeedB(parseInt(e.target.value))} />
        </div>

        {/* ── Shared Physics ── */}
        <div className="border-t border-white/10 pt-3">
          <label className="text-[10px] text-zinc-400">Surface Friction (μ): {surfaceFriction.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.05" value={surfaceFriction} onChange={(e) => setSurfaceFriction(parseFloat(e.target.value))} />
        </div>

        <div>
          <label className="text-[10px] text-zinc-400">Air Drag: {airDrag.toFixed(3)}</label>
          <input type="range" min="0" max="0.1" step="0.005" value={airDrag} onChange={(e) => setAirDrag(parseFloat(e.target.value))} />
        </div>

        <div>
          <label className="text-[10px] text-zinc-400">Restitution (e): {restitution.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.05" value={restitution} onChange={(e) => setRestitution(parseFloat(e.target.value))} />
          <div className="text-[9px] text-zinc-600 mt-0.5">
            {restitution >= 0.95 ? '🟢 Elastic' : restitution >= 0.5 ? '🟡 Partially inelastic' : '🔴 Highly inelastic'}
          </div>
        </div>

        {/* ── Reset only ── */}
        <button
          onClick={() => {
            if (sphereA) { Matter.Body.setPosition(sphereA, { x: window.innerWidth * 0.28, y: groundTopY - radiusA }); Matter.Body.setVelocity(sphereA, { x: 0, y: 0 }); Matter.Body.setAngularVelocity(sphereA, 0) }
            if (sphereB) { Matter.Body.setPosition(sphereB, { x: window.innerWidth * 0.72, y: groundTopY - radiusB }); Matter.Body.setVelocity(sphereB, { x: 0, y: 0 }); Matter.Body.setAngularVelocity(sphereB, 0) }
          }}
          className="py-2 border border-outline-variant text-zinc-400 rounded font-bold text-xs hover:bg-white/5"
        >
          Reset Positions
        </button>

        <div className="text-[9px] text-zinc-600 leading-relaxed border-t border-white/5 pt-2">
          Configure mass, speed and friction, then press <b>RUN ▶</b>. Both spheres launch toward each other, collide, and redistribute energy based on <b>restitution (e)</b>. They decelerate via surface friction.
        </div>
      </div>
    )
  }

  /* ──────────────────── SPRING / SHM ──────────────────── */
  const renderSpringControls = () => {
    const block = bodies.find(b => b.label === 'OscillatingBlock')
    const wallBody = bodies.find(b => b.label === 'Ceiling')
    const constraint = constraints.find(c =>
      (c.bodyA === wallBody && c.bodyB === block) ||
      (c.bodyA === block && c.bodyB === wallBody)
    )

    const currentStiffness = constraint ? constraint.stiffness : 0.02
    const currentMass = block ? block.mass : 5

    return (
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Spring Controls</h3>
        <label className="text-[10px] text-zinc-400">Spring Stiffness (k): {currentStiffness.toFixed(3)}</label>
        <input
          type="range" min="0.005" max="0.1" step="0.005"
          value={currentStiffness}
          onChange={(e) => { if (constraint) constraint.stiffness = parseFloat(e.target.value) }}
        />
        <label className="text-[10px] text-zinc-400">Block Mass: {currentMass.toFixed(1)} kg</label>
        <input type="range" min="1" max="50" value={currentMass} onChange={(e) => updateBodyMass('OscillatingBlock', parseFloat(e.target.value))} />

        <label className="text-[10px] text-zinc-400">Damping (Air Friction): {block ? block.frictionAir.toFixed(3) : '-'}</label>
        <input
          type="range" min="0" max="0.1" step="0.005"
          value={block ? block.frictionAir : 0.01}
          onChange={(e) => { if (block) block.frictionAir = parseFloat(e.target.value) }}
        />

        <button
          onClick={() => {
            if (block && wallBody) {
              // Pull the block 150px down from equilibrium and release
              const eqY = wallBody.position.y + 100 // approximate equilibrium
              Matter.Body.setPosition(block, { x: block.position.x, y: eqY + 150 })
              Matter.Body.setVelocity(block, { x: 0, y: 0 })
            }
          }}
          className="py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded font-bold text-xs hover:bg-secondary/30"
        >
          Pull & Release
        </button>
      </div>
    )
  }

  /* ──────────────────── INCLINE ──────────────────── */
  const renderInclineControls = () => {
    const ramp = bodies.find(b => b.label === 'InclinedPlane')
    const slider = bodies.find(b => b.label === 'SliderBlock')

    return (
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-tertiary">Incline Controls</h3>
        <label className="text-[10px] text-zinc-400">Slider Mass: {slider ? slider.mass.toFixed(1) : '-'} kg</label>
        <input type="range" min="1" max="50" value={slider ? slider.mass : 5} onChange={(e) => updateBodyMass('SliderBlock', parseFloat(e.target.value))} />

        <label className="text-[10px] text-zinc-400">Surface Friction (μ): {slider ? slider.friction.toFixed(2) : '-'}</label>
        <input
          type="range" min="0" max="1" step="0.05"
          value={slider ? slider.friction : 0.3}
          onChange={(e) => {
            const f = parseFloat(e.target.value)
            if (slider) { slider.friction = f; slider.frictionStatic = f * 1.2 }
            if (ramp) { ramp.friction = f; ramp.frictionStatic = f * 1.2 }
          }}
        />

        <button
          onClick={() => {
            // Place slider back on the top of the ramp
            if (slider && ramp) {
              const topX = ramp.position.x - 40
              const topY = ramp.position.y - 80
              Matter.Body.setPosition(slider, { x: topX, y: topY })
              Matter.Body.setVelocity(slider, { x: 0, y: 0 })
              Matter.Body.setAngularVelocity(slider, 0)
              Matter.Body.setAngle(slider, 0)
            }
          }}
          className="py-2 bg-tertiary/20 text-tertiary border border-tertiary/30 rounded font-bold text-xs hover:bg-tertiary/30"
        >
          Reset Slider to Top
        </button>

        <div className="text-[9px] text-zinc-600 mt-1 leading-relaxed">
          Place the block on the ramp and press RUN. Gravity will pull it down the slope. Adjust friction to control sliding.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low">
      {activeExperimentConfig.customUI === 'pendulum' && renderPendulumControls()}
      {activeExperimentConfig.customUI === 'projectile' && renderProjectileControls()}
      {activeExperimentConfig.customUI === 'pulley' && renderPulleyControls()}
      {activeExperimentConfig.customUI === 'collision' && renderCollisionControls()}
      {activeExperimentConfig.customUI === 'spring' && renderSpringControls()}
      {activeExperimentConfig.customUI === 'incline' && renderInclineControls()}
    </div>
  )
}
