// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Custom Request tipi (userId qo'shish uchun)
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Header dan token olish
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi. Tizimga kiring.'
      });
    }

    // Firebase Admin SDK orqali tokenni tekshirish
    const decodedToken = await auth.verifyIdToken(token);
    
    // User ma'lumotlarini requestga qo'shish
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;

    next();
  } catch (error: any) {
    console.error('Auth middleware xatosi:', error.message);
    
    return res.status(403).json({
      success: false,
      message: 'Token yaroqsiz yoki muddati tugagan.'
    });
  }
};

// Admin rolini tekshirish (kelajakda kerak bo'ladi)
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Autentifikatsiya talab qilinadi.'
      });
    }

    // Firebase dan user ma'lumotlarini olish
    const user = await auth.getUser(req.userId);
    
    // Custom claims orqali admin ekanligini tekshirish
    if (!user.customClaims?.admin) {
      return res.status(403).json({
        success: false,
        message: 'Sizda admin huquqlari yo\'q.'
      });
    }

    next();
  } catch (error: any) {
    console.error('Admin middleware xatosi:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Admin huquqlarini tekshirishda xatolik.'
    });
  }
};