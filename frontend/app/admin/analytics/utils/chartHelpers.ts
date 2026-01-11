export const formatCurrency = (amount: number): string => {
	return (
		new Intl.NumberFormat('uz-UZ', {
			style: 'decimal',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount) + " so'm"
	)
}

export const formatDate = (date: string): string => {
	return new Date(date).toLocaleDateString('uz-UZ', {
		month: 'short',
		day: 'numeric',
	})
}

export const formatNumber = (num: number): string => {
	return new Intl.NumberFormat('uz-UZ').format(num)
}

export const getPercentageChange = (current: number, previous: number): number => {
	if (previous === 0) return 0
	return ((current - previous) / previous) * 100
}

export const getDateRangePreset = (range: string): { startDate: Date; endDate: Date } => {
	const end = new Date()
	const start = new Date()

	switch (range) {
		case '7d':
			start.setDate(end.getDate() - 7)
			break
		case '30d':
			start.setDate(end.getDate() - 30)
			break
		case '90d':
			start.setDate(end.getDate() - 90)
			break
		case 'all':
			start.setFullYear(2020, 0, 1)
			break
		default:
			start.setDate(end.getDate() - 30)
	}

	return { startDate: start, endDate: end }
}
