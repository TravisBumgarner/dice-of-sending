import { BrowserRouter } from 'react-router'
import Router from './components/Router'

import AppThemeProvider from './styles/Theme'
import Navigation from './components/Navigation'
import './styles/global.css'
import Box from '@mui/material/Box'
import { SPACING } from './styles/styleConsts'

const App = () => {
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
