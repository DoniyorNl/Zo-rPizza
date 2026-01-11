# 🧪 Qilingan Ishlarni Test Qilish Qo'llanmasi

## 📋 Oldindan Tayyorgarlik

### 1. Environment Variables Tekshirish

**Backend uchun** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zorpizza"
PORT=5001
NODE_ENV=development
```

**Frontend uchun** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

## 🚀 Serverni Ishga Tushirish

### Terminal 1: Backend Server

```bash
cd backend
npm install  # Agar hali o'rnatilmagan bo'lsa
npm run dev
```

**Kutilayotgan natija:**
```
✅ Database connected successfully
🚀 Server running on port 5001
📍 API Base: http://localhost:5001/api
```

### Terminal 2: Frontend Server

```bash
cd frontend
npm install  # Agar hali o'rnatilmagan bo'lsa
npm run dev
```

**Kutilayotgan natija:**
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
```

---

## 🧪 Admin Products Sahifasini Test Qilish

### 1. Admin Sahifasiga Kirish

1. Brauzerda oching: `http://localhost:3000`
2. Login qiling yoki ro'yxatdan o'ting
3. Admin sahifasiga o'ting: `http://localhost:3000/admin/products`

### 2. Test Qiladigan Funksiyalar

#### ✅ Products Ro'yxati
- [ ] Barcha mahsulotlar jadvalda ko'rinadi
- [ ] Qidiruv ishlaydi (nom yoki tavsif bo'yicha)
- [ ] Rasm, nom, kategoriya, narx ko'rinadi
- [ ] Holat (Faol/Nofaol) ko'rinadi

#### ✅ Yangi Mahsulot Qo'shish
1. "Yangi mahsulot" tugmasini bosing
2. **Asosiy ma'lumotlar** tab:
   - [ ] Nom kiriting
   - [ ] Tavsif kiriting
   - [ ] Narx kiriting (masalan: 50000)
   - [ ] Tayyorlash vaqti (masalan: 15)
   - [ ] Kategoriya tanlang
   - [ ] Rasm URL kiriting (masalan: `https://images.unsplash.com/photo-1574071318508-1cdbab80d002`)
   - [ ] "Qo'shish" tugmasini bosing
3. **Qo'shimcha ma'lumotlar** tab:
   - [ ] Ingredient qo'shing (nom, miqdor, icon)
   - [ ] Retsept matni kiriting
   - [ ] Pishirish temp va vaqti
   - [ ] Qiyinlik va kishilik soni
   - [ ] Tayyorlash bosqichlari qo'shing
   - [ ] Allergenlar qo'shing
   - [ ] Qo'shimcha rasmlar qo'shing
4. **Ozuqaviy qiymat** tab:
   - [ ] Kaloriya, oqsil, uglevod, yog' kiriting

#### ✅ Mahsulotni Tahrirlash
1. Jadvalda "Edit" (✏️) tugmasini bosing
2. Ma'lumotlarni o'zgartiring
3. "Yangilash" tugmasini bosing
4. [ ] O'zgarishlar saqlandi

#### ✅ Mahsulotni O'chirish
1. Jadvalda "Delete" (🗑️) tugmasini bosing
2. Tasdiqlash xabari chiqadi
3. "OK" tugmasini bosing
4. [ ] Mahsulot o'chirildi

#### ✅ Holatni O'zgartirish
1. "Faol" yoki "Nofaol" badge'ga bosing
2. [ ] Holat o'zgardi

#### ✅ Ko'rish
1. Jadvalda "Eye" (👁️) tugmasini bosing
2. [ ] Yangi tabda mahsulot sahifasi ochildi

---

## 🐛 Muammolarni Tuzatish

### Backend ishlamayapti
- Database ulanganligini tekshiring
- Port 5001 band emasligini tekshiring
- `.env` fayl mavjudligini tekshiring

### Frontend ishlamayapti
- Port 3000 band emasligini tekshiring
- `NEXT_PUBLIC_API_URL` to'g'ri ekanligini tekshiring
- Backend ishlayotganligini tekshiring

### API xatoliklari
- Browser Console'ni oching (F12)
- Network tab'ni tekshiring
- CORS xatoliklari bo'lsa, backend CORS sozlamalarini tekshiring

### Ma'lumotlar ko'rinmayapti
- Database'da ma'lumotlar borligini tekshiring
- Seed faylni ishga tushiring: `cd backend && npm run prisma:seed`

---

## 📸 Test Qilish Checklist

- [ ] Backend server ishlayapti
- [ ] Frontend server ishlayapti
- [ ] Admin sahifasiga kirish mumkin
- [ ] Products ro'yxati ko'rinadi
- [ ] Yangi mahsulot qo'shish ishlaydi
- [ ] Tahrirlash ishlaydi
- [ ] O'chirish ishlaydi
- [ ] Holatni o'zgartirish ishlaydi
- [ ] Qidiruv ishlaydi
- [ ] Barcha tablar ishlaydi (Asosiy, Qo'shimcha, Ozuqaviy)

---

## 🎯 Keyingi Qadamlar

Agar barcha funksiyalar ishlayotgan bo'lsa:
1. ✅ Admin Products CRUD - **TAYYOR**
2. ⏭️ Admin Orders Management - **KEYINGI BOSQICH**
