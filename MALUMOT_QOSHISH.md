# 📝 Ma'lumot Qo'shish Qo'llanmasi

Bu qo'llanmada Zo-rPizza loyihasiga yangi mahsulotlar qo'shishning **3 ta oson yo'li** ko'rsatilgan.

---

## 🎯 1-usul: Seed Fayl Orqali (ENG OSON)

### Qadamlar:

1. **`backend/prisma/seed.ts`** faylini oching

2. **Mahsulotlar bo'limiga** yangi mahsulot qo'shing:

```typescript
const yangiPitsa = await prisma.product.upsert({
	where: { id: 'yangi-pitsa-1' },
	update: {},
	create: {
		id: 'yangi-pitsa-1',
		name: 'Yangi Pitsa',
		description: 'Tavsif yozing',
		price: 50000,
		imageUrl: 'https://rasm-url.com/image.jpg',
		prepTime: 15,
		categoryId: pizzaCategory.id, // Kategoriya ID
		isActive: true,
		
		// Qo'shimcha ma'lumotlar (ixtiyoriy):
		ingredients: [
			{ name: 'Un', amount: '500g', icon: '🌾' },
			{ name: 'Pishloq', amount: '200g', icon: '🧀' },
		],
		recipe: 'To\'liq retsept matni...',
		cookingTemp: 220,
		cookingTime: 15,
		cookingSteps: [
			{
				step: 1,
				title: 'Bosqich nomi',
				description: 'Tavsif',
			},
		],
		calories: 300,
		protein: 15.0,
		carbs: 30.0,
		fat: 12.0,
		difficulty: 'Oson',
		servings: 2,
		allergens: ['Sut', 'Gluten'],
		images: [
			'https://rasm1.jpg',
			'https://rasm2.jpg',
		],
	},
})
```

3. **Terminalda** quyidagi buyruqni bajaring:

```bash
cd backend
npm run prisma:seed
```

⚠️ **Eslatma**: Seed fayl mavjud ma'lumotlarni yangilaydi (upsert). Agar yangi ma'lumot qo'shmoqchi bo'lsangiz, yangi `id` ishlating.

---

## 🚀 2-usul: API Orqali (Postman/Curl)

### Postman yoki har qanday REST client orqali:

**URL**: `POST https://your-backend-url.com/api/products`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
	"name": "Yangi Pitsa",
	"description": "Tavsif yozing",
	"price": 50000,
	"imageUrl": "https://rasm-url.com/image.jpg",
	"prepTime": 15,
	"categoryId": "kategoriya-id-bu-yerda",
	"isActive": true,
	
	"ingredients": [
		{ "name": "Un", "amount": "500g", "icon": "🌾" },
		{ "name": "Pishloq", "amount": "200g", "icon": "🧀" }
	],
	"recipe": "To'liq retsept matni...",
	"cookingTemp": 220,
	"cookingTime": 15,
	"cookingSteps": [
		{
			"step": 1,
			"title": "Bosqich nomi",
			"description": "Tavsif"
		}
	],
	"calories": 300,
	"protein": 15.0,
	"carbs": 30.0,
	"fat": 12.0,
	"difficulty": "Oson",
	"servings": 2,
	"allergens": ["Sut", "Gluten"],
	"images": [
		"https://rasm1.jpg",
		"https://rasm2.jpg"
	]
}
```

### Curl orqali:

```bash
curl -X POST https://your-backend-url.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Yangi Pitsa",
    "description": "Tavsif",
    "price": 50000,
    "categoryId": "kategoriya-id",
    "prepTime": 15
  }'
```

---

## 📋 3-usul: JavaScript/TypeScript Script Orqali

Yangi fayl yarating: `backend/scripts/add-product.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addProduct() {
	const product = await prisma.product.create({
		data: {
			name: 'Yangi Pitsa',
			description: 'Tavsif',
			price: 50000,
			imageUrl: 'https://rasm-url.com/image.jpg',
			prepTime: 15,
			categoryId: 'kategoriya-id-bu-yerda',
			isActive: true,
			// Qo'shimcha maydonlar...
		},
	})
	
	console.log('✅ Mahsulot qo\'shildi:', product)
}

addProduct()
	.catch(console.error)
	.finally(() => prisma.$disconnect())
```

Ishga tushirish:
```bash
cd backend
npx tsx scripts/add-product.ts
```

---

## 📌 Zaruriy Maydonlar

Quyidagi maydonlar **majburiy**:
- `name` - Mahsulot nomi
- `price` - Narx (son)
- `categoryId` - Kategoriya ID

Barcha boshqa maydonlar **ixtiyoriy**.

---

## 🔍 Kategoriya ID ni Topish

Kategoriya ID ni topish uchun:

1. **API orqali**:
```bash
GET https://your-backend-url.com/api/categories
```

2. **Database'dan**:
```bash
cd backend
npx prisma studio
```

---

## 💡 Maslahatlar

1. **Rasmlar**: Unsplash yoki boshqa bepul rasmlardan foydalaning
2. **Narx**: So'm formatida kiriting (masalan: 50000)
3. **ID**: Har bir mahsulot uchun noyob ID ishlating
4. **Allergenlar**: Array formatida kiriting: `["Sut", "Gluten"]`
5. **Images**: Ko'p rasmlar uchun array: `["url1", "url2"]`

---

## ❓ Savollar?

Agar muammo bo'lsa, backend loglarini tekshiring:
```bash
cd backend
npm run dev
```
