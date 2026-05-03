// backend/src/controllers/supabase-auth.controller.ts
import { Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth.middleware'

const getDemoOverrides = (email?: string | null): { role: 'CUSTOMER' | 'ADMIN' | 'DELIVERY'; isDriver: boolean } | null => {
  const e = (email || '').trim().toLowerCase()
  if (e === 'demo.admin@zorpizza.uz') return { role: 'ADMIN', isDriver: false }
  if (e === 'demo.driver@zorpizza.uz') return { role: 'DELIVERY', isDriver: true }
  if (e === 'demo.customer@zorpizza.uz') return { role: 'CUSTOMER', isDriver: false }
  return null
}

export const supabaseAuthController = {
  verifyToken: async (req: AuthRequest, res: Response) => {
    try {
      return res.status(200).json({
        success: true,
        message: "Token to'g'ri va yaroqli",
        data: { userId: req.userId, email: req.userEmail, timestamp: new Date().toISOString() },
      })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Token tekshirishda xatolik.' })
    }
  },

  getCurrentUser: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: 'User ID topilmadi.' })
      }

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: req.userId },
        select: { id: true, email: true, name: true, phone: true, role: true, isBlocked: true, createdAt: true, updatedAt: true },
      })

      if (!dbUser) {
        return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' })
      }

      return res.status(200).json({ success: true, data: { database: dbUser } })
    } catch (error: any) {
      console.error('❌ getCurrentUser Error:', error.message)
      return res.status(500).json({ success: false, message: "Foydalanuvchi ma'lumotlarini olishda xatolik." })
    }
  },

  syncUser: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: 'User ID topilmadi.' })
      }

      const supabaseId = req.userId
      const email = req.userEmail || ''
      const overrides = getDemoOverrides(email)

      let displayName = ''
      try {
        const { data: supabaseUser } = await supabaseAdmin.auth.admin.getUserById(supabaseId)
        displayName = supabaseUser?.user?.user_metadata?.name || supabaseUser?.user?.user_metadata?.full_name || ''
      } catch {
        // Continue without display name if Supabase Admin fails
      }

      let dbUser = await prisma.user.findUnique({ where: { supabaseId } })

      if (!dbUser) {
        const existingByEmail = email ? await prisma.user.findUnique({ where: { email } }) : null

        if (existingByEmail) {
          dbUser = await prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              supabaseId,
              name: displayName || existingByEmail.name,
              ...(overrides ? { role: overrides.role, isDriver: overrides.isDriver } : {}),
            },
          })
        } else {
          dbUser = await prisma.user.create({
            data: {
              supabaseId,
              email,
              name: displayName || 'User',
              password: null,
              role: overrides?.role || 'CUSTOMER',
              isDriver: overrides?.isDriver || false,
              isBlocked: false,
            },
          })
        }

        return res.status(201).json({ success: true, message: 'User muvaffaqiyatli yaratildi', data: dbUser })
      }

      const updateData: Record<string, any> = {}
      if (displayName && displayName !== dbUser.name) updateData.name = displayName
      if (dbUser.isDriver && dbUser.role === 'CUSTOMER') updateData.role = 'DELIVERY'
      if (overrides) { updateData.role = overrides.role; updateData.isDriver = overrides.isDriver }

      if (Object.keys(updateData).length > 0) {
        try {
          dbUser = await prisma.user.update({ where: { supabaseId }, data: updateData })
        } catch (updateError: any) {
          console.warn('⚠️ User update warning:', updateError.message)
        }
      }

      return res.status(200).json({ success: true, message: "User ma'lumotlari yangilandi", data: dbUser })
    } catch (error: any) {
      console.error('❌ syncUser Error:', error)
      return res.status(500).json({ success: false, message: 'User sinxronlashda xatolik.' })
    }
  },

  setAdminRole: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.body
      if (!userId) return res.status(400).json({ success: false, message: 'User ID kiritilmagan.' })

      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { role: 'admin' },
        })
      } catch (e) {
        console.warn('Supabase admin update warning:', e)
      }

      const updatedUser = await prisma.user.update({
        where: { supabaseId: userId },
        data: { role: 'ADMIN' },
      })

      return res.status(200).json({ success: true, message: `User ${userId} ga admin huquqi berildi`, data: updatedUser })
    } catch (error: any) {
      console.error('❌ setAdminRole Error:', error.message)
      return res.status(500).json({ success: false, message: 'Admin rolini belgilashda xatolik.' })
    }
  },

  removeAdminRole: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.body
      if (!userId) return res.status(400).json({ success: false, message: 'User ID kiritilmagan.' })

      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { role: 'customer' },
        })
      } catch (e) {
        console.warn('Supabase admin update warning:', e)
      }

      const updatedUser = await prisma.user.update({
        where: { supabaseId: userId },
        data: { role: 'CUSTOMER' },
      })

      return res.status(200).json({ success: true, message: `User ${userId} dan admin huquqi olib tashlandi`, data: updatedUser })
    } catch (error: any) {
      console.error('❌ removeAdminRole Error:', error.message)
      return res.status(500).json({ success: false, message: 'Admin rolini olib tashlashda xatolik.' })
    }
  },

  getAllUsers: async (_req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      if (error) throw error

      const users = (data?.users || []).map(u => ({
        uid: u.id,
        email: u.email,
        displayName: u.user_metadata?.name || u.user_metadata?.full_name || '',
        emailVerified: u.email_confirmed_at != null,
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at,
      }))

      return res.status(200).json({ success: true, data: { users, count: users.length } })
    } catch (error: any) {
      console.error('❌ getAllUsers Error:', error.message)
      return res.status(500).json({ success: false, message: 'Userlarni olishda xatolik.' })
    }
  },
}
