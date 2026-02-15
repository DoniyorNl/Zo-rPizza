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

/** GET /api/branches - Barcha faol filiallar (ommaviy) */
export const getAllBranches = async (_req: Request, res: Response) => {
	try {
		const branches = await prisma.branch.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' },
		})
		return res.status(200).json({ success: true, count: branches.length, data: branches })
	} catch (error) {
		console.error('Error fetching branches:', error)
		const msg = process.env.NODE_ENV !== 'production' && error instanceof Error ? error.message : 'Server error'
		return res.status(500).json({ success: false, message: msg })
	}
}

/** GET /api/branches/admin/all - Admin: barcha filiallar (faol va faol emas) */
export const getAllBranchesAdmin = async (_req: Request, res: Response) => {
	try {
		const branches = await prisma.branch.findMany({
			orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
		})
		return res.status(200).json({ success: true, count: branches.length, data: branches })
	} catch (error) {
		console.error('Error fetching branches admin:', error)
		const msg = process.env.NODE_ENV !== 'production' && error instanceof Error ? error.message : 'Server error'
		return res.status(500).json({ success: false, message: msg })
	}
}

/** URL dan lat,lng ajratish (Google Maps formatlari – har doim lat, lng tartibi) */
function parseLatLngFromUrl(url: string): { lat: number; lng: number } | null {
	const toNum = (s: string) => {
		const n = parseFloat(String(s).trim().replace(/,/g, '.'))
		return Number.isFinite(n) ? n : null
	}
	const valid = (lat: number | null, lng: number | null) =>
		lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180

	// !3dLAT!4dLNG – Share linkida tez-tez
	const m3d = url.match(/!3d(-?[\d.,]+)!4d(-?[\d.,]+)/)
	if (m3d) {
		const lat = toNum(m3d[1])
		const lng = toNum(m3d[2])
		if (valid(lat, lng)) return { lat: lat!, lng: lng! }
	}
	const m4d = url.match(/!4d(-?[\d.,]+)!3d(-?[\d.,]+)/)
	if (m4d) {
		const lng = toNum(m4d[1])
		const lat = toNum(m4d[2])
		if (valid(lat, lng)) return { lat: lat!, lng: lng! }
	}

	// @lat,lng,zoom yoki ?q=lat,lng
	const m1 = url.match(/[@?](-?[\d.,]+)\s*,\s*(-?[\d.,]+)/)
	if (m1) {
		const lat = toNum(m1[1])
		const lng = toNum(m1[2])
		if (valid(lat, lng)) return { lat: lat!, lng: lng! }
	}
	// ll= yoki center=
	const m2 = url.match(/(?:ll|center)=(-?[\d.,]+)\s*,\s*(-?[\d.,]+)/)
	if (m2) {
		const lat = toNum(m2[1])
		const lng = toNum(m2[2])
		if (valid(lat, lng)) return { lat: lat!, lng: lng! }
	}
	// Ixtiyoriy: birinchi geografik juftlik
	const m3 = url.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/g)
	if (m3) {
		for (const pair of m3) {
			const parts = pair.split(',')
			const lat = toNum(parts[0])
			const lng = toNum(parts[1])
			if (valid(lat, lng)) return { lat: lat!, lng: lng! }
		}
	}
	return null
}

/** GET /api/branches/resolve-map-url?url=... - Qisqa linkni ochib, final URL va (agar topilsa) lat/lng qaytaradi */
export const resolveMapUrl = async (req: Request, res: Response) => {
	try {
		const raw = req.query.url
		const url = typeof raw === 'string' ? raw.trim() : ''
		if (!url || (!url.includes('goo.gl') && !url.includes('maps.app.goo.gl'))) {
			return res.status(400).json({ success: false, message: 'Google Maps qisqa link (goo.gl yoki maps.app.goo.gl) kiriting' })
		}
		const controller = new AbortController()
		const t = setTimeout(() => controller.abort(), 8000)
		const resp = await fetch(url, {
			method: 'GET',
			redirect: 'follow',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0',
				'Accept-Language': 'en-US,en;q=0.9',
			},
			signal: controller.signal,
		})
		clearTimeout(t)
		const finalUrl = resp.url || url
		const coords = parseLatLngFromUrl(finalUrl)
		return res.status(200).json({
			success: true,
			url: finalUrl,
			...(coords && { lat: coords.lat, lng: coords.lng }),
		})
	} catch (e) {
		console.error('Resolve map url error:', e)
		return res.status(502).json({ success: false, message: 'Linkni ochib bo\'lmadi. Koordinatalarni qo\'lda kiriting yoki uzun link ishlating.' })
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

/** POST /api/branches - Admin: yangi filial (adminOnly) */
export const createBranch = async (req: Request, res: Response) => {
	try {
		const { name, address, lat, lng, phone } = req.body
		if (!name || !address || lat == null || lng == null) {
			return res.status(400).json({
				success: false,
				message: 'name, address, lat, lng majburiy',
			})
		}
		const latNum = typeof lat === 'string' ? parseFloat(String(lat).replace(/,/g, '.')) : Number(lat)
		const lngNum = typeof lng === 'string' ? parseFloat(String(lng).replace(/,/g, '.')) : Number(lng)
		if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
			return res.status(400).json({
				success: false,
				message: 'lat va lng raqam bo\'lishi kerak (masalan 41.2995, 69.2401)',
			})
		}
		const branch = await prisma.branch.create({
			data: {
				name: String(name).trim(),
				address: String(address).trim(),
				lat: latNum,
				lng: lngNum,
				phone: phone != null ? String(phone).trim() : null,
				isActive: true,
			},
		})
		return res.status(201).json({ success: true, data: branch })
	} catch (error) {
		console.error('Create branch error:', error)
		const msg = process.env.NODE_ENV !== 'production' && error instanceof Error ? error.message : 'Server error'
		return res.status(500).json({ success: false, message: msg })
	}
}

/** PATCH /api/branches/:id - Admin: filialni tahrirlash (adminOnly) */
export const updateBranch = async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id)
		const { name, address, lat, lng, phone, isActive } = req.body
		const existing = await prisma.branch.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Branch not found' })
		}
		const toNum = (v: unknown) =>
			typeof v === 'string' ? parseFloat(String(v).replace(/,/g, '.')) : Number(v)
		const data: Record<string, unknown> = {}
		if (name != null) data.name = String(name).trim()
		if (address != null) data.address = String(address).trim()
		if (lat != null) {
			const n = toNum(lat)
			if (!Number.isFinite(n)) return res.status(400).json({ success: false, message: 'lat raqam bo\'lishi kerak' })
			data.lat = n
		}
		if (lng != null) {
			const n = toNum(lng)
			if (!Number.isFinite(n)) return res.status(400).json({ success: false, message: 'lng raqam bo\'lishi kerak' })
			data.lng = n
		}
		if (phone !== undefined) data.phone = phone == null ? null : String(phone).trim()
		if (isActive !== undefined) data.isActive = Boolean(isActive)
		const branch = await prisma.branch.update({
			where: { id },
			data,
		})
		return res.status(200).json({ success: true, data: branch })
	} catch (error) {
		console.error('Update branch error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

/** DELETE /api/branches/:id - Admin: filialni butunlay o'chirish (bazadan) */
export const deleteBranch = async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id)
		const existing = await prisma.branch.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Branch not found' })
		}
		// Buyurtmalardagi branchId ni null qilamiz (filial o'chgach ham buyurtma qoladi)
		await prisma.order.updateMany({
			where: { branchId: id },
			data: { branchId: null },
		})
		await prisma.branch.delete({
			where: { id },
		})
		return res.status(200).json({ success: true, message: 'Filial o\'chirildi' })
	} catch (error) {
		console.error('Delete branch error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
