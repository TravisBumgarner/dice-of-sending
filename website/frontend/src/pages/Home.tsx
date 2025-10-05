import { useNavigate } from 'react-router'
import generateRoomName from '../utils/generateRoomName'
// import socket from '../services/socket'
import { useCallback, useState } from 'react'
import { Box, Button, TextField, type SxProps } from '@mui/material'
import { SPACING } from '../styles/styleConsts'

export default function App() {
  const navigate = useNavigate()
  const [inputRoomName, setInputRoomName] = useState('')
  const [username, setUsername] = useState('')

  const handleCreateRoom = useCallback(() => {
    const roomName = generateRoomName()
    // socket.emit('create_room', { room: roomName })
    navigate(`/room/${roomName}?username=${encodeURIComponent(username)}`)
  }, [navigate, username])

  const handleJoinRoom = useCallback(() => {
    navigate(`/room/${inputRoomName}?username=${encodeURIComponent(username)}`)
  }, [inputRoomName, navigate, username])

  return (
    <Box sx={wrapperSX}>
      <Box sx={boxSX}>
        <TextField
          size="small"
          type="text"
          fullWidth
          placeholder="What's your name?"
          value={username}
          onChange={e => setUsername(e.target.value)}
          sx={{ marginBottom: SPACING.SMALL.PX }}
        />
        <Button variant="contained" fullWidth onClick={handleCreateRoom} disabled={username.trim().length === 0}>
          Create Room
        </Button>
        <p style={{ margin: 0 }}>Or</p>
        <Box
          sx={{
            marginTop: SPACING.TINY.PX,
            display: 'flex',
            gap: SPACING.TINY.PX,
            width: '100%'
          }}
        >
          <TextField
            size="small"
            type="text"
            fullWidth
            placeholder="Enter room name"
            value={inputRoomName}
            onChange={e => setInputRoomName(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={inputRoomName.length === 0 || username.trim().length === 0}
            onClick={handleJoinRoom}
          >
            Join
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

const wrapperSX: SxProps = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}

const boxSX: SxProps = {
  width: '300px',
  maxWidth: '90%',
  textAlign: 'center',
  padding: '1rem',
  marginTop: '1rem',
  gap: SPACING.SMALL.PX,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}
