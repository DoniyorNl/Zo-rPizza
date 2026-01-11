// backend/src/controllers/analytics.controller.ts
// 📊 ANALYTICS CONTROLLER

import { Request, Response } from 'express'
import { prisma } from '../server'

// GET /api/analytics/overview - Umumiy statistika
export const getOverview = async (req: Request, res: Response) => {
	try {
		const { startDate, endDate } = req.query

		const start = startDate
			? new Date(startDate as string)
			: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		const end = endDate ? new Date(endDate as string) : new Date()

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

		const revenue = totalRevenue._sum?.totalPrice ?? 0
		const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0

		return res.status(200).json({
			success: true,
			data: {
				totalRevenue: revenue,
				totalOrders,
				totalCustomers,
				activeProducts,
				averageOrderValue,
				pendingOrders,
				completedOrders,
				cancelledOrders,
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

		const start = startDate
			? new Date(startDate as string)
			: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		const end = endDate ? new Date(endDate as string) : new Date()

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
			acc[date].revenue += order.totalPrice
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

		const start = startDate
			? new Date(startDate as string)
			: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		const end = endDate ? new Date(endDate as string) : new Date()

		const topProducts = await prisma.orderItem.groupBy({
			by: ['productId'],
			where: {
				order: {
					createdAt: { gte: start, lte: end },
					status: { in: ['DELIVERED'] },
				},
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
			take: parseInt(limit as string),
		})

		// Get product details
		const productsWithDetails = await Promise.all(
			topProducts.map(async item => {
				const product = await prisma.product.findUnique({
					where: { id: item.productId || '' },
					include: { category: true },
				})

				return {
					id: item.productId,
					name: product?.name || 'Unknown',
					category: product?.category.name || 'Unknown',
					totalSold: item._sum.quantity || 0,
					revenue: item._sum.price || 0,
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

		const start = startDate
			? new Date(startDate as string)
			: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		const end = endDate ? new Date(endDate as string) : new Date()

		const categoryStats = await prisma.orderItem.groupBy({
			by: ['productId'],
			where: {
				order: {
					createdAt: { gte: start, lte: end },
					status: { in: ['DELIVERED'] },
				},
			},
			_sum: {
				quantity: true,
				price: true,
			},
		})

		// Get category info
		const categorySummary: any = {}

		for (const item of categoryStats) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId || '' },
				include: { category: true },
			})

			if (product) {
				const catId = product.categoryId
				const catName = product.category.name

				if (!categorySummary[catId]) {
					categorySummary[catId] = {
						categoryId: catId,
						categoryName: catName,
						totalOrders: 0,
						revenue: 0,
					}
				}

				categorySummary[catId].totalOrders += item._sum.quantity || 0
				categorySummary[catId].revenue += item._sum.price || 0
			}
		}

		// Calculate percentages
		const totalRevenue = Object.values(categorySummary).reduce(
			(sum: number, cat: any) => sum + cat.revenue,
			0,
		)

		const data = Object.values(categorySummary).map((cat: any) => ({
			...cat,
			percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0,
		}))

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
