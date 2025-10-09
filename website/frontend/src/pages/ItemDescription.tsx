import { Box, Typography } from '@mui/material'

const ItemDescription = () => {
  return (
    <Box sx={{ maxWidth: '500px' }}>
      <Typography variant="h2">Item Description</Typography>
      <Typography variant="body2" sx={{ marginTop: '1em' }}>
        Wondrous Item, uncommon
      </Typography>
      <Typography variant="body1" sx={{ marginTop: '1em' }}>
        When a Dungeon Master insists you roll in plain sight, the Dice of Sending offer a clever loophole. These
        enchanted dice are linked by invisible arcane currents (or Bluetooth, depending on your realm’s tech level),
        allowing a roll in both the physical and digital planes simultaneously.{' '}
      </Typography>
      <Typography variant="body1" sx={{ marginTop: '1em' }}>
        Those attuned to the Dice of Sending may appear obedient while still indulging their chaotic good nature -
        rolling fairly, yet unpredictably.
      </Typography>
    </Box>
  )
}

export default ItemDescription
