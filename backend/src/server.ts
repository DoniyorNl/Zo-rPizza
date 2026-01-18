// backend/src/server.ts

import cors from 'cors'
import 'dotenv/config'
import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import prisma from './lib/prisma'

// ============================================================================
// RATE LIMIT IMPORT (Fixed)
// ============================================================================
import { rateLimit } from 'express-rate-limit'

// Routes
import analyticsRoutes from './routes/analytics.routes'
import categoriesRoutes from './routes/categories.routes'
import couponsRoutes from './routes/coupons.routes'
import dashboardRoutes from './routes/dashboard.routes'
import dealsRoutes from './routes/deals.routes'
import ordersRoutes from './routes/orders.routes'
import productsRoutes from './routes/products.routes'
import toppingsRoutes from './routes/toppings.routes'
import usersRoutes from './routes/users.routes'

const app: Express = express()
const PORT = process.env.PORT || 5001

// ============================================
// MIDDLEWARE & SECURITY
// ============================================

app.use(helmet())

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
	.split(',')
	.map(origin => origin.trim())
	.filter(Boolean)

const normalizeOrigin = (origin: string) => origin.replace(/\/+$/, '')
const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin).filter(Boolean)
const allowLocalhostOrigin = process.env.ALLOW_LOCALHOST_ORIGIN === 'true'
const isLocalhostOrigin = (origin: string) =>
	/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizeOrigin(origin))

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true)
			if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
				return callback(null, true)
			}
			const normalizedOrigin = normalizeOrigin(origin)
			if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
				return callback(null, true)
			}
			if (allowLocalhostOrigin && isLocalhostOrigin(origin)) {
				return callback(null, true)
			}
			console.log('❌ CORS blocked origin:', origin)
			callback(new Error('Not allowed by CORS'))
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
	}),
)

// ============================================================================
// RATE LIMITING (Fixed)
// ============================================================================

// Dashboard limiter
const dashboardLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 120, // 120 requests per minute
	message: { success: false, message: 'Dashboard limit exceeded' },
	standardHeaders: true,
	legacyHeaders: false,
})

// Analytics limiter
const analyticsLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 500,
	message: { success: false, message: 'Analytics limit exceeded' },
	standardHeaders: true,
	legacyHeaders: false,
})

// General limiter
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000,
	message: { success: false, message: 'Too many requests, try again later' },
	standardHeaders: true,
	legacyHeaders: false,
})

// ============================================
// OTHER MIDDLEWARE
// ============================================

app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		status: 'up',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	})
})

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: '🍕 Zor Pizza API v1.0.0',
		version: '1.0.0',
		endpoints: {
			health: '/health',
			api: '/api',
			dashboard: '/api/dashboard',
			analytics: '/api/analytics',
			products: '/api/products',
			orders: '/api/orders',
			users: '/api/users',
			categories: '/api/categories',
			toppings: '/api/toppings',
			coupons: '/api/coupons',
			deals: '/api/deals',
		},
	})
})

// API list
app.get('/api', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: 'Zor Pizza API v1.0',
		availableEndpoints: [
			{ method: 'GET', path: '/api/dashboard', description: 'Real-time dashboard' },
			{ method: 'GET', path: '/api/analytics', description: 'Analytics' },
			{ method: 'GET', path: '/api/products', description: 'Products' },
			{ method: 'GET', path: '/api/orders', description: 'Orders' },
			{ method: 'GET', path: '/api/users', description: 'Users' },
			{ method: 'GET', path: '/api/categories', description: 'Categories' },
			{ method: 'GET', path: '/api/toppings', description: 'Toppings' },
			{ method: 'GET', path: '/api/coupons', description: 'Coupons' },
			{ method: 'GET', path: '/api/deals', description: 'Deals' },
		],
		timestamp: new Date().toISOString(),
	})
})

// Favicon handler
app.get('/favicon.ico', (_req: Request, res: Response) => {
	res.status(204).end()
})

// API Routes
app.use('/api/dashboard', dashboardLimiter, dashboardRoutes)
app.use('/api/analytics', analyticsLimiter, analyticsRoutes)
app.use('/api/categories', generalLimiter, categoriesRoutes)
app.use('/api/deals', generalLimiter, dealsRoutes)
app.use('/api/coupons', generalLimiter, couponsRoutes)
app.use('/api/products', generalLimiter, productsRoutes)
app.use('/api/toppings', generalLimiter, toppingsRoutes)
app.use('/api/orders', generalLimiter, ordersRoutes)
app.use('/api/users', generalLimiter, usersRoutes)

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: `Route topilmadi: ${req.method} ${req.path}`,
		availableEndpoints: '/api',
	})
})

// Global Error Handler
interface AppError extends Error {
	status?: number
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
	const statusCode = err.status || 500
	const message = err.message || 'Ichki server xatosi'

	console.error(`[ERROR] ${new Date().toISOString()}:`, err)

	res.status(statusCode).json({
		success: false,
		message: message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
	})
})

// ============================================
// SERVER LAUNCHER
// ============================================

const startServer = async () => {
	try {
		await prisma.$connect()
		console.log('✅ Database connected')

		const server = app.listen(Number(PORT), '0.0.0.0', () => {
			console.log(`
      🚀 Server muvaffaqiyatli ishga tushdi!
      📍 Port: ${PORT}
      📍 Mode: ${process.env.NODE_ENV || 'development'}
      🍕 API Base: /api
      📊 Dashboard: /api/dashboard
      💚 Health: /health
      `)
		})

		process.on('unhandledRejection', err => {
			console.log('❌ UNHANDLED REJECTION! Shutting down...')
			console.error(err)
			server.close(() => process.exit(1))
		})
	} catch (error) {
		console.error('❌ Serverni boshlashda xatolik:', error)
		try {
			await prisma.$disconnect()
		} catch (_e) { }
		process.exit(1)
	}
}

startServer()

// Graceful Shutdown
const shutdown = async (signal: string) => {
	console.log(`\n👋 ${signal} qabul qilindi. Yopilmoqda...`)
	await prisma.$disconnect()
	process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('beforeExit', async () => {
	try {
		await prisma.$disconnect()
	} catch (_e) { }
})