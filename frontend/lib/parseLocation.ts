/** Vergulni nuqtaga o'girib raqam qaytaradi (41,2995 -> 41.2995) */
function normalizeDecimal(s: string): number {
	const n = parseFloat(String(s).trim().replace(/,/g, '.'))
	return Number.isFinite(n) ? n : 0
}

/**
 * Google Maps linkidan yoki "lat, lng" matnidan koordinatalarni ajratib oladi.
 * Google doim lat, lng tartibida ishlatadi. Qisqa linklar uchun avval resolve-map-url chaqing.
 */
export function parseLocationInput(input: string): { lat: number; lng: number } | null {
	if (!input || typeof input !== 'string') return null
	const trimmed = input.trim()

	const valid = (lat: number, lng: number) =>
		lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180

	// 1) "41.2995, 69.2401" – qo'lda yoki "Koordinatalarni nusxalash" dan (lat, lng)
	const twoNumbers = trimmed.match(/^(-?[\d,]+\.?\d*)\s*[,،]\s*(-?[\d,]+\.?\d*)\s*$/)
	if (twoNumbers) {
		const lat = normalizeDecimal(twoNumbers[1])
		const lng = normalizeDecimal(twoNumbers[2])
		if (valid(lat, lng)) return { lat, lng }
	}

	// 2) Google Maps: !3dLAT!4dLNG (Share linkida tez-tez uchraydi)
	const m3d4d = trimmed.match(/!3d(-?[\d,.]+)!4d(-?[\d,.]+)/)
	if (m3d4d) {
		const lat = normalizeDecimal(m3d4d[1])
		const lng = normalizeDecimal(m3d4d[2])
		if (valid(lat, lng)) return { lat, lng }
	}
	// !4dLNG!3dLAT tartibi ham bo'lishi mumkin
	const m4d3d = trimmed.match(/!4d(-?[\d,.]+)!3d(-?[\d,.]+)/)
	if (m4d3d) {
		const lng = normalizeDecimal(m4d3d[1])
		const lat = normalizeDecimal(m4d3d[2])
		if (valid(lat, lng)) return { lat, lng }
	}

	// 3) Google Maps: ?q=lat,lng yoki @lat,lng,zoom (q va @ har doim lat,lng; zoomdan ajratish uchun [\d.]+)
	const inUrl = trimmed.match(/(?:[?&]q=|@)(-?[\d.]+)\s*,\s*(-?[\d.]+)/)
	if (inUrl) {
		const lat = normalizeDecimal(inUrl[1])
		const lng = normalizeDecimal(inUrl[2])
		if (valid(lat, lng)) return { lat, lng }
	}

	// 4) ll=lat,lng yoki center=lat,lng
	const ll = trimmed.match(/(?:ll|center)=(-?[\d.]+)\s*,\s*(-?[\d.]+)/)
	if (ll) {
		const lat = normalizeDecimal(ll[1])
		const lng = normalizeDecimal(ll[2])
		if (valid(lat, lng)) return { lat, lng }
	}

	// 5) Ixtiyoriy: ikkita son ketma-ket (oxirgi fallback). Standart tartib: birinchi lat, ikkinchi lng.
	const anyTwo = trimmed.match(/(-?[\d,.]+)\s*,\s*(-?[\d,.]+)/)
	if (anyTwo) {
		const a = normalizeDecimal(anyTwo[1])
		const b = normalizeDecimal(anyTwo[2])
		if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return { lat: a, lng: b }
		if (b >= -90 && b <= 90 && a >= -180 && a <= 180) return { lat: b, lng: a }
	}
	return null
}

export { normalizeDecimal }
