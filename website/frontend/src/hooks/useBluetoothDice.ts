import { useState, useCallback, useEffect } from 'react'
const SERVICE_UUID = 'deadbeef-1234-5678-1234-56789abcdef0'
const CHARACTERISTIC_UUID = 'deadbeef-1234-5678-1234-56789abcdef1'

export function useArduinoDiceBLE({ handleMessage }: { handleMessage: (msg: string) => void }) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  // const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null)
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

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect()
    }
  }, [device])

  const connect = useCallback(async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Arduino' }],
        optionalServices: [SERVICE_UUID]
        // If device isn't pairing, disable the above lines and use the following instead:
        // acceptAllDevices: true
      })

      const server = await device.gatt?.connect()
      if (!server) throw new Error('Failed to connect to GATT server')

      log(`Connected to ${device.name}`)
      setDevice(device)
      // setServer(server)
      setConnected(true)

      const service = await server.getPrimaryService(SERVICE_UUID)
      const char = await service.getCharacteristic(CHARACTERISTIC_UUID)
      setCharacteristic(char)

      // Read initial value
      const value = await char.readValue()
      log('Initial: ' + new TextDecoder().decode(value))

      // Listen for notifications
      await char.startNotifications()
      char.addEventListener('characteristicvaluechanged', event => {
        const val = new TextDecoder().decode((event.target as BluetoothRemoteGATTCharacteristic).value!)
        log(val)
      })

      // Example: write to board
      // await char.writeValue(new TextEncoder().encode('Hello Browser'))
      // log("Wrote 'Hello Browser'")
    } catch (error) {
      log('Error: ' + (error as Error).message)
    }
  }, [log])

  const write = useCallback(
    async (text: string) => {
      if (!characteristic) return
      await characteristic.writeValue(new TextEncoder().encode(text))
      log(`Wrote '${text}'`)
    },
    [characteristic, log]
  )

  useEffect(() => {
    if (!device) return
    const handleDisconnect = () => {
      log(`Disconnected from ${device.name}`)
      setConnected(false)
      setDevice(null)
      // setServer(null)
      setCharacteristic(null)
    }
    device.addEventListener('gattserverdisconnected', handleDisconnect)
    return () => device.removeEventListener('gattserverdisconnected', handleDisconnect)
  }, [device, log])

  return { connect, write, connected, logs, disconnect }
}
