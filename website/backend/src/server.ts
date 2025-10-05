import express from 'express'
import morgan from 'morgan'
import http from 'http'
import { Server } from 'socket.io'
import path from 'path'

const app = express()
// Log all HTTP requests
app.use(morgan('combined'))
const server = http.createServer(app)
const io = new Server(server, {
  // path: "/socket.io",
  cors: {
    origin: '*' // relaxed for dev; tighten in prod
  }
})

// Aggressive Socket.IO logging
io.on('connection', socket => {
  console.log('[SOCKET.IO] User connected', socket.id)

  socket.onAny((event, ...args) => {
    console.log(`[SOCKET.IO] Event: ${event}`, args)
  })

  socket.on('disconnect', reason => {
    console.log(`[SOCKET.IO] User disconnected: ${socket.id}, reason: ${reason}`)
  })

  socket.on('error', err => {
    console.error(`[SOCKET.IO] Error on socket ${socket.id}:`, err)
  })

  socket.on('join_room', ({ room, username }: { room: string; username?: string }) => {
    console.log(`[SOCKET.IO] ${socket.id} (${username || 'anonymous'}) joining room: ${room}`)
    socket.join(room)
  })

  socket.on(
    'roll_dice',
    ({ room, sides, roll, username }: { room: string; sides?: number; roll: number; username: string }) => {
      console.log(
        `[SOCKET.IO] ${socket.id} (${username}) rolled dice in room ${room}: ${roll} (sides: ${sides || 'unknown'})`
      )
      // Only emit to the specific room
      io.to(room).emit('dice_result', { room, roll, sides: sides || 6, username })
    }
  )
})

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, 'frontend')

  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
