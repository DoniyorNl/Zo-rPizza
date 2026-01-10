// 🍕 ZOR PIZZA - BACKEND SERVER
// Bu fayl serverni ishga tushiradi

import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'

// Routes
import categoriesRoutes from './routes/categories.routes'
import ordersRoutes from './routes/orders.routes'
import productsRoutes from './routes/products.routes'
import usersRoutes from './routes/users.routes'

// Environment variables yuklash
dotenv.config()

// Express app yaratish
const app: Express = express()
const PORT = process.env.PORT || 5000

// Prisma Client
export const prisma = new PrismaClient()

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Frontend'dan so'rov qabul qilish uchun
const allowedOrigins = [
	'http://localhost:3000',
	'https://zo-r-pizza.vercel.app',
	'https://zo-rpizza-production.up.railway.app',
	process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) return callback(null, true)

			if (allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
		credentials: true,
	}),
)

// Helmet - HTTP headers xavfsizligi
app.use(helmet())

// Rate Limiting - DDoS himoyasi (100 request/15 min)
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 daqiqa
	max: 100, // Maksimal 100 request
	message: 'Too many requests, please try again later.',
})
app.use('/api/', limiter)

// Morgan - HTTP request logger
app.use(morgan('dev'))

// JSON parser - Request body'ni parse qilish
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

// Server ishlab turganini tekshirish
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: '🍕 Zor Pizza Backend is running!',
		timestamp: new Date().toISOString(),
	})
})

// ============================================
// API ROUTES
// ============================================

// Categories
app.use('/api/categories', categoriesRoutes)

// Products
app.use('/api/products', productsRoutes)

// Orders
app.use('/api/orders', ordersRoutes)

// Users
app.use('/api/users', usersRoutes)

// ============================================
// 404 HANDLER
// ============================================

// Topilmagan route'lar uchun
app.use((_req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
	})
})

// ============================================
// SERVER START
// ============================================

// Serverni ishga tushirish
const startServer = async () => {
	try {
		const port = Number(PORT)

		// Serverni Railway uchun to‘g‘ri bind qilish
		app.listen(port, '0.0.0.0', async () => {
			console.log(`🚀 Server running on port ${port}`)
			console.log(`📍 Health check: /health`)
			console.log(`📍 Products API: /api/products`)

			// Database connection server ishga tushgandan keyin
			try {
				await prisma.$connect()
				console.log('✅ Database connected successfully')
			} catch (dbError) {
				console.error('❌ Database connection failed:', dbError)
			}
		})
	} catch (error) {
		console.error('❌ Failed to start server:', error)
		process.exit(1)
	}
}

// Serverni ishga tushirish
startServer()

// Graceful shutdown
process.on('SIGINT', async () => {
	console.log('\n👋 Shutting down gracefully...')
	await prisma.$disconnect()
	process.exit(0)
})
