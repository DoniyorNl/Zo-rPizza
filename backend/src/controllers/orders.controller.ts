// backend/src/controllers/orders.controller.ts
// 🍕 ORDERS CONTROLLER

import { Request, Response } from 'express'
import { prisma } from '../server'

// GET /api/orders - Barcha buyurtmalar (Admin)
export const getAllOrders = async (req: Request, res: Response) => {
	try {
		const { status, paymentStatus } = req.query

		const orders = await prisma.order.findMany({
			where: {
				...(status && { status: status as any }),
				...(paymentStatus && { paymentStatus: paymentStatus as any }),
			},
			include: {
				user: {
					select: { name: true, email: true, phone: true },
				},
				items: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		})
	} catch (error) {
		console.error('Error fetching orders:', error)
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/orders/user/:userId - User buyurtmalari
export const getUserOrders = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params

		const orders = await prisma.order.findMany({
			where: { userId },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		})
	} catch (error) {
		console.error('Error fetching user orders:', error)
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/orders/:id - Bitta buyurtma
export const getOrderById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				user: {
					select: { name: true, email: true, phone: true },
				},
				items: {
					include: {
						product: {
							include: {
								category: true,
							},
						},
					},
				},
				reviews: true,
			},
		})

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			})
		}

		return res.status(200).json({
			success: true,
			data: order,
		})
	} catch (error) {
		console.error('Error fetching order:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// POST /api/orders - Yangi buyurtma
export const createOrder = async (req: Request, res: Response) => {
	try {
		let {
			userId,
			items, // [{ productId, quantity }]
			paymentMethod,
			deliveryAddress,
			deliveryPhone,
			deliveryLat,
			deliveryLng,
		} = req.body

		if (typeof items === 'string') {
			items = JSON.parse(items)
		}
		console.log('Received items:', items)
		console.log('First item:', items[0])
		// Validation
		if (!userId || !items || !items.length || !deliveryAddress || !deliveryPhone) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields',
			})
		}

		// User mavjudligini tekshirish
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Mahsulotlar narxlarini hisoblash
		let totalPrice = 0
		const orderItems = []

		for (const item of items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId },
			})

			if (!product) {
				return res.status(404).json({
					success: false,
					message: `Product ${item.productId} not found`,
				})
			}

			if (!product.isActive) {
				return res.status(400).json({
					success: false,
					message: `Product ${product.name} is not available`,
				})
			}

			const itemTotal = product.price * item.quantity
			totalPrice += itemTotal

			orderItems.push({
				productId: item.productId,
				quantity: item.quantity,
				price: product.price,
			})
		}

		// Order number yaratish (unikal)
		const lastOrder = await prisma.order.findFirst({
			orderBy: { createdAt: 'desc' },
		})

		const orderNumber = lastOrder
			? `${(parseInt(lastOrder.orderNumber.slice(1)) + 1).toString().padStart(4, '0')}`
			: '0001'

		// Buyurtma yaratish
		const order = await prisma.order.create({
			data: {
				orderNumber,
				userId,
				totalPrice,
				paymentMethod: paymentMethod || 'CASH',
				deliveryAddress,
				deliveryPhone,
				deliveryLat: deliveryLat ? parseFloat(deliveryLat) : null,
				deliveryLng: deliveryLng ? parseFloat(deliveryLng) : null,
				items: {
					create: orderItems,
				},
			},
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

		return res.status(201).json({
			success: true,
			message: 'Order created successfully',
			data: order,
		})
	} catch (error) {
		console.error('Error creating order:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// PATCH /api/orders/:id/status - Status yangilash
export const updateOrderStatus = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { status, paymentStatus } = req.body

		// Buyurtma mavjudligini tekshirish
		const existing = await prisma.order.findUnique({
			where: { id },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			})
		}

		const order = await prisma.order.update({
			where: { id },
			data: {
				...(status && { status }),
				...(paymentStatus && { paymentStatus }),
			},
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

		return res.status(200).json({
			success: true,
			message: 'Order status updated',
			data: order,
		})
	} catch (error) {
		console.error('Error updating order status:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// DELETE /api/orders/:id - Buyurtma o'chirish (faqat PENDING)
export const deleteOrder = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const existing = await prisma.order.findUnique({
			where: { id },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			})
		}

		// Faqat PENDING statusdagi buyurtmalarni o'chirish mumkin
		if (existing.status !== 'PENDING') {
			return res.status(400).json({
				success: false,
				message: 'Can only delete pending orders',
			})
		}

		// Order items birinchi o'chiriladi (cascade)
		await prisma.order.delete({
			where: { id },
		})

		return res.status(200).json({
			success: true,
			message: 'Order deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting order:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
