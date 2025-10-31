import { BrowserRouter } from 'react-router'
import Router from './components/Router'

import AppThemeProvider from './styles/Theme'
import Navigation from './components/Navigation'
import './styles/global.css'
import Box from '@mui/material/Box'
import { SPACING } from './styles/styleConsts'
import useCheckBrowser from './hooks/useCheckBrowser'

const App = () => {
  const { isSupported } = useCheckBrowser()

  if (!isSupported) {
    return (
      <Box
        sx={{
          height: '100dvh',
          padding: SPACING.MEDIUM.PX,
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <h1>Custom Bluetooth devices not supported :(</h1>
        <p>Try Chrome or Edge.</p>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100dvh',
        padding: SPACING.MEDIUM.PX,
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <AppThemeProvider>
        <BrowserRouter>
          <Navigation />
          <Router />
        </BrowserRouter>
      </AppThemeProvider>
    </Box>
  )
}

export default App
