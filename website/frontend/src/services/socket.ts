import { io } from 'socket.io-client'

// Note - this will stop working when deploying to prod. Need to figure out the correct route here for local and prod and put into a config.
const socket = io(
  import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://dice.pointlessprojects.com/',
  {
    transports: ['polling']
  }
)

export default socket
