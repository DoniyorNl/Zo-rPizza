// backend/src/controllers/orders.controller.ts
// 🍕 ORDERS CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'

const getQueryString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

const getParamString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

// GET /api/orders - Barcha buyurtmalar (Admin)
export const getAllOrders = async (req: Request, res: Response) => {
	try {
		const status = getQueryString(req.query.status)
		const paymentStatus = getQueryString(req.query.paymentStatus)

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
		const userId = getParamString((req.params as any).userId)
		if (!userId) {
			return res.status(400).json({ success: false, message: 'Invalid userId' })
		}

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

		return res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		})
	} catch (error) {
		console.error('Error fetching user orders:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/orders/:id - Bitta buyurtma
export const getOrderById = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}

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
			items, // [{ productId, quantity, variationId?, size? }]
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

			let variationPrice = product.basePrice
			let variationId: string | null = null
			let size: string | null = null

			if (item.variationId) {
				const variation = await prisma.productVariation.findFirst({
					where: {
						id: item.variationId,
						productId: product.id,
					},
				})

				if (!variation) {
					return res.status(400).json({
						success: false,
						message: `Invalid variation for product ${product.name}`,
					})
				}

				variationPrice = variation.price
				variationId = variation.id
				size = variation.size
			} else if (item.size) {
				const variationBySize = await prisma.productVariation.findFirst({
					where: {
						productId: product.id,
						size: item.size,
					},
				})

				if (variationBySize) {
					variationPrice = variationBySize.price
					variationId = variationBySize.id
					size = variationBySize.size
				} else {
					size = item.size
				}
			}

			const itemTotal = variationPrice * item.quantity
			totalPrice += itemTotal

			orderItems.push({
				productId: item.productId,
				variationId,
				size,
				quantity: item.quantity,
				price: variationPrice,
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
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
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
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}

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
