// =====================================
// 📁 FILE PATH: frontend/components/ErrorBoundary.tsx
// ❌ GLOBAL ERROR BOUNDARY
// =====================================

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ErrorInfo | null
}

/**
 * Global Error Boundary - catches React rendering errors
 * Wrap app or major sections with this component
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		}
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
			errorInfo: null,
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error to console
		console.error('🔴 ErrorBoundary caught an error:', error, errorInfo)

		// Update state with error info
		this.setState({
			error,
			errorInfo,
		})

		// Log to error tracking service
		this.logErrorToService(error, errorInfo)
	}

	logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
		try {
			// Send error to backend or error tracking service (Sentry, etc.)
			const errorData = {
				message: error.message,
				stack: error.stack,
				componentStack: errorInfo.componentStack,
				url: typeof window !== 'undefined' ? window.location.href : 'unknown',
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
				timestamp: new Date().toISOString(),
			}

			// Send to backend
			if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/errors/log`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(errorData),
				}).catch(err => console.warn('Failed to log error:', err))
			}
		} catch (err) {
			console.warn('Error logging failed:', err)
		}
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		})
	}

	handleGoHome = () => {
		if (typeof window !== 'undefined') {
			window.location.href = '/'
		}
	}

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback
			}

			// Default error UI
			return (
				<div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4'>
					<Card className='w-full max-w-2xl shadow-2xl'>
						<CardHeader className='space-y-2'>
							<div className='flex justify-center mb-4'>
								<div className='w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg'>
									<AlertTriangle className='w-12 h-12 text-white' />
								</div>
							</div>
							<CardTitle className='text-3xl text-center font-bold text-gray-900'>
								Xatolik yuz berdi
							</CardTitle>
						</CardHeader>

						<CardContent className='space-y-6'>
							{/* Error Message */}
							<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
								<p className='text-red-800 font-medium mb-2'>
									{this.state.error?.message || 'Kutilmagan xatolik'}
								</p>
								{process.env.NODE_ENV === 'development' && this.state.error?.stack && (
									<details className='mt-3'>
										<summary className='text-sm text-red-600 cursor-pointer hover:text-red-700'>
											Texnik tafsilotlar
										</summary>
										<pre className='mt-2 text-xs bg-red-100 p-3 rounded overflow-x-auto'>
											{this.state.error.stack}
										</pre>
									</details>
								)}
							</div>

							{/* User-friendly message */}
							<div className='text-center text-gray-600'>
								<p>Kechirasiz, sahifani yuklashda muammo yuz berdi.</p>
								<p className='mt-1'>Sahifani yangilang yoki bosh sahifaga qayting.</p>
							</div>

							{/* Actions */}
							<div className='flex gap-4 justify-center'>
								<Button
									onClick={this.handleReset}
									className='bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
								>
									<RefreshCw className='mr-2 h-4 w-4' />
									Sahifani yangilash
								</Button>
								<Button
									onClick={this.handleGoHome}
									variant='outline'
									className='border-orange-300 hover:bg-orange-50'
								>
									<Home className='mr-2 h-4 w-4' />
									Bosh sahifaga qaytish
								</Button>
							</div>

							{/* Support */}
							<div className='text-center text-sm text-gray-500 border-t pt-4'>
								<p>Muammo davom etsa, biz bilan bog&apos;laning:</p>
								<a
									href='mailto:support@zorpizza.uz'
									className='text-orange-600 hover:text-orange-700 font-medium'
								>
									support@zorpizza.uz
								</a>
							</div>
						</CardContent>
					</Card>
				</div>
			)
		}

		return this.props.children
	}
}
