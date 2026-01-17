// 🍕 ZOR PIZZA - BACKEND SERVER (Optimized Version)
// backend/src/server.ts

import cors from 'cors'
import 'dotenv/config'
import express, { Express, NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import prisma from './lib/prisma'

// Route'larni tepada import qilamiz
import analyticsRoutes from './routes/analytics.routes'
import categoriesRoutes from './routes/categories.routes'
import couponsRoutes from './routes/coupons.routes'
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

// 1. Helmet - HTTP xavfsizligi
app.use(helmet())

// 2. CORS - Xavfsiz whitelist bilan
const allowedOrigins = [
	process.env.FRONTEND_URL,
	'http://localhost:3000',
	'http://localhost:5173', // Vite default port
]

app.use(
	cors({
		origin: (origin, callback) => {
			// Brauzerdan bo'lmagan so'rovlar (Postman kabi) yoki whitelist'dagi domenlar
			if (!origin || allowedOrigins.some(domain => domain && origin.startsWith(domain))) {
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

// 3. Rate Limiting (Tartibga solingan)
// Analytics uchun alohida, yuqoriroq limit
const analyticsLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 500,
	message: { success: false, message: 'Analytics limit exceeded' },
})

// Umumiy API uchun limit
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	message: { success: false, message: 'Too many requests, try again later' },
})

// 4. Boshqa standart middleware'lar
app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' })) // Body hajmini cheklash (Xavfsizlik uchun)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ============================================
// ROUTES
// ============================================

// Health check (Hech qanday limitlarsiz)
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		status: 'up',
		timestamp: new Date().toISOString(),
	})
})

// API Route'lari
app.use('/api/analytics', analyticsLimiter, analyticsRoutes) // Maxsus limit
app.use('/api/categories', generalLimiter, categoriesRoutes)
app.use('/api/deals', generalLimiter, dealsRoutes)
app.use('/api/coupons', generalLimiter, couponsRoutes)
app.use('/api/products', generalLimiter, productsRoutes)
app.use('/api/toppings', generalLimiter, toppingsRoutes)
app.use('/api/orders', generalLimiter, ordersRoutes)
app.use('/api/users', generalLimiter, usersRoutes)

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: '🍕 Zor Pizza API v1.0.0',
		documentation: '/health',
	})
})

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({ success: false, message: 'Route topilmadi' })
})

// Global Error Handler (TypeScript bilan boyitilgan)
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
// SERVER LUNCHER
// ============================================

const startServer = async () => {
	try {
		// DB connection
		await prisma.$connect()
		console.log('✅ Database connected')

		const server = app.listen(Number(PORT), '0.0.0.0', () => {
			console.log(`
      🚀 Server muvaffaqiyatli ishga tushdi!
      📍 Port: ${PORT}
      📍 Mode: ${process.env.NODE_ENV || 'development'}
      🍕 API Base: http://localhost:${PORT}/api
      `)
		})

		// Kutilmagan xatoliklarni ushlash (Process level)
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

// Graceful Shutdown (Bazani toza yopish)
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
