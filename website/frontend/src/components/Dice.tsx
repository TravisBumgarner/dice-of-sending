import React from 'react'
import { Box } from '@mui/material'
import { PALETTE } from '../styles/styleConsts'

interface DiceProps {
  face?: number
  size: number
}

const Dice: React.FC<DiceProps> = ({ face, size }) => {
  const dotSize = size * 0.15
  const diceStyle = {
    width: size,
    height: size,
    backgroundColor: PALETTE.grayscale['50'],
    border: `3px solid ${PALETTE.grayscale[900]}`,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  }

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    backgroundColor: PALETTE.grayscale[900],
    borderRadius: '50%',
    position: 'absolute' as const
  }

  const renderDots = () => {
    const dots = []

    switch (face) {
      case undefined:
        // Show question mark when face is not defined
        return (
          <Box
            sx={{
              fontSize: size * 0.8,
              fontWeight: 'bold',
              color: PALETTE.grayscale[900],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%'
            }}
          >
            ?
          </Box>
        )
      case 1:
        // Center dot
        dots.push(
          <Box
            key="center"
            sx={{
              ...dotStyle,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )
        break

      case 2:
        // Top-left and bottom-right
        dots.push(
          <Box
            key="tl"
            sx={{
              ...dotStyle,
              top: '25%',
              left: '25%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="br"
            sx={{
              ...dotStyle,
              bottom: '25%',
              right: '25%',
              transform: 'translate(50%, 50%)'
            }}
          />
        )
        break

      case 3:
        // Top-left, center, bottom-right
        dots.push(
          <Box
            key="tl"
            sx={{
              ...dotStyle,
              top: '20%',
              left: '20%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="center"
            sx={{
              ...dotStyle,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="br"
            sx={{
              ...dotStyle,
              bottom: '20%',
              right: '20%',
              transform: 'translate(50%, 50%)'
            }}
          />
        )
        break

      case 4:
        // Four corners
        dots.push(
          <Box
            key="tl"
            sx={{
              ...dotStyle,
              top: '25%',
              left: '25%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="tr"
            sx={{
              ...dotStyle,
              top: '25%',
              right: '25%',
              transform: 'translate(50%, -50%)'
            }}
          />,
          <Box
            key="bl"
            sx={{
              ...dotStyle,
              bottom: '25%',
              left: '25%',
              transform: 'translate(-50%, 50%)'
            }}
          />,
          <Box
            key="br"
            sx={{
              ...dotStyle,
              bottom: '25%',
              right: '25%',
              transform: 'translate(50%, 50%)'
            }}
          />
        )
        break

      case 5:
        // Four corners plus center
        dots.push(
          <Box
            key="tl"
            sx={{
              ...dotStyle,
              top: '20%',
              left: '20%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="tr"
            sx={{
              ...dotStyle,
              top: '20%',
              right: '20%',
              transform: 'translate(50%, -50%)'
            }}
          />,
          <Box
            key="center"
            sx={{
              ...dotStyle,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="bl"
            sx={{
              ...dotStyle,
              bottom: '20%',
              left: '20%',
              transform: 'translate(-50%, 50%)'
            }}
          />,
          <Box
            key="br"
            sx={{
              ...dotStyle,
              bottom: '20%',
              right: '20%',
              transform: 'translate(50%, 50%)'
            }}
          />
        )
        break

      case 6:
        // Six dots in two columns
        dots.push(
          // Left column
          <Box
            key="tl"
            sx={{
              ...dotStyle,
              top: '17%',
              left: '25%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="ml"
            sx={{
              ...dotStyle,
              top: '50%',
              left: '25%',
              transform: 'translate(-50%, -50%)'
            }}
          />,
          <Box
            key="bl"
            sx={{
              ...dotStyle,
              bottom: '17%',
              left: '25%',
              transform: 'translate(-50%, 50%)'
            }}
          />,
          // Right column
          <Box
            key="tr"
            sx={{
              ...dotStyle,
              top: '17%',
              right: '25%',
              transform: 'translate(50%, -50%)'
            }}
          />,
          <Box
            key="mr"
            sx={{
              ...dotStyle,
              top: '50%',
              right: '25%',
              transform: 'translate(50%, -50%)'
            }}
          />,
          <Box
            key="br"
            sx={{
              ...dotStyle,
              bottom: '17%',
              right: '25%',
              transform: 'translate(50%, 50%)'
            }}
          />
        )
        break
    }

    return dots
  }

  return <Box sx={diceStyle}>{renderDots()}</Box>
}

export default Dice
