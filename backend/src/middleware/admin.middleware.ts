// backend/src/middleware/admin.middleware.ts
import prisma from '@/lib/prisma'
import { NextFunction, Request, Response } from 'express'

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Firebase UID headers'dan olish
		const userId = req.headers['x-user-id'] as string

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			})
		}

		// User'ni database'dan olish
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user || user.role !== 'ADMIN') {
			return res.status(403).json({
				success: false,
				message: 'Admin only',
			})
		}

	return next()
