/**
 * Supabase ID dan Database user ni resolve qilish
 * authenticateFirebaseToken / authenticateToken dan keyin ishlatiladi
 * req.userId (supabase uid) → req.user (db user: id, role)
 */
import { NextFunction, Request, Response } from 'express'
import prisma from '../lib/prisma'

export const resolveDbUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const supabaseId = (req as any).userId
		if (!supabaseId) return next()

		const dbUser = await prisma.user.findFirst({
			where: { supabaseId },
			select: { id: true, role: true, email: true, name: true },
		})

		if (dbUser) {
			; (req as any).user = {
				id: dbUser.id,
				email: dbUser.email,
				role: dbUser.role,
				name: dbUser.name,
			}
		}

		next()
	} catch (error) {
		console.error('[resolveDbUser] Error:', error)
		next(error)
	}
}
