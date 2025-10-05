import { useEffect, useState } from 'react'

import socket from '../services/socket'
import { useParams, useSearchParams } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
import { useArduinoDiceBLE } from '../hooks/useBluetoothDice'
import { SPACING } from '../styles/styleConsts'

interface DiceResult {
  username: string
  roll: number
}

type SocketMessage = DiceResult & { room: string }

const Room = () => {
  const [result, setResult] = useState<DiceResult | null>(null)
  const { room } = useParams<{ room: string }>()
  const [searchParams] = useSearchParams()
  const [showLogs, setShowLogs] = useState(false)
  const username = searchParams.get('username') || ''

  const handleMessage = (msg: string) => {
    if (msg.startsWith('Face ')) {
      const roll = parseInt(msg.replace('Face ', ''))
      if (!isNaN(roll)) {
        socket.emit('roll_dice', { room, roll, username } as SocketMessage)
        return
      }
    }
  }

  const { connect, write, connected, logs, disconnect } = useArduinoDiceBLE({ handleMessage })

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Copied room to  clipboard!')
  }

  useEffect(() => {
    if (username) {
      socket.emit('join_room', { room, username })
    }
    socket.on('dice_result', (data: SocketMessage) => {
      setResult(data)
    })
    return () => {
      socket.off('dice_result')
    }
  }, [room, username])

  const handleSendPing = () => {
    setShowLogs(true)
    write('Ping from web app')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Welcome, {username}!</Typography>
        <Typography variant="body2" color="text.secondary">
          Room: {room}
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: SPACING.LARGE.PX
        }}
      >
        <Typography sx={{ lineHeight: '300px', fontSize: '300px', textAlign: 'center' }}>
          {result?.roll || ':)'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {result?.username ? `Rolled by: ${result.username}` : 'No rolls yet'}
        </Typography>
        <Button
          variant={connected ? 'outlined' : 'contained'}
          sx={{ width: '140px' }}
          onClick={connected ? disconnect : connect}
        >
          {connected ? 'Disconnect' : 'Connect Dice'}
        </Button>
      </Box>
      {showLogs && (
        <Box
          sx={{
            position: 'fixed',
            left: SPACING.MEDIUM.PX,
            top: 'calc(50% - 300px)',
            height: '300px',
            overflow: 'auto'
          }}
        >
          {<pre>{logs.join('\n')}</pre>}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <Box>
          <Button sx={{ width: '100px' }} onClick={() => setShowLogs(!showLogs)}>
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
          {connected && (
            <Button sx={{ width: '100px' }} onClick={handleSendPing}>
              Send Ping
            </Button>
          )}
        </Box>
        <Button onClick={handleCopyToClipboard}>Share Room Link</Button>
      </Box>
    </Box>
  )
}

export default Room
