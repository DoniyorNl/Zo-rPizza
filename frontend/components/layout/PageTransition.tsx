// frontend/components/layout/PageTransition.tsx
// Page transition wrapper with Framer Motion

'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
	children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
	return (
		<LazyMotion features={domAnimation}>
			<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
				{children}
			</m.div>
		</LazyMotion>
	)
}
