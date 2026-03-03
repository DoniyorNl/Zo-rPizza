// frontend/app/(shop)/menu/page.tsx
// 🍕 MENU PAGE – Server reads searchParams, avoids client suspense gating

import MenuClient from './menu-client'

export default function MenuPage({
	searchParams,
}: {
	searchParams?: { product?: string | string[] }
}) {
	const highlightProductId =
		typeof searchParams?.product === 'string'
			? searchParams.product
			: Array.isArray(searchParams?.product)
				? searchParams!.product[0] ?? null
				: null

	return <MenuClient highlightProductId={highlightProductId} />
}
