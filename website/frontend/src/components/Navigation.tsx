import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { BORDER_RADIUS, SPACING } from '../styles/styleConsts'
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { GiHamburgerMenu } from 'react-icons/gi'

const ROUTES = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/TravisBumgarner/lawful-chaotic-dice',
    target: '_blank'
  },
  {
    key: 'more_projects',
    label: 'More Projects',
    href: 'https://travisbumgarner.dev',
    target: '_blank'
  }
]

const DropdownLinks = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      {ROUTES.map(route => (
        <Link
          key={route.key}
          to={route.href}
          style={{ textDecoration: 'none', color: 'inherit' }}
          target={route.target}
        >
          <MenuItem onClick={onClose}>{route.label}</MenuItem>
        </Link>
      ))}
    </>
  )
}

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  return (
    <Box
      sx={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: SPACING.MEDIUM.PX
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="h1">Lawful Chaotic Dice</Typography>
      </Link>
      <Tooltip title="Menu">
        <IconButton
          aria-label="menu"
          aria-controls={open ? 'navigation-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <GiHamburgerMenu />
        </IconButton>
      </Tooltip>
      <Menu
        slotProps={{ paper: { sx: { borderRadius: BORDER_RADIUS.ZERO.PX } } }}
        id="navigation-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <DropdownLinks onClose={handleClose} />
      </Menu>
    </Box>
  )
}

export default Navigation
