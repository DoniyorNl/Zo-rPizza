import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // yoki supabase client

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Supabase'ga haqiqiy so'rov yuborish ✅
        await prisma.$queryRaw`SELECT 1`

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        return NextResponse.json(
            { status: 'error', message: 'DB unreachable' },
            { status: 500 }
        )
    }
}