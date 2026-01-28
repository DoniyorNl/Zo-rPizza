# 🍕 ZOR PIZZA - PROFESSIONAL PROFIL SAHIFASI

## 📋 UMUMIY MA'LUMOT

Professional pizzerialarda foydalanuvchi profili quyidagi asosiy qismlarga ega bo'lishi kerak:

### ✅ Amalga oshirilgan funksiyalar:

## 1️⃣ BACKEND (Ma'lumotlar bazasi va API)

### Database Schema Yangilanishlari:

#### User Model - Yangi maydonlar:
```prisma
// Profil ma'lumotlari
avatar          String?   // Profil rasmi URL
dateOfBirth     DateTime? // Tug'ilgan kun (maxsus takliflar uchun)
gender          String?   // Jins

// Afzalliklar
favoriteProducts Json?     // Sevimli mahsulotlar
dietaryPrefs     String[]  // Ovqatlanish afzalliklari
allergyInfo      String[]  // Allergiya ma'lumotlari

// Loyalty va Gamification
loyaltyPoints   Int      @default(0)  // Loyalty ballar
totalSpent      Float    @default(0)  // Jami xarajat
memberSince     DateTime @default(now()) // A'zo bo'lgan sana
```

#### Address Model - Yangi jadval:
```prisma
model Address {
  id          String   @id @default(uuid())
  userId      String
  label       String   // 'Uy', 'Ish', 'Boshqa'
  street      String
  building    String?  // Bino raqami
  apartment   String?  // Kvartira
  floor       String?  // Qavat
  entrance    String?  // Kirish
  landmark    String?  // Mo'ljal
  lat         Float?
  lng         Float?
  isDefault   Boolean  @default(false)
}
```

### API Endpoints:

#### 1. Profil Statistikasi
**GET /api/profile/stats**
- Foydalanuvchi ma'lumotlari
- Buyurtmalar statistikasi
- Sevimli mahsulotlar
- So'nggi buyurtmalar
- Loyalty tier (BRONZE, SILVER, GOLD, PLATINUM)

#### 2. Profil Yangilash
**PUT /api/profile**
- Ism, telefon yangilash
- Tug'ilgan kun qo'shish
- Jins tanlash
- Ovqatlanish afzalliklari

#### 3. Manzillar Boshqaruvi
**GET /api/profile/addresses** - Barcha manzillar
**POST /api/profile/addresses** - Yangi manzil qo'shish
**PUT /api/profile/addresses/:id** - Manzilni yangilash
**DELETE /api/profile/addresses/:id** - Manzilni o'chirish

## 2️⃣ FRONTEND (Foydalanuvchi interfeysi)

### Profil Sahifasi Tuzilishi:

#### 📊 Statistika Kartochkalari (4 ta):
1. **Jami buyurtmalar** - Orange gradient
2. **Jami xarajat** - Green gradient
3. **Loyalty ballar** - Purple gradient
4. **O'rtacha buyurtma** - Blue gradient

#### 📑 Tabs (4 ta bo'lim):

##### 1. UMUMIY (Overview)
- **Shaxsiy ma'lumotlar:**
  - Email
  - Ism
  - Telefon
  - Tug'ilgan kun
  - Jins
  - A'zo bo'lgan sana
  - Tahrirlash funksiyasi

- **Sevimli mahsulotlar:**
  - Eng ko'p buyurtma qilingan mahsulotlar
  - Mahsulot rasmi va narxi
  - Buyurtmalar soni

- **So'nggi buyurtmalar:**
  - Oxirgi 5 ta buyurtma
  - Status va narx
  - Batafsil ko'rish

##### 2. BUYURTMALAR (Orders)
- Buyurtmalar statistikasi
- Status bo'yicha taqsimlash
- Barcha buyurtmalarni ko'rish tugmasi

##### 3. MANZILLAR (Addresses)
- Saqlangan manzillar ro'yxati
- Yangi manzil qo'shish
- Asosiy manzil belgilash
- Manzilni o'chirish

##### 4. SOZLAMALAR (Settings)
- Xavfsizlik sozlamalari
- Bildirishnomalar sozlamalari
- Akkauntni o'chirish

### 🎨 Dizayn Xususiyatlari:

#### Ranglar:
- **Orange** - Asosiy rang (brand color)
- **Green** - Muvaffaqiyat va xarajatlar
- **Purple** - Loyalty va mukofotlar
- **Blue** - Statistika va ma'lumotlar

#### Loyalty Tier Ranglari:
- **BRONZE** - Orange (0-199 ball)
- **SILVER** - Gray (200-499 ball)
- **GOLD** - Yellow (500-999 ball)
- **PLATINUM** - Purple (1000+ ball)

#### Animatsiyalar:
- Hover effektlari
- Smooth transitions
- Gradient backgrounds
- Shadow effects

## 3️⃣ BACKEND-FRONTEND MA'LUMOT ALMASHINUVI

### Ma'lumot Oqimi:

```
1. Frontend → Backend:
   - GET /api/profile/stats (Token bilan)
   - Foydalanuvchi autentifikatsiya qilinadi
   - Ma'lumotlar bazasidan parallel queries
   
2. Backend → Database:
   - User ma'lumotlari
   - Orders statistikasi
   - Sevimli mahsulotlar
   - Manzillar
   
3. Database → Backend:
   - Aggregated data
   - Calculated statistics
   - Loyalty tier hisoblash
   
4. Backend → Frontend:
   - JSON format
   - Strukturlangan ma'lumotlar
   - Error handling
```

### Xavfsizlik:

1. **Authentication:**
   - Firebase token talab qilinadi
   - Har bir so'rovda token tekshiriladi

2. **Authorization:**
   - Foydalanuvchi faqat o'z ma'lumotlarini ko'radi
   - Boshqa foydalanuvchi ma'lumotlariga kirish yo'q

3. **Validation:**
   - Telefon format tekshiruvi
   - Email format tekshiruvi
   - Ma'lumotlar sanitization

## 4️⃣ PROFESSIONAL XUSUSIYATLAR

### Real Pizzerialarda Mavjud Bo'lgan Funksiyalar:

✅ **Loyalty Program:**
- Ball to'plash tizimi
- Tier darajalari
- Mukofotlar

✅ **Order History:**
- Barcha buyurtmalar tarixi
- Status tracking
- Qayta buyurtma qilish

✅ **Saved Addresses:**
- Ko'p manzillar saqlash
- Asosiy manzil
- Tez buyurtma berish

✅ **Favorite Products:**
- Sevimli mahsulotlar
- Tez kirish
- Takliflar

✅ **Profile Management:**
- To'liq profil ma'lumotlari
- Tahrirlash imkoniyati
- Xavfsizlik sozlamalari

✅ **Statistics & Analytics:**
- Xarajatlar tahlili
- Buyurtmalar statistikasi
- O'rtacha qiymatlar

## 5️⃣ DATABASE MIGRATION

### Migration Buyruqlari:

```bash
# Backend papkasiga o'tish
cd backend

# Prisma migration yaratish
npx prisma migrate dev --name add_profile_features

# Prisma Client yangilash
npx prisma generate
```

## 6️⃣ ISHGA TUSHIRISH

### Backend:
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npm run dev
```

### Profil sahifasiga kirish:
```
http://localhost:3000/profile
```

## 7️⃣ KELAJAKDA QO'SHILISHI MUMKIN BO'LGAN FUNKSIYALAR

🔮 **Qo'shimcha imkoniyatlar:**
- Profil rasmi yuklash
- Tug'ilgan kun uchun maxsus chegirmalar
- Referral program
- Ijtimoiy tarmoqlar integratsiyasi
- Buyurtma shablonlari
- Takroriy buyurtmalar
- Ovqatlanish cheklovlari bo'yicha filtrlash
- Allergiya ogohlantirish tizimi

## 📝 XULOSA

Professional profil sahifasi quyidagi asosiy tamoyillar asosida yaratildi:

1. **Senior Level Best Practices:**
   - Clean code
   - Type safety (TypeScript)
   - Error handling
   - Performance optimization
   - Security first

2. **User Experience:**
   - Intuitive interface
   - Fast loading
   - Responsive design
   - Clear navigation

3. **Business Value:**
   - Customer retention
   - Loyalty program
   - Data collection
   - Personalization

4. **Scalability:**
   - Modular architecture
   - Database optimization
   - API design
   - Future-proof structure

---

**Muallif:** Cascade AI
**Sana:** 2025-01-27
**Versiya:** 1.0.0
