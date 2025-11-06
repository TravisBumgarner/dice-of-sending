import { useState, useCallback, useEffect } from 'react'

const SERVICE_UUID = 'deadbeef-1234-5678-1234-56789abcdef0'
const CHARACTERISTIC_UUID = 'deadbeef-1234-5678-1234-56789abcdef1'

export function useArduinoDiceBLE({ handleMessage }: { handleMessage: (msg: string) => void }) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null)
  const [connected, setConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const log = useCallback(
    (msg: string) => {
      handleMessage(msg)
      setLogs(prev => [...prev, msg])
    },
    [handleMessage]
  )

  const handleDisconnection = useCallback(() => {
    if (device) log(`Disconnected from ${device.name}`)
    else log('Device disconnected')
    setConnected(false)
    setDevice(null)
    setCharacteristic(null)
  }, [device, log])

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) device.gatt.disconnect()
  }, [device])

  const connect = useCallback(async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Dice' }],
        optionalServices: [SERVICE_UUID]
      })

      const server = await device.gatt?.connect()
      if (!server) throw new Error('Failed to connect to GATT server')

      log(`Connected to ${device.name}`)
      setDevice(device)
      setConnected(true)

      const service = await server.getPrimaryService(SERVICE_UUID)
      const char = await service.getCharacteristic(CHARACTERISTIC_UUID)
      setCharacteristic(char)

      // Listen for notifications (string messages)
      await char.startNotifications()
      char.addEventListener('characteristicvaluechanged', event => {
        const val = (event.target as BluetoothRemoteGATTCharacteristic).value!
        const text = new TextDecoder().decode(val).trim()
        if (text.startsWith('Roll:')) log(text)
        else if (text.startsWith('Debug:')) log(text)
        else log(`Msg: ${text}`)
      })
    } catch (error) {
      log('Error: ' + (error as Error).message)
    }
  }, [log])

  const write = useCallback(
    async (text: string) => {
      if (!characteristic || !device?.gatt?.connected) {
        log('Cannot write: Device not connected')
        return
      }
      try {
        await characteristic.writeValue(new TextEncoder().encode(text))
        log(`Wrote '${text}'`)
      } catch (error) {
        log(`Write failed: ${(error as Error).message}`)
        if (!device?.gatt?.connected) handleDisconnection()
      }
    },
    [characteristic, device, log, handleDisconnection]
  )

  useEffect(() => {
    if (!device) return
    device.addEventListener('gattserverdisconnected', handleDisconnection)
    return () => device.removeEventListener('gattserverdisconnected', handleDisconnection)
  }, [device, handleDisconnection])

  return { connect, write, connected, logs, disconnect }
}
