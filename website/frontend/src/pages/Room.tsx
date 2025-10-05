import { useCallback, useEffect, useState } from 'react'

import socket from '../services/socket'
import { useParams, useSearchParams } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
import { useArduinoDiceBLE } from '../hooks/useBluetoothDice'
import { SPACING } from '../styles/styleConsts'
import Dice from '../components/Dice'

const History = ({ history, currentUsername }: { history: DiceResult[]; currentUsername: string }) => {
  useEffect(() => {
    // scroll all the way to the right when new dice is added
    const historyContainer = document.getElementById('history-container')
    if (historyContainer) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        historyContainer.scrollLeft = historyContainer.scrollWidth
      }, 0)
    }
  }, [history])

  return (
    <Box
      id="history-container"
      sx={{
        height: '200px',
        overflowX: 'auto',
        overflowY: 'hidden',
        width: '70vw',
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.SMALL.PX,
        paddingY: SPACING.SMALL.PX,
        '&::-webkit-scrollbar': {
          height: '8px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '4px'
        }
      }}
    >
      {history.map((entry, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: SPACING.TINY.PX,
            flexShrink: 0 // Prevent dice from shrinking
          }}
        >
          <Dice face={entry.roll} size={index === history.length - 1 ? 60 : 50} />
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {entry.username === currentUsername ? 'You' : entry.username}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

interface DiceResult {
  username: string
  roll: number
}

type SocketMessage = DiceResult & { room: string }

const Room = () => {
  const [result, setResult] = useState<DiceResult | null>(null)
  const [history, setHistory] = useState<DiceResult[]>([])
  const { room } = useParams<{ room: string }>()
  const [searchParams] = useSearchParams()
  const [showLogs, setShowLogs] = useState(false)
  const username = searchParams.get('username') || ''

  const updateResults = useCallback((newResult: DiceResult) => {
    setResult(newResult)
    setHistory(prev => [...prev, newResult])
  }, [])

  const handleMessage = useCallback(
    (msg: string) => {
      if (msg.startsWith('Face ')) {
        const roll = parseInt(msg.replace('Face ', ''))
        if (!isNaN(roll)) {
          socket.emit('roll_dice', { room, roll, username } as SocketMessage)
          return
        }
      }
    },
    [room, username]
  )

  const { connect, write, connected, logs, disconnect } = useArduinoDiceBLE({ handleMessage })

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    alert('Copied room to  clipboard!')
  }, [])

  useEffect(() => {
    if (username) {
      socket.emit('join_room', { room, username })
    }
    socket.on('dice_result', (data: SocketMessage) => {
      updateResults(data)
    })
    return () => {
      socket.off('dice_result')
    }
  }, [room, username, updateResults])

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
        justifyContent: 'space-between',
        flexGrow: 1
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Welcome, {username}!</Typography>
        <Typography variant="body2" color="text.secondary">
          Room: {room}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACING.MEDIUM.PX }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: SPACING.MEDIUM.PX
          }}
        >
          <Dice size={300} face={result?.roll} />
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {result?.username ? `Rolled by ${result.username === username ? 'you' : result.username}` : 'No rolls yet'}
          </Typography>
          <History history={history} currentUsername={username} />
        </Box>
        <Box>
          <Button
            variant={connected ? 'outlined' : 'contained'}
            sx={{ width: '140px' }}
            onClick={connected ? disconnect : connect}
          >
            {connected ? 'Disconnect' : 'Connect Dice'}
          </Button>
        </Box>
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
