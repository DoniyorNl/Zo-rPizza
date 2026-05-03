// backend/src/server.ts

import cors from 'cors'
import 'dotenv/config'
import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import prisma from './lib/prisma'
import errorsRoutes from './routes/errors.routes'
import notificationsRoutes from './routes/notifications.routes'

// ============================================================================
// SENTRY INITIALIZATION (must be first!)
// ============================================================================
import { initSentry } from './lib/sentry'
initSentry()

// ============================================================================
// RATE LIMIT IMPORT
// ============================================================================
import { rateLimit } from 'express-rate-limit'

// ============================================================================
// ROUTES IMPORT
// ============================================================================
import analyticsRoutes from './routes/analytics.routes'
import branchesRoutes from './routes/branches.routes'
import categoriesRoutes from './routes/categories.routes'
import couponsRoutes from './routes/coupons.routes'
import dashboardRoutes from './routes/dashboard.routes'
import dealsRoutes from './routes/deals.routes'
import deliveryRoutes from './routes/delivery.routes'
import loyaltyRoutes from './routes/loyalty.routes'
import ordersRoutes from './routes/orders.routes'
import paymentRoutes, { stripeWebhook } from './routes/payment.routes'
import paymentsRoutes from './routes/payments.routes'
import productsRoutes from './routes/products.routes'
import profileRoutes from './routes/profile.routes'
import promosRoutes from './routes/promos.routes'
import pushRoutes from './routes/push.routes'
import toppingsRoutes from './routes/toppings.routes'
import trackingRoutes from './routes/tracking.routes'
import usersRoutes from './routes/users.routes'

import authRoutes from './routes/auth.routes'

export const app: Express = express()
const PORT = process.env.PORT || 5001

app.set('trust proxy', 1) // 🆕 Trust proxy settings (required for rate limiting behind proxies like Nginx/Railway)

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
			// console.log('🔍 CORS check - Origin:', origin)

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
// RATE LIMITING
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development'

// Dashboard limiter
const dashboardLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: isDevelopment ? 1000 : 120, // Dev mode: relaxed limits
	message: { success: false, message: 'Dashboard limit exceeded' },
	standardHeaders: true,
	legacyHeaders: false,
})

// Analytics limiter
const analyticsLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: isDevelopment ? 1000 : 500,
	message: { success: false, message: 'Analytics limit exceeded' },
	standardHeaders: true,
	legacyHeaders: false,
})

// Auth limiter
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: isDevelopment ? 500 : 100,
	message: { success: false, message: 'Too many auth requests, please try again later' },
	standardHeaders: true,
	legacyHeaders: false,
})

// General limiter
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: isDevelopment ? 10000 : 2000, // Significantly increased for dev to avoid 429
	message: { success: false, message: 'Too many requests, try again later' },
	standardHeaders: true,
	legacyHeaders: false,
})

// ============================================
// OTHER MIDDLEWARE
// ============================================

app.use(morgan('dev'))
// Stripe webhook raw body kerak (imzo tekshiruvi uchun) – json dan oldin
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
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
			auth: '/api/auth',
			dashboard: '/api/dashboard',
			analytics: '/api/analytics',
			products: '/api/products',
			orders: '/api/orders',
			payment: '/api/payment',
			payments: '/api/payments',
			users: '/api/users',
			categories: '/api/categories',
			toppings: '/api/toppings',
			coupons: '/api/coupons',
			deals: '/api/deals',
			tracking: '/api/tracking',
			notifications: '/api/notifications',
		},
	})
})

// API list
app.get('/api', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: 'Zor Pizza API v1.0',
		availableEndpoints: [
			{ method: 'GET', path: '/api/auth/me', description: 'Get current user', protected: true },
			{
				method: 'GET',
				path: '/api/auth/verify-token',
				description: 'Verify token',
				protected: true,
			},
			{
				method: 'POST',
				path: '/api/auth/set-admin',
				description: 'Set admin role',
				protected: true,
				admin: true,
			},
			{
				method: 'GET',
				path: '/api/dashboard',
				description: 'Real-time dashboard',
				protected: false,
			},
			{ method: 'GET', path: '/api/analytics', description: 'Analytics', protected: false },
			{ method: 'GET', path: '/api/products', description: 'Products', protected: false },
			{ method: 'GET', path: '/api/orders', description: 'Orders', protected: true },
			{ method: 'POST', path: '/api/payment/create-intent', description: 'Stripe PaymentIntent', protected: true },
			{ method: 'POST', path: '/api/payments/initiate', description: 'Init payment', protected: true },
			{ method: 'GET', path: '/api/users', description: 'Users', protected: true },
			{ method: 'GET', path: '/api/categories', description: 'Categories', protected: false },
			{ method: 'GET', path: '/api/toppings', description: 'Toppings', protected: false },
			{ method: 'GET', path: '/api/coupons', description: 'Coupons', protected: false },
			{ method: 'GET', path: '/api/deals', description: 'Deals', protected: false },
		],
		timestamp: new Date().toISOString(),
	})
})

// Favicon handler
app.get('/favicon.ico', (_req: Request, res: Response) => {
	res.status(204).end()
})

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authLimiter, authRoutes)

// Dashboard & Analytics
app.use('/api/dashboard', dashboardLimiter, dashboardRoutes)
app.use('/api/analytics', analyticsLimiter, analyticsRoutes)

// General API Routes
app.use('/api/branches', generalLimiter, branchesRoutes)
app.use('/api/categories', generalLimiter, categoriesRoutes)
app.use('/api/deals', generalLimiter, dealsRoutes)
app.use('/api/delivery', generalLimiter, deliveryRoutes)
app.use('/api/coupons', generalLimiter, couponsRoutes)
app.use('/api/loyalty', generalLimiter, loyaltyRoutes)
app.use('/api/promos', generalLimiter, promosRoutes)
app.use('/api/products', generalLimiter, productsRoutes)
app.use('/api/toppings', generalLimiter, toppingsRoutes)
app.use('/api/orders', generalLimiter, ordersRoutes)
app.use('/api/payment', generalLimiter, paymentRoutes)
app.use('/api/payments', generalLimiter, paymentsRoutes)
// app.use('/api/push', generalLimiter, pushRoutes) // Temporarily disabled
app.use('/api/users', generalLimiter, usersRoutes)
app.use('/api/profile', generalLimiter, profileRoutes)
app.use('/api/notifications', generalLimiter, notificationsRoutes)
app.use('/api/tracking', generalLimiter, trackingRoutes)
app.use('/api/errors', generalLimiter, errorsRoutes)

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

	// ============================================================================
	// 🐛 SEND TO SENTRY
	// ============================================================================
	if (statusCode >= 500) {
		const { captureException } = require('./lib/sentry')
		captureException(err, {
			statusCode,
			path: _req.path,
			method: _req.method,
		})
	}

	res.status(statusCode).json({
		success: false,
		message: message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
	})
})

// ============================================
// SOCKET.IO (Live order tracking)
// ============================================
import { initSocket } from './lib/socket'

// ============================================
// SERVER LAUNCHER
// ============================================

const DB_CONNECT_RETRY_DELAY_MS = 30_000 // circuit breaker ochilganda bir marta 30s kutib qayta urinish

async function connectDatabase(): Promise<void> {
	const msg = (e: unknown) => String((e as { message?: string })?.message ?? e)
	try {
		await prisma.$connect()
		return
	} catch (first: unknown) {
		const isCircuitBreaker = /circuit breaker open/i.test(msg(first))
		if (isCircuitBreaker) {
			console.warn('⚠️  Circuit breaker aniqlandi. 30 soniya kutib qayta urinilmoqda...')
			await new Promise(r => setTimeout(r, DB_CONNECT_RETRY_DELAY_MS))
			await prisma.$connect()
			return
		}
		throw first
	}
}

const startServer = async () => {
	try {
		console.log('🚀 [BUILD] Supabase Auth v2 — No Firebase')
		console.log('🚀 [BUILD] Deployed:', new Date().toISOString())

		// 1. Database ulanish (circuit breaker bo‘lsa bir marta 30s kutib qayta urinish)
		await connectDatabase()
		console.log('✅ Database connected')

		// 2. Supabase connection check
		if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
			console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — all auth will fail with 401')
		} else {
			console.log('✅ Supabase Auth configured:', process.env.SUPABASE_URL)
		}

		// 3. Server ishga tushirish
		const server = app.listen(Number(PORT), '0.0.0.0', () => {
			initSocket(server)
			const baseUrl = `http://localhost:${PORT}`
			console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🍕 ZOR PIZZA API SERVER                                     ║
╠══════════════════════════════════════════════════════════════╣
║  Status:     ✅ Running                                      ║
║  Port:       ${PORT}                                            ║
║  Mode:       ${process.env.NODE_ENV || 'development'}                                   ║
║  Base URL:   ${baseUrl}                       ║
╠══════════════════════════════════════════════════════════════╣
║  📍 ENDPOINTS                                                ║
║  Health:     ${baseUrl}/health                 ║
║  API List:   ${baseUrl}/api                    ║
║  Auth:       ${baseUrl}/api/auth               ║
║  Dashboard:  ${baseUrl}/api/dashboard          ║
║  Products:   ${baseUrl}/api/products           ║
╚══════════════════════════════════════════════════════════════╝
      `)
		})

		// 4. Unhandled rejection handler
		process.on('unhandledRejection', err => {
			console.log('❌ UNHANDLED REJECTION! Shutting down...')
			console.error(err)
			server.close(() => process.exit(1))
		})
	} catch (error: unknown) {
		const err = error as { name?: string; message?: string }
		const msg = String(err?.message ?? error)
		const isDbAuth =
			err?.name === 'PrismaClientInitializationError' ||
			/authentication|circuit breaker|too many.*auth/i.test(msg)

		console.error('❌ Serverni boshlashda xatolik:', error)
		if (isDbAuth) {
			console.error(`
⚠️  DATABASE ULANISH XATOSI (authentication / circuit breaker)
   • Xato: "Too many authentication errors" – noto‘g‘ri parol yoki juda ko‘p muvaffaqiyatsiz urinish.
   • Tuzatish:
     1. DATABASE_URL da parol to‘g‘ri ekanligini tekshiring (Supabase → Settings → Database).
     2. Pooler URL ishlatilayotganiga ishonch hosil qiling: port 6543, host ...pooler.supabase.com, oxirida ?sslmode=require
     3. Agar circuit breaker ochilgan bo‘lsa: 20–30 daqiqa kuting yoki Supabase loyihasini restart qiling, keyin to‘g‘ri DATABASE_URL bilan qayta deploy qiling.
`)
		}
		try {
			await prisma.$disconnect()
		} catch (_e) {}
		process.exit(1)
	}
}

// Start server only when this file is run directly (not imported for tests)
if (require.main === module) {
	if (process.env.NODE_ENV !== 'test') {
		startServer()
	}
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const shutdown = async (signal: string) => {
	console.log(`\n👋 ${signal} qabul qilindi. Server yopilmoqda...`)
	try {
		await prisma.$disconnect()
		console.log('✅ Database disconnected')
	} catch (error) {
		console.error('❌ Database disconnect error:', error)
	}
	process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('beforeExit', async () => {
	try {
		await prisma.$disconnect()
	} catch (_e) {}
})
