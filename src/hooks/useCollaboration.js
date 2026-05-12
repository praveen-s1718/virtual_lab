import { useEffect, useRef, useCallback } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '../services/socket'
import useSimulationStore from '../store/simulationStore'

const CURSOR_THROTTLE_MS = 50   // emit cursor max every 50ms
const BODIES_THROTTLE_MS = 200  // emit body state max every 200ms

export default function useCollaboration(containerRef, isShared) {
  const {
    labId, runState, setRunState,
    spawnBody, setRemoteCollaborators,
  } = useSimulationStore()

  const lastCursorEmit = useRef(0)
  const lastBodiesEmit = useRef(0)

  /* ── Connect on mount ── */
  useEffect(() => {
    if (!isShared) return

    const socket = connectSocket()

    /* Join room */
    socket.emit('join-room', {
      labId,
      user: { name: 'You', color: 'primary' },
    })

    /* Receive existing room state on join */
    socket.on('room-state', ({ users, runState: rs }) => {
      setRemoteCollaborators(users.filter((u) => u.id !== socket.id))
      if (rs && rs !== 'idle') setRunState(rs)
    })

    /* Another user joined / left */
    socket.on('users-updated', (users) => {
      setRemoteCollaborators(users.filter((u) => u.id !== socket.id))
    })

    /* Remote cursor moved */
    socket.on('cursor-updated', ({ socketId, cursor, action }) => {
      setRemoteCollaborators((prev) =>
        prev.map((u) =>
          u.id === socketId ? { ...u, cursor, action } : u,
        ),
      )
    })

    /* Remote body spawned */
    socket.on('body-spawned', ({ type, x, y }) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      spawnBody(type, rect.width * x, rect.height * y)
    })

    /* Remote run-state change */
    socket.on('run-state-updated', (rs) => setRunState(rs))

    /* Cleanup on unmount */
    return () => {
      socket.off('room-state')
      socket.off('users-updated')
      socket.off('cursor-updated')
      socket.off('body-spawned')
      socket.off('run-state-updated')
      disconnectSocket()
    }
  }, [labId, isShared]) // eslint-disable-line

  /* ── Broadcast local cursor ── */
  const emitCursor = useCallback(
    (e) => {
      if (!isShared) return
      const now = Date.now()
      if (now - lastCursorEmit.current < CURSOR_THROTTLE_MS) return
      lastCursorEmit.current = now

      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cursor = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top)  / rect.height,
      }
      getSocket().emit('cursor-move', { cursor, action: '' })
    },
    [containerRef, isShared],
  )

  /* ── Broadcast spawn to room ── */
  const emitSpawn = useCallback(
    (type, x, y) => {
      if (!isShared) return
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      getSocket().emit('spawn-body', {
        labId,
        type,
        x: x / rect.width,
        y: y / rect.height,
      })
    },
    [labId, containerRef, isShared],
  )

  /* ── Broadcast run-state change ── */
  useEffect(() => {
    if (!isShared) return
    getSocket().emit('run-state-change', { labId, runState })
  }, [runState, labId, isShared])

  return { emitCursor, emitSpawn }
}
