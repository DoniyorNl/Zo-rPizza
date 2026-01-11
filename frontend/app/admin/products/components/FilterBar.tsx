import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { FilterStatus } from '../types/product.types'

interface FilterBarProps {
	searchTerm: string
	setSearchTerm: (term: string) => void
	filterStatus: FilterStatus
	setFilterStatus: (status: FilterStatus) => void
}

export function FilterBar({
	searchTerm,
	setSearchTerm,
	filterStatus,
	setFilterStatus,
}: FilterBarProps) {
	return (
		<Card className='mb-6'>
			<CardContent className='pt-6'>
				<div className='flex gap-4'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
						<input
							type='text'
							placeholder='Mahsulot qidirish...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
						/>
					</div>
					<div className='flex gap-2'>
						<Button
							variant={filterStatus === 'active' ? 'default' : 'outline'}
							onClick={() => setFilterStatus('active')}
							className={filterStatus === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
						>
							Faol
						</Button>
						<Button
							variant={filterStatus === 'inactive' ? 'default' : 'outline'}
							onClick={() => setFilterStatus('inactive')}
							className={filterStatus === 'inactive' ? 'bg-gray-600 hover:bg-gray-700' : ''}
						>
							Nofaol
						</Button>
						<Button
							variant={filterStatus === 'all' ? 'default' : 'outline'}
							onClick={() => setFilterStatus('all')}
							className={filterStatus === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
						>
							Hammasi
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
