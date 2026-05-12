const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const rooms      = require('./rooms')

const PORT = process.env.PORT ?? 4000

const app    = express()
const server = http.createServer(app)

/* ── CORS: allow Vite dev server ── */
const io = new Server(server, {
  cors: {
    origin:  ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.get('/health', (_, res) => res.json({ status: 'ok', rooms: io.sockets.adapter.rooms.size }))

/* ──────────────── Socket Events ──────────────── */
io.on('connection', (socket) => {
  console.log(`[+] connected: ${socket.id}`)

  /* ── Join a lab room ── */
  socket.on('join-room', ({ labId, user }) => {
    socket.join(labId)
    const room = rooms.joinRoom(labId, socket.id, user ?? {})

    // Send current room state back to the joiner
    socket.emit('room-state', {
      users:    rooms.getRoomUsers(labId),
      bodies:   room.bodies,
      runState: room.runState,
    })

    // Broadcast new user list to other members
    socket.to(labId).emit('users-updated', rooms.getRoomUsers(labId))

    console.log(`[→] ${socket.id} joined room ${labId} (${room.users.size} users)`)
  })

  /* ── Cursor movement (throttled client-side to ~50ms) ── */
  socket.on('cursor-move', ({ cursor, action }) => {
    const room = rooms.updateCursor(socket.id, cursor, action)
    if (!room) return
    socket.to(room.labId).emit('cursor-updated', {
      socketId: socket.id,
      cursor,
      action,
    })
  })

  /* ── Body state broadcast (host → room) ── */
  socket.on('bodies-update', ({ labId, bodies }) => {
    rooms.updateBodies(labId, bodies)
    socket.to(labId).emit('bodies-updated', bodies)
  })

  /* ── Spawn a body (from any user) ── */
  socket.on('spawn-body', ({ labId, type, x, y }) => {
    socket.to(labId).emit('body-spawned', { type, x, y, by: socket.id })
  })

  /* ── Run state sync ── */
  socket.on('run-state-change', ({ labId, runState }) => {
    rooms.updateRunState(labId, runState)
    socket.to(labId).emit('run-state-updated', runState)
  })

  /* ── Chat / activity message ── */
  socket.on('activity', ({ labId, message }) => {
    socket.to(labId).emit('activity', { message, by: socket.id, at: Date.now() })
  })

  /* ── Disconnect ── */
  socket.on('disconnect', () => {
    const labId = rooms.leaveRoom(socket.id)
    if (labId) {
      io.to(labId).emit('users-updated', rooms.getRoomUsers(labId))
      console.log(`[-] ${socket.id} left room ${labId}`)
    }
    console.log(`[-] disconnected: ${socket.id}`)
  })
})

server.listen(PORT, () => {
  console.log(`\n🧪 Virtual-Lab Socket Server running on http://localhost:${PORT}\n`)
})
