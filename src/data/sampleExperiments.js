/**
 * Pre-built physics experiment templates.
 * Custom built for Educational Labs.
 *
 * Coordinate convention:
 *   x, y  — fraction of canvas (0..1)
 *   px, py — pixel offset added after fraction
 */
export const EXPERIMENTS = [
  /* ═══════════════════════════════════════════════════════════
   * 1. SIMPLE PENDULUM
   * A roof beam at the top, a weighted bob hanging from a rope
   * constraint. The bob starts at ~30° from vertical so it
   * swings immediately when the user presses RUN.
   * ═══════════════════════════════════════════════════════════ */
  {
    id: 'exp-pendulum',
    title: 'Simple Pendulum Lab',
    author: 'System',
    authorColor: 'primary',
    category: 'Oscillations',
    difficulty: 'Beginner',
    tags: ['gravity', 'periodic', 'swing'],
    description: 'A classic simple pendulum demonstrating periodic motion, gravitational potential energy, and conservation principles.',
    bodies: [
      { id: 'beam', type: 'roof', x: 0.5, y: 0.15, label: 'PendulumBeam' },
      { id: 'bob', type: 'sphere', x: 0.5, px: -125, y: 0.15, py: 216.5, label: 'PendulumBob', props: { mass: 5, radius: 20, frictionAir: 0.005 } },
    ],
    locks: [
      { type: 'freeze', bodyId: 'beam' }
    ],
    joints: [
      { type: 'rope', bodyIdA: 'beam', bodyIdB: 'bob' }
    ],
    svgPreview: 'pendulum',
    stats: { bodies: 2, joints: 1, runtime: 'Live' },
    customUI: 'pendulum'
  },

  /* ═══════════════════════════════════════════════════════════
   * 2. PROJECTILE MOTION
   * A static cannon (rectangle barrel) on the left and a
   * floor at the bottom. The ExperimentControls "FIRE" button
   * spawns a projectile sphere at the tip.
   * ═══════════════════════════════════════════════════════════ */
  {
    id: 'exp-projectile',
    title: 'Projectile Motion Simulator',
    author: 'System',
    authorColor: 'secondary',
    category: 'Kinematics',
    difficulty: 'Intermediate',
    tags: ['trajectory', 'velocity', 'parabola'],
    description: 'Analyze parabolic trajectories under gravitational influence. Adjust launch angle and initial velocity.',
    bodies: [],
    locks: [],
    joints: [],
    svgPreview: 'projectile',
    stats: { bodies: 2, joints: 0, runtime: 'Live' },
    customUI: 'projectile'
  },

  /* ═══════════════════════════════════════════════════════════
   * 3. PULLEY / ATWOOD MACHINE
   * Static pulley wheel at top centre. Two hanging masses
   * positioned directly below each side of the wheel so the
   * custom Atwood sync in beforeUpdate works immediately.
   * ═══════════════════════════════════════════════════════════ */
  {
    id: 'exp-pulley',
    title: 'Pulley & Weight System',
    author: 'System',
    authorColor: 'tertiary',
    category: 'Mechanics',
    difficulty: 'Intermediate',
    tags: ['tension', 'mass', 'acceleration'],
    description: 'Two hanging masses connected by a rope over a fixed pulley (Atwood machine). Measure tension and acceleration.',
    bodies: [],
    locks: [],
    joints: [],
    svgPreview: 'truss',
    stats: { bodies: 3, joints: 0, runtime: 'Live' },
    customUI: 'pulley'
  },

  /* ═══════════════════════════════════════════════════════════
   * 4. COLLISION & MOMENTUM LAB
   * Two spheres on a flat track surface. Forces are applied
   * inward by the "Collide" button. Energy balance is tracked.
   * ═══════════════════════════════════════════════════════════ */
  {
    id: 'exp-collision',
    title: 'Collision & Momentum Lab',
    author: 'System',
    authorColor: 'primary',
    category: 'Collisions',
    difficulty: 'Intermediate',
    tags: ['elastic', 'inelastic', 'momentum'],
    description: 'Two spheres of different mass on the ground surface collide. Observe energy transfer, momentum conservation, and heat loss.',
    bodies: [
      { id: 'sphereA', type: 'sphere', x: 0.25, y: 1.0, py: -22, label: 'SphereA', props: { mass: 3, radius: 22, friction: 0.001, frictionAir: 0.001, restitution: 1.0 } },
      { id: 'sphereB', type: 'sphere', x: 0.75, y: 1.0, py: -35, label: 'SphereB', props: { mass: 8, radius: 35, friction: 0.001, frictionAir: 0.001, restitution: 1.0 } },
    ],
    locks: [],
    joints: [],
    svgPreview: 'collision',
    stats: { bodies: 2, joints: 0, runtime: 'Live' },
    customUI: 'collision'
  },

  /* ═══════════════════════════════════════════════════════════
   * 5. SPRING / SIMPLE HARMONIC MOTION
   * Visible wall on the left, a wide floor, and a block
   * connected by a spring. The block sits on the floor and
   * the spring drives SHM.
   * ═══════════════════════════════════════════════════════════ */
  {
    id: 'exp-spring',
    title: 'Spring & Harmonic Motion Lab',
    author: 'System',
    authorColor: 'secondary',
    category: 'Oscillations',
    difficulty: 'Advanced',
    tags: ['spring', 'SHM', 'Hookes Law'],
    description: 'A block suspended by a spring from a high surface. Observe amplitude, frequency, and harmonic motion.',
    bodies: [
      { id: 'ceiling', type: 'roof',  x: 0.5, y: 0.15, label: 'Ceiling' },
      { id: 'block',   type: 'block', x: 0.5, y: 0.15, py: 150, label: 'OscillatingBlock', props: { mass: 8, frictionAir: 0.002 } }
    ],
    locks: [
      { type: 'freeze', bodyId: 'ceiling' },
      { type: 'axis-x', bodyId: 'block' }
    ],
    joints: [
      { type: 'spring', bodyIdA: 'ceiling', bodyIdB: 'block', offsetA: { x: 0, y: 20 }, offsetB: { x: 0, y: -29 } }
    ],
    svgPreview: 'spring',
    stats: { bodies: 2, joints: 1, runtime: 'Live' },
    customUI: 'spring'
  },

  /* ═══════════════════════════════════════════════════════════
   * 6. INCLINED PLANE & FRICTION
   * A large static ramp triangle with a block placed near its
   * top. Gravity pulls the block down the slope; friction
   * opposes the motion.
   * ═══════════════════════════════════════════════════════════ */
  {
    id: 'exp-incline',
    title: 'Inclined Plane & Friction',
    author: 'System',
    authorColor: 'tertiary',
    category: 'Mechanics',
    difficulty: 'Advanced',
    tags: ['friction', 'slope', 'normal force'],
    description: 'A large ramp with a sliding block. Explore friction coefficients and force vector decomposition.',
    bodies: [],
    locks: [],
    joints: [],
    svgPreview: 'incline',
    stats: { bodies: 2, joints: 0, runtime: 'Live' },
    customUI: 'incline'
  }
]

export const CATEGORIES = ['All', ...new Set(EXPERIMENTS.map((e) => e.category))]
export const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']
