// backend/src/controllers/branches.controller.ts
// 🍕 BRANCHES / LOCATION FINDER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { calculateDistance } from '../utils/gps.utils'

const getQueryNumber = (value: unknown): number | null => {
	if (value === undefined || value === null) return null
	const n = Number(value)
	return isNaN(n) ? null : n
}

/** GET /api/branches - Barcha filiallar */
export const getAllBranches = async (_req: Request, res: Response) => {
	try {
		const branches = await prisma.branch.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' },
		})
		return res.status(200).json({ success: true, count: branches.length, data: branches })
	} catch (error) {
		console.error('Error fetching branches:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

/** GET /api/branches/nearest?lat=...&lng=... - Eng yaqin filial */
export const getNearestBranch = async (req: Request, res: Response) => {
	try {
		const lat = getQueryNumber(req.query.lat)
		const lng = getQueryNumber(req.query.lng)
		if (lat == null || lng == null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
			return res.status(400).json({ success: false, message: 'Valid lat and lng required' })
		}
		const branches = await prisma.branch.findMany({
			where: { isActive: true },
		})
		if (branches.length === 0) {
			return res.status(200).json({ success: true, data: null, message: 'No branches' })
		}
		const withDistance = branches.map((b) => ({
			...b,
			distanceKm: calculateDistance({ lat, lng }, { lat: b.lat, lng: b.lng }),
		}))
		withDistance.sort((a, b) => a.distanceKm - b.distanceKm)
		const nearest = withDistance[0]
		return res.status(200).json({
			success: true,
			data: nearest,
			alternatives: withDistance.slice(1, 4),
		})
	} catch (error) {
		console.error('Error fetching nearest branch:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

/** GET /api/branches/:id */
export const getBranchById = async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id)
		const branch = await prisma.branch.findUnique({ where: { id } })
		if (!branch) {
			return res.status(404).json({ success: false, message: 'Branch not found' })
		}
		return res.status(200).json({ success: true, data: branch })
	} catch (error) {
		console.error('Error fetching branch:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
