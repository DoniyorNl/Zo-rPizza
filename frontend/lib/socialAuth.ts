// frontend/lib/socialAuth.ts
// Supabase OAuth for Google login
import { supabase } from './supabase'

export const signInWithGoogle = async (): Promise<void> => {
	const { error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${window.location.origin}/auth/callback`,
			queryParams: {
				access_type: 'offline',
				prompt: 'select_account',
			},
		},
	})
	if (error) throw error
}

export const getSocialAuthErrorMessage = (error: unknown): string => {
	if (error && typeof error === 'object' && 'message' in error) {
		return (error as { message: string }).message
	}
	return "Ijtimoiy tarmoq orqali kirishda xatolik yuz berdi. Qayta urinib ko'ring."
}
