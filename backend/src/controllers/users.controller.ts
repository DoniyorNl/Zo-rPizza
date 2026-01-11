// backend/src/controllers/users.controller.ts
// 👤 USERS CONTROLLER

import { Request, Response } from 'express'
import { prisma } from '../server'

// POST /api/users - User yaratish (Firebase'dan keyin)
export const createUser = async (req: Request, res: Response) => {
	try {
		const { firebaseUid, email, name, phone } = req.body

		// Validation
		if (!firebaseUid || !email) {
			return res.status(400).json({
				success: false,
				message: 'Firebase UID and email are required',
			})
		}

		// Firebase UID bo'yicha user bormi?
		const existing = await prisma.user.findUnique({
			where: { id: firebaseUid },
		})

		if (existing) {
			return res.status(200).json({
				success: true,
				message: 'User already exists',
				data: existing,
			})
		}

		// Email bo'yicha tekshirish
		const existingEmail = await prisma.user.findUnique({
			where: { email },
		})

		if (existingEmail) {
			return res.status(400).json({
				success: false,
				message: 'Email already in use',
			})
		}

		// Yangi user yaratish
		const user = await prisma.user.create({
			data: {
				id: firebaseUid, // Firebase UID'ni ID sifatida ishlatamiz
				email,
				name: name || email.split('@')[0], // Default name
				phone: phone || null,
				password: 'FIREBASE_AUTH', // Firebase authentication ishlatamiz
				role: 'CUSTOMER',
			},
		})

		return res.status(201).json({
			success: true,
			message: 'User created successfully',
			data: user,
		})
	} catch (error) {
		console.error('Error creating user:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/users/:id - User ma'lumotlari
export const getUserById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const userId = Array.isArray(id) ? id[0] : id

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				createdAt: true,
				// password ni yubormaymiz!
			},
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		return res.status(200).json({
			success: true,
			data: user,
		})
	} catch (error) {
		console.error('Error fetching user:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// PUT /api/users/:id - User yangilash
export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const userId = Array.isArray(id) ? id[0] : id
		const { name, phone } = req.body

		// User mavjudligini tekshirish
		const existing = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Yangilash
		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				...(name && { name }),
				...(phone && { phone }),
			},
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				createdAt: true,
			},
		})

		return res.status(200).json({
			success: true,
			message: 'User updated successfully',
			data: user,
		})
	} catch (error) {
		console.error('Error updating user:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
