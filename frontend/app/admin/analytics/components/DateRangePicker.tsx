import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { TimeRange } from '../types/analytics.types'

interface DateRangePickerProps {
	selectedRange: TimeRange
	onRangeChange: (range: TimeRange) => void
}

export function DateRangePicker({ selectedRange, onRangeChange }: DateRangePickerProps) {
	const ranges: { value: TimeRange; label: string }[] = [
		{ value: '7d', label: "So'nggi 7 kun" },
		{ value: '30d', label: "So'nggi 30 kun" },
		{ value: '90d', label: "So'nggi 90 kun" },
		{ value: 'all', label: 'Barchasi' },
	]

	return (
		<Card>
			<CardContent className='pt-6'>
				<div className='flex items-center gap-2'>
					<Calendar className='w-5 h-5 text-gray-600' />
					<span className='text-sm font-medium text-gray-600 mr-4'>Davr:</span>
					<div className='flex gap-2'>
						{ranges.map(range => (
							<Button
								key={range.value}
								variant={selectedRange === range.value ? 'default' : 'outline'}
								size='sm'
								onClick={() => onRangeChange(range.value)}
								className={selectedRange === range.value ? 'bg-orange-600 hover:bg-orange-700' : ''}
							>
								{range.label}
							</Button>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
