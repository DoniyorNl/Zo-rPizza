// Yetkazib berish / Olib ketish va tanlangan filial (production: sahifa yangilansa ham saqlanadi)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Branch {
	id: string
	name: string
	address: string
	lat: number
	lng: number
	phone: string | null
	isActive: boolean
}

type DeliveryMethod = 'delivery' | 'pickup'

interface DeliveryStore {
	method: DeliveryMethod
	selectedBranch: Branch | null
	setMethod: (m: DeliveryMethod) => void
	setSelectedBranch: (b: Branch | null) => void
	clearPickup: () => void
}

export const useDeliveryStore = create<DeliveryStore>()(
	persist(
		(set) => ({
			method: 'delivery',
			selectedBranch: null,
			setMethod: (method) => set({ method }),
			setSelectedBranch: (selectedBranch) => set({ selectedBranch }),
			clearPickup: () => set({ selectedBranch: null }),
		}),
		{ name: 'zor-pizza-delivery' }
	)
)
