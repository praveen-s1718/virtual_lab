import { create } from 'zustand'

const loadSharedProjects = () => {
  try {
    const saved = localStorage.getItem('virtualLab_sharedProjects')
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    return []
  }
}

const saveSharedProjects = (projects) => {
  try {
    localStorage.setItem('virtualLab_sharedProjects', JSON.stringify(projects))
  } catch (e) {}
}

const useSimulationStore = create((set, get) => ({
  // ── Landing page gate ──
  showLanding: true,
  dismissLanding: () => set({ showLanding: false }),

  // ── Side Nav active tool tab ──
  activeTab: 'objects',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Simulation run state ──
  runState: 'idle',
  setRunState: (s) => set({ runState: s }),

  // ── Lab metadata ──
  labId: 'Physics-201',

  // ── Pending experiment loader ──
  pendingExperiment: null,
  setPendingExperiment: (exp) => set({ pendingExperiment: exp, activeExperimentConfig: exp }),
  activeExperimentConfig: null,
  setActiveExperimentConfig: (exp) => set({ activeExperimentConfig: exp }),

  // ── Active nav page ──
  activePage: 'local-canvas',
  setActivePage: (page) => {
    set((state) => ({ 
      activePage: page,
      // Clear active shared project if navigating away from shared-canvas
      activeSharedProjectId: page === 'shared-canvas' ? state.activeSharedProjectId : null
    }))
  },

  // ── Shared Projects Data ──
  sharedProjects: loadSharedProjects(),
  activeSharedProjectId: null,
  addSharedProject: (title) => set((state) => {
    const id = `project-${Date.now()}`
    const newProject = { id, title, createdAt: Date.now() }
    const updated = [newProject, ...state.sharedProjects]
    saveSharedProjects(updated)
    return { sharedProjects: updated, activeSharedProjectId: id, labId: id }
  }),
  openSharedProject: (id) => set({ activeSharedProjectId: id, labId: id }),
  closeSharedProject: () => set({ activeSharedProjectId: null }),
  deleteSharedProject: (id) => set((state) => {
    const updated = state.sharedProjects.filter(p => p.id !== id)
    saveSharedProjects(updated)
    return { sharedProjects: updated }
  }),

  // ── Active Interactive Tool ──
  // format: { category: 'joint' | 'lock' | 'force', type: string }
  activeTool: null,
  setActiveTool: (tool) => set({ activeTool: tool, selectedBody: null }),

  // ── Global Physical Forces ──
  gravityScale: 1.0,
  setGravityScale: (v) => set({ gravityScale: v }),

  groundFriction: 0.1, // Kinetic sliding friction
  setGroundFriction: (v) => set({ groundFriction: v }),

  staticFriction: 0.5, // The threshold limit to start moving
  setStaticFriction: (v) => set({ staticFriction: v }),

  activeForceTool: null, // 'wind', 'thrust', 'explosion', 'manual'
  setActiveForceTool: (tool) => set({ activeForceTool: tool }),

  manualForceVector: { i: 10.0, j: 0.0 },
  setManualForceVector: (vec) => set({ manualForceVector: vec }),
  
  // ── First body selected during multi-step tool use ──
  selectedBody: null,
  setSelectedBody: (bodyObj) => set({ selectedBody: bodyObj }),

  // ── Explicit cancel for aborted tool usage ──
  clearToolState: () => set({ activeTool: null, selectedBody: null }),

  // ── Object/Constraint currently selected for Inspector ──
  inspectedEntity: null,
  setInspectedEntity: (entity) => set({ inspectedEntity: entity }),
  
  // ── Physics body bridges ──
  addBodyFn: null,
  setAddBodyFn: (fn) => set({ addBodyFn: fn }),
  spawnBody: (type, x, y) => {
    const fn = get().addBodyFn
    if (fn) fn(type, x, y)
  },

  // ── Physics addJoint bridge ──
  addJointFn: null,
  setAddJointFn: (fn) => set({ addJointFn: fn }),
  spawnJoint: (type, x, y) => {
    const fn = get().addJointFn
    if (fn) fn(type, x, y)
  },

  // ── Physics removeEntity bridge ──
  removeEntityFn: null,
  setRemoveEntityFn: (fn) => set({ removeEntityFn: fn }),
  removeEntity: (type, entity) => {
    const fn = get().removeEntityFn
    if (fn) fn(type, entity)
  },

  // ── Static collaborator avatars in TopBar (always shown) ──
  collaborators: [
    {
      id: 'anjali', name: 'Anjali', color: 'primary',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkiIo6FwmrXfuUlmxdKU5ixdZPHPn57BBnt6U43255E6KX0outdPWVGtDis5wAQb1_81HvY47EXjxkCsbPy9pBaguN0NPh3gLmUgiywxLRSLXX38heSsm0-OEoS8OiUJYLqOryoUPqYgS4vCuYNbvjfcvHdhCavY02DfzQkiHfAkEsiJkM5dzterdnntsbwlWc7mUDqs9YbcLr6ZYXuPRxN25GT-Hu3JPX1fxJS7hRed1XW5d5FZsRXUNR8VZJfO3wqqkzcllWAO3M',
    },
    {
      id: 'dev', name: 'Dev', color: 'secondary',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDONNun76DiHthUVmmOYoUk1AY0j8fOcdlyZrFOG_E1FLVz7iem8_SywUnKieihqhKYXHAPOHBadSaaDn9YzD78TyWGSs7JzXkaPMoPAxYmXdpF9oafaWAhRRqrA1OFk0KCDVxbXYIHtqk2ONjxErG7ROwlUllep_vUGbBXfk9doQW4Mio6ulF-Vr-p5s6YNgEg2Zr7GuqQK6GXaIPRGALwXCUEfxjKhRaVBfbMkyeYsgBOB9VfWvsXmQRhxKsguhG2SkbU-f85RPwD',
    },
  ],

  // ── Remote collaborators from socket (live cursor positions) ──
  remoteCollaborators: [],
  setRemoteCollaborators: (usersOrUpdater) =>
    set((state) => ({
      remoteCollaborators:
        typeof usersOrUpdater === 'function'
          ? usersOrUpdater(state.remoteCollaborators)
          : usersOrUpdater,
    })),

  // ── Socket connection status ──
  socketConnected: false,
  setSocketConnected: (v) => set({ socketConnected: v }),

  // ── Master Reset Action ──
  resetSimulation: () => set({
    runState: 'idle',
    activeTool: null,
    activeForceTool: null,
    selectedBody: null,
    inspectedEntity: null,
    gravityScale: 1.0,
    groundFriction: 0.1,
    staticFriction: 0.5,
    manualForceVector: { i: 10.0, j: 0.0 }
  }),
}))

export default useSimulationStore