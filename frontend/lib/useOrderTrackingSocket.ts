'use client'

import { getApiBaseUrl } from '@/lib/apiBaseUrl'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface OrderUpdatePayload {
  status?: string
  driverLocation?: { lat: number; lng: number; timestamp?: string }
  estimatedTime?: number
}

/**
 * Subscribe to live order updates via Socket.io.
 * Call with orderId; onOrderUpdate is called when server emits order:update.
 */
export function useOrderTrackingSocket(
  orderId: string | null,
  onOrderUpdate: (payload: OrderUpdatePayload) => void,
) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!orderId) return

    const baseUrl = getApiBaseUrl()
    const socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_order', orderId)
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('order:update', onOrderUpdate)

    return () => {
      socket.emit('leave_order', orderId)
      socket.off('order:update', onOrderUpdate)
      socket.disconnect()
      socketRef.current = null
    }
  }, [orderId, onOrderUpdate])

  return { connected }
}
