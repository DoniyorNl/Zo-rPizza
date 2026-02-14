// backend/src/controllers/delivery.controller.ts
// 🍕 DELIVERY TIME ESTIMATION

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { calculateDistance, calculateETA } from '../utils/gps.utils'

const getQueryNumber = (value: unknown): number | null => {
	if (value === undefined || value === null) return null
	const n = Number(value)
	return isNaN(n) ? null : n
}

/** POST /api/delivery/estimate - Manzil bo'yicha yetkazib berish vaqtini hisoblash */
export const estimateDeliveryTime = async (req: Request, res: Response) => {
	try {
		const { lat, lng, address } = req.body
		const latNum = typeof lat === 'number' ? lat : getQueryNumber(lat ?? req.query.lat)
		const lngNum = typeof lng === 'number' ? lng : getQueryNumber(lng ?? req.query.lng)

		if ((latNum == null || lngNum == null) && !address) {
			return res.status(400).json({
				success: false,
				message: 'Provide lat & lng or address for estimation',
			})
		}

		// Agar faqat address bo'lsa, oddiy default (keyinchalik geocoding qo'shiladi)
		let fromLat = latNum
		let fromLng = lngNum
		if (fromLat == null || fromLng == null) {
			// Default: eng yaqin filialdan 5 km uzoqlikda deb hisoblash
			const branches = await prisma.branch.findMany({ where: { isActive: true }, take: 1 })
			if (branches.length === 0) {
				return res.status(200).json({
					success: true,
					data: { estimatedMinutes: 30, message: 'Default estimate (no branches)' },
				})
			}
			fromLat = branches[0].lat
			fromLng = branches[0].lng
		}

		const branches = await prisma.branch.findMany({ where: { isActive: true } })
		if (branches.length === 0) {
			const defaultMinutes = 30
			return res.status(200).json({
				success: true,
				data: {
					estimatedMinutes: defaultMinutes,
					branchId: null,
					distanceKm: null,
				},
			})
		}

		let nearest = branches[0]
		let minDist = calculateDistance(
			{ lat: fromLat, lng: fromLng },
			{ lat: nearest.lat, lng: nearest.lng },
		)
		for (const b of branches.slice(1)) {
			const d = calculateDistance({ lat: fromLat, lng: fromLng }, { lat: b.lat, lng: b.lng })
			if (d < minDist) {
				minDist = d
				nearest = b
			}
		}

		const estimatedMinutes = calculateETA(minDist, { preparationTime: 15, trafficMultiplier: 1.2 })
		return res.status(200).json({
			success: true,
			data: {
				estimatedMinutes,
				branchId: nearest.id,
				branchName: nearest.name,
				distanceKm: Math.round(minDist * 100) / 100,
			},
		})
	} catch (error) {
		console.error('Delivery estimate error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
