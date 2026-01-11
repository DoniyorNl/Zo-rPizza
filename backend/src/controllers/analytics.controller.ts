// backend/src/controllers/analytics.controller.ts
// 📊 ANALYTICS CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'

const parseDateRange = (startDate: unknown, endDate: unknown) => {
	const start = typeof startDate === 'string' && startDate.length > 0 ? new Date(startDate) : null
	const end = typeof endDate === 'string' && endDate.length > 0 ? new Date(endDate) : null

	const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
	const defaultEnd = new Date()

	const resolvedStart = start ?? defaultStart
	const resolvedEnd = end ?? defaultEnd

	if (Number.isNaN(resolvedStart.getTime()) || Number.isNaN(resolvedEnd.getTime())) {
		return { ok: false as const, error: 'Invalid startDate or endDate' }
	}

	if (resolvedStart > resolvedEnd) {
		return { ok: false as const, error: 'startDate must be before endDate' }
	}

	return { ok: true as const, start: resolvedStart, end: resolvedEnd }
}

// GET /api/analytics/overview - Umumiy statistika
export const getOverview = async (req: Request, res: Response) => {
	try {
		const { startDate, endDate } = req.query

		const parsed = parseDateRange(startDate, endDate)
		if (!parsed.ok) {
			return res.status(400).json({ success: false, message: parsed.error })
		}
		const { start, end } = parsed

		const [
			totalOrders,
			totalRevenue,
			totalCustomers,
			activeProducts,
			pendingOrders,
			completedOrders,
			cancelledOrders,
		] = await Promise.all([
			// Total orders
			prisma.order.count({
				where: {
					createdAt: { gte: start, lte: end },
				},
			}),
			// Total revenue
			prisma.order.aggregate({
				where: {
					createdAt: { gte: start, lte: end },
					status: { in: ['DELIVERED'] },
				},
				_sum: { totalPrice: true },
			}),
			// Total customers
			prisma.user.count({
				where: {
					role: 'CUSTOMER',
					createdAt: { gte: start, lte: end },
				},
			}),
			// Active products
			prisma.product.count({
				where: { isActive: true },
			}),
			// Pending orders
			prisma.order.count({
				where: {
					status: 'PENDING',
					createdAt: { gte: start, lte: end },
				},
			}),
			// Completed orders
			prisma.order.count({
				where: {
					status: { in: ['DELIVERED'] },
					createdAt: { gte: start, lte: end },
				},
			}),
			// Cancelled orders
			prisma.order.count({
				where: {
					status: 'CANCELLED',
					createdAt: { gte: start, lte: end },
				},
			}),
		])

		const revenueRaw = totalRevenue._sum?.totalPrice
		const revenue = typeof revenueRaw === 'number' && isFinite(revenueRaw) ? revenueRaw : 0
		const averageOrderValue = totalOrders > 0 && isFinite(revenue) ? revenue / totalOrders : 0
		const safeAverageOrderValue =
			isFinite(averageOrderValue) && !isNaN(averageOrderValue) ? averageOrderValue : 0

		return res.status(200).json({
			success: true,
			data: {
				totalRevenue: revenue,
				totalOrders: totalOrders ?? 0,
				totalCustomers: totalCustomers ?? 0,
				activeProducts: activeProducts ?? 0,
				averageOrderValue: safeAverageOrderValue,
				pendingOrders: pendingOrders ?? 0,
				completedOrders: completedOrders ?? 0,
				cancelledOrders: cancelledOrders ?? 0,
			},
		})
	} catch (error) {
		console.error('Error fetching analytics overview:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// GET /api/analytics/revenue - Daromad grafigi
export const getRevenueData = async (req: Request, res: Response) => {
	try {
		const { startDate, endDate } = req.query

		const parsed = parseDateRange(startDate, endDate)
		if (!parsed.ok) {
			return res.status(400).json({ success: false, message: parsed.error })
		}
		const { start, end } = parsed

		const orders = await prisma.order.findMany({
			where: {
				createdAt: { gte: start, lte: end },
				status: { in: ['DELIVERED'] },
			},
			select: {
				totalPrice: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'asc' },
		})

		// Group by date

		const revenueByDate = orders.reduce((acc: any, order) => {
			const date = order.createdAt.toISOString().split('T')[0]
			if (!acc[date]) {
				acc[date] = { revenue: 0, orders: 0 }
			}
			const price =
				typeof order.totalPrice === 'number' && isFinite(order.totalPrice) ? order.totalPrice : 0
			acc[date].revenue += price
			acc[date].orders += 1
			return acc
		}, {})

		const data = Object.entries(revenueByDate).map(([date, stats]: [string, any]) => ({
			date,
			revenue: stats.revenue,
			orders: stats.orders,
		}))

		return res.status(200).json({
			success: true,
			data,
		})
	} catch (error) {
		console.error('Error fetching revenue data:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// GET /api/analytics/top-products - Eng ko'p sotilgan mahsulotlar
export const getTopProducts = async (req: Request, res: Response) => {
	try {
		const { startDate, endDate, limit = '10' } = req.query

		const parsed = parseDateRange(startDate, endDate)
		if (!parsed.ok) {
			return res.status(400).json({ success: false, message: parsed.error })
		}
		const { start, end } = parsed

		const limitNumber = Math.max(1, Math.min(100, Number.parseInt(String(limit), 10) || 10))

		const orders = await prisma.order.findMany({
			where: {
				createdAt: { gte: start, lte: end },
				status: { in: ['DELIVERED'] },
			},
			select: { id: true },
		})

		const orderIds = orders.map(o => o.id)
		if (orderIds.length === 0) {
			return res.status(200).json({ success: true, data: [] })
		}

		const topProducts = await prisma.orderItem.groupBy({
			by: ['productId'],
			where: {
				productId: { not: null },
				orderId: { in: orderIds },
			},
			_sum: {
				quantity: true,
				price: true,
			},
			orderBy: {
				_sum: {
					quantity: 'desc',
				},
			},
			take: limitNumber,
		})

		// Get product details
		const productsWithDetails = await Promise.all(
			topProducts.map(async item => {
				let product = null
				try {
					if (item.productId) {
						product = await prisma.product.findUnique({
							where: { id: item.productId },
							include: { category: true },
						})
					}
				} catch (e) {
					product = null
				}

				const totalSold =
					typeof item._sum.quantity === 'number' && isFinite(item._sum.quantity)
						? item._sum.quantity
						: 0
				const revenue =
					typeof item._sum.price === 'number' && isFinite(item._sum.price) ? item._sum.price : 0

				return {
					id: item.productId,
					name: product?.name || 'Unknown',
					category: product?.category?.name || 'Unknown',
					totalSold,
					revenue,
					imageUrl: product?.imageUrl || null,
				}
			}),
		)

		return res.status(200).json({
			success: true,
			data: productsWithDetails,
		})
	} catch (error) {
		console.error('Error fetching top products:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// GET /api/analytics/categories - Kategoriyalar bo'yicha statistika
export const getCategoryStats = async (req: Request, res: Response) => {
	try {
		const { startDate, endDate } = req.query

		const parsed = parseDateRange(startDate, endDate)
		if (!parsed.ok) {
			return res.status(400).json({ success: false, message: parsed.error })
		}
		const { start, end } = parsed

		const orders = await prisma.order.findMany({
			where: {
				createdAt: { gte: start, lte: end },
				status: { in: ['DELIVERED'] },
			},
			select: { id: true },
		})

		const orderIds = orders.map(o => o.id)
		if (orderIds.length === 0) {
			return res.status(200).json({ success: true, data: [] })
		}

		const categoryStats = await prisma.orderItem.groupBy({
			by: ['productId'],
			where: {
				productId: { not: null },
				orderId: { in: orderIds },
			},
			_sum: {
				quantity: true,
				price: true,
			},
		})

		// Get category info
		const categorySummary: any = {}

		for (const item of categoryStats) {
			let product = null
			try {
				if (item.productId) {
					product = await prisma.product.findUnique({
						where: { id: item.productId },
						include: { category: true },
					})
				}
			} catch (e) {
				product = null
			}

			// fallback for missing product/category
			const catId = product?.categoryId || 'Unknown'
			const catName = product?.category?.name || 'Unknown'

			if (!categorySummary[catId]) {
				categorySummary[catId] = {
					categoryId: catId,
					categoryName: catName,
					totalOrders: 0,
					revenue: 0,
				}
			}

			const quantity =
				typeof item._sum.quantity === 'number' && isFinite(item._sum.quantity)
					? item._sum.quantity
					: 0
			const price =
				typeof item._sum.price === 'number' && isFinite(item._sum.price) ? item._sum.price : 0

			categorySummary[catId].totalOrders += quantity
			categorySummary[catId].revenue += price
		}

		// Calculate percentages

		const totalRevenue = Object.values(categorySummary).reduce((sum: number, cat: any) => {
			const revenue = typeof cat.revenue === 'number' && isFinite(cat.revenue) ? cat.revenue : 0
			return sum + revenue
		}, 0)

		const data = Object.values(categorySummary).map((cat: any) => {
			const revenue = typeof cat.revenue === 'number' && isFinite(cat.revenue) ? cat.revenue : 0
			return {
				...cat,
				percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
			}
		})

		return res.status(200).json({
			success: true,
			data,
		})
	} catch (error) {
		console.error('Error fetching category stats:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// GET /api/analytics/recent-orders - So'nggi buyurtmalar
export const getRecentOrders = async (req: Request, res: Response) => {
	try {
		const { limit = '10' } = req.query

		const orders = await prisma.order.findMany({
			take: parseInt(limit as string),
			orderBy: { createdAt: 'desc' },
			include: {
				user: {
					select: { name: true },
				},
				items: {
					select: { quantity: true },
				},
			},
		})

		const data = orders.map(order => ({
			id: order.id,
			customerName: order.user?.name || 'Guest',
			total: order.totalPrice,
			status: order.status,
			createdAt: order.createdAt,
			items: order.items.reduce((sum, item) => sum + item.quantity, 0),
		}))

		return res.status(200).json({
			success: true,
			data,
		})
	} catch (error) {
		console.error('Error fetching recent orders:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}
