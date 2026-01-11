'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCartStore } from '@/store/cartStore'
import axios from 'axios'
import { AlertCircle, ArrowLeft, ChefHat, Clock, Flame, Plus, Users, Utensils } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

// Interface o'zgarishsiz
interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  prepTime: number
  ingredients?: Array<{ name: string; amount: string; icon?: string }>
  recipe?: string
  cookingTemp?: number
  cookingTime?: number
  cookingSteps?: Array<{ step: number; title: string; description: string }>
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  difficulty?: string
  servings?: number
  allergens?: string[]
  images?: string[]
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addItem } = useCartStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
        const productData = response.data.data
        
        // Sizning original parsing logikangiz (o'zgarishsiz)
        if (productData.ingredients && typeof productData.ingredients === 'string') {
          try { productData.ingredients = JSON.parse(productData.ingredients) } catch (e) { console.error(e) }
        }
        if (productData.cookingSteps && typeof productData.cookingSteps === 'string') {
          try { productData.cookingSteps = JSON.parse(productData.cookingSteps) } catch (e) { console.error(e) }
        }
        if (!productData.images) productData.images = []
        if (!productData.allergens) productData.allergens = []
        
        setProduct(productData)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // Original handleAddToCart (o'zgarishsiz)
  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || (product.images && product.images[0]) || '/images/placeholder.png',
    })
  }

  if (loading) return <div className='min-h-screen flex items-center justify-center font-medium text-stone-500'>Yuklanmoqda...</div>
  if (!product) return <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
    <h1 className='text-xl font-bold'>Mahsulot topilmadi</h1>
    <Button onClick={() => router.push('/')}>Bosh sahifaga qaytish</Button>
  </div>

  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || '/images/placeholder.png']

  return (
    <main className='min-h-screen bg-white'>
      <Header />

      <div className='container mx-auto px-4 py-4 max-w-5xl'>
        <Button variant='ghost' size="sm" onClick={() => router.back()} className='mb-4 text-stone-500'>
          <ArrowLeft className='w-4 h-4 mr-1' /> Orqaga
        </Button>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Visual Section */}
          <div className='space-y-4'>
            <div className='relative aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm'>
              <Image src={displayImages[selectedImage]} alt={product.name} fill className='object-cover' priority />
            </div>
            {displayImages.length > 1 && (
              <div className='flex gap-2 overflow-x-auto pb-2'>
                {displayImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-orange-500' : 'border-transparent opacity-60'
                    }`}
                  >
                    <Image src={img} alt='thumb' fill className='object-cover' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className='flex flex-col'>
            <div className='mb-4'>
              <div className='flex gap-2 mb-2'>
                {product.difficulty && <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50">{product.difficulty}</Badge>}
                {product.servings && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{product.servings} kishi</Badge>}
              </div>
              <h1 className='text-3xl font-bold text-stone-900 mb-2'>{product.name}</h1>
              <p className='text-stone-600 text-sm leading-relaxed'>{product.description}</p>
            </div>

            <div className='grid grid-cols-2 gap-3 mb-6'>
              <div className='flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100'>
                <Clock className='w-4 h-4 text-orange-500' />
                <div>
                  <p className='text-[10px] text-stone-400 uppercase font-bold'>Tayyorlash</p>
                  <p className='text-sm font-semibold'>{product.prepTime} daq</p>
                </div>
              </div>
              {product.cookingTime && (
                <div className='flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100'>
                  <Flame className='w-4 h-4 text-orange-500' />
                  <div>
                    <p className='text-[10px] text-stone-400 uppercase font-bold'>Pishirish</p>
                    <p className='text-sm font-semibold'>{product.cookingTemp}°C / {product.cookingTime} daq</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price Card */}
            <Card className='bg-orange-600 text-white border-none shadow-lg shadow-orange-100 mb-6'>
              <CardContent className='p-4 flex items-center justify-between'>
                <div>
                  <p className='text-orange-100 text-xs uppercase font-bold'>Narxi</p>
                  <p className='text-2xl font-black'>{product.price.toLocaleString()} <span className='text-sm font-normal'>so'm</span></p>
                </div>
                <Button onClick={handleAddToCart} className='bg-white text-orange-600 hover:bg-stone-100 rounded-xl px-6'>
                  <Plus className='w-5 h-5 mr-1' /> Qo'shish
                </Button>
              </CardContent>
            </Card>

            {/* Tabs for extra info */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="details">Tarkibi</TabsTrigger>
                <TabsTrigger value="steps">Retsept</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {product.calories && (
                   <div className='flex justify-between p-3 bg-stone-50 rounded-lg text-center'>
                     <div><p className='text-xs text-stone-400'>Kkal</p><p className='font-bold'>{product.calories}</p></div>
                     <div><p className='text-xs text-stone-400'>Oqsil</p><p className='font-bold'>{product.protein}g</p></div>
                     <div><p className='text-xs text-stone-400'>Uglevod</p><p className='font-bold'>{product.carbs}g</p></div>
                     <div><p className='text-xs text-stone-400'>Yog'</p><p className='font-bold'>{product.fat}g</p></div>
                   </div>
                )}
                <div className='grid grid-cols-1 gap-2'>
                  {product.ingredients?.map((ing, idx) => (
                    <div key={idx} className='flex justify-between items-center text-sm p-2 border-b border-stone-100'>
                      <span className='text-stone-600'>{ing.icon} {ing.name}</span>
                      <span className='font-semibold'>{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                {product.cookingSteps?.map((step, idx) => (
                  <div key={idx} className='flex gap-3'>
                    <span className='flex-shrink-0 w-6 h-6 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center text-xs font-bold'>{step.step}</span>
                    <p className='text-sm text-stone-600'><span className='font-bold text-stone-800'>{step.title}:</span> {step.description}</p>
                  </div>
                ))}
                {product.recipe && <p className='text-xs text-stone-500 italic mt-4'>{product.recipe}</p>}
              </TabsContent>
            </Tabs>

            {product.allergens && product.allergens.length > 0 && (
              <div className='mt-4 p-3 bg-red-50 rounded-lg flex gap-2 items-center'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <p className='text-[11px] text-red-600 font-medium'>Allergenlar: {product.allergens.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}