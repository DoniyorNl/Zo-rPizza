// backend/src/lib/socket.ts
// Live order tracking - Socket.io server

import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'

let io: SocketServer | null = null

export function initSocket(server: HttpServer): SocketServer {
	io = new SocketServer(server, {
		cors: {
			origin: (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '*').split(',').map(o => o.trim()),
			credentials: true,
		},
	})
	io.on('connection', socket => {
		socket.on('join_order', (orderId: string) => {
			socket.join(`order:${orderId}`)
		})
		socket.on('leave_order', (orderId: string) => {
			socket.leave(`order:${orderId}`)
		})
	})
	return io
}

export function getIO(): SocketServer | null {
	return io
}

export function emitOrderUpdate(orderId: string, payload: { status?: string; driverLocation?: object; estimatedTime?: number }) {
	getIO()?.to(`order:${orderId}`).emit('order:update', payload)
}
