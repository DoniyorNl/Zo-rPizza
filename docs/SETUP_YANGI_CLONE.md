# 🍕 Zo-rPizza - Yangi Clone'dan To'liq Ishga Tushirish

Loyihani o'chirib qayta clone qilgandan keyin barcha qadamlar.

---

## 1️⃣ Dasturlarni Tekshirish

Quyidagilar o'rnatilgan bo'lishi kerak:

| Dastur | Versiya | Tekshirish |
|--------|---------|------------|
| **Node.js** | 18+ | `node -v` |
| **pnpm** | 8+ | `pnpm -v` |
| **PostgreSQL** | 14+ | `psql --version` |

pnpm yo'q bo'lsa:
```bash
npm install -g pnpm
```

---

## 2️⃣ Dependency'larni O'rnatish

```bash
# Loyiha root papkasida
cd /Users/mac/Desktop/Zo-rPizza

pnpm install
```

Bu backend va frontend uchun dependency'larni o'rnatadi. Prisma Client ham avtomatik generate qilinadi.

---

## 3️⃣ PostgreSQL Bazasini Sozlash

### Variant A: Lokal PostgreSQL

```bash
# PostgreSQL ishga tushiring (macOS: brew services start postgresql@14)
# Yoki pgAdmin orqali

# Yangi database yarating
createdb zorpizza
# yoki
psql -U postgres -c "CREATE DATABASE zorpizza;"
```

### Variant B: Docker

```bash
docker run -d --name zorpizza-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=zorpizza \
  -p 5432:5432 \
  postgres:15
```

---

## 4️⃣ Backend .env Faylini Yaratish

```bash
cd backend
cp .env.example .env
```

`.env` faylini tahrirlang:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zorpizza"
PORT=5001
NODE_ENV=development
FRONTEND_URLS="http://localhost:3000"
ALLOW_LOCALHOST_ORIGIN=true
```

### Firebase Admin SDK (Backend Auth uchun)

**Development uchun eng oson usul:**

1. [Firebase Console](https://console.firebase.google.com) → Zo-rPizza loyihasi
2. ⚙️ Project Settings → Service Accounts → **Generate new private key**
3. JSON faylni `backend/firebase-service-account.json` sifatida saqlang

Fayl structure:
```
Zo-rPizza/
  backend/
    firebase-service-account.json   ← shu yerda
```

> ⚠️ Bu fayl `.gitignore` da bo'lgani uchun GitHubga yuklanmaydi. Xavfsizlik uchun to'g'ri.

---

## 5️⃣ Database Migration va Seed

```bash
cd backend

# Prisma Client generatsiya
npx prisma generate

# Migration'larni qo'llash
npx prisma migrate deploy
# yoki (development uchun)
npx prisma db push

# Test ma'lumotlarni yuklash (kategoriyalar, mahsulotlar, va hokazo)
pnpm run prisma:seed
```

---

## 6️⃣ Frontend .env.local (Ixtiyoriy)

Frontend localhost'da ishlaganda avtomatik `http://localhost:5001` dan API chaqiradi. Lekin production API ishlatmoqchi bo'lsangiz:

```bash
cd frontend
cp .env.example .env.local
```

Firebase config allaqachon `lib/firebase.ts` da mavjud - odatda `.env.local` kerak emas.

---

## 7️⃣ Loyihani Ishga Tushirish

### Terminal 1 - Backend

```bash
cd backend
pnpm dev
```

✅ `http://localhost:5001` da backend ishlashi kerak.

### Terminal 2 - Frontend

```bash
cd frontend
pnpm dev
```

✅ `http://localhost:3000` da frontend ochiladi.

### Yoki ikkalasini birga (root'dan):

```bash
pnpm dev:both
```

---

## 8️⃣ Birinchi Admin Yaratish

1. Brauzerda `http://localhost:3000` ga kiring
2. **Ro'yxatdan o'ting** (Firebase Auth orqali)
3. Firebase UID ni oling:
   - Brauzer Console: `JSON.parse(localStorage.getItem('firebaseUser')).uid`
   - Yoki Firebase Console → Authentication → Users
4. Database da admin qiling:

```bash
cd backend
npx tsx src/scripts/create-first-admin.ts
# Skript sizdan email so'raydi - ro'yxatdan o'tgan email kiriting
```

Yoki SQL orqali:
```sql
-- Prisma Studio orqali: npx prisma studio
UPDATE users SET role = 'ADMIN' WHERE email = 'sizning@email.com';
```

---

## 9️⃣ Tekshirish

| URL | Vazifa |
|-----|--------|
| http://localhost:3000 | Asosiy sahifa |
| http://localhost:3000/admin | Admin panel (admin hisob kerak) |
| http://localhost:5001/health | Backend health check |
| http://localhost:5001/api/products | Mahsulotlar API |

```bash
# Backend testlar
cd backend && pnpm test

# Frontend testlar
cd frontend && pnpm test
```

---

## ❗ Muammolarni Bartaraf Etish

### "Firebase configuration not found"
- `backend/firebase-service-account.json` faylini qo'shing
- Yoki `FIREBASE_SERVICE_ACCOUNT_BASE64` env o'rnating

### "Can't reach database server"
- PostgreSQL ishlayotganini tekshir: `pg_isready -h localhost`
- `DATABASE_URL` to'g'riligini tekshir

### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### Port band
- Backend: 5001, Frontend: 3000
- Boshqa process ishlatayotgan bo'lsa portni o'zgartiring yoki process ni to'xtating

### CORS xatosi
- `.env` da `FRONTEND_URLS="http://localhost:3000"` va `ALLOW_LOCALHOST_ORIGIN=true` bo'lishini tekshir

---

## 📁 Fayl Strukturasi (Muhim)

```
Zo-rPizza/
├── backend/
│   ├── .env                    ← Siz yaratasiz (cp .env.example .env)
│   ├── .env.example            ← Namuna
│   └── firebase-service-account.json  ← Firebase dan yuklab olasiz
├── frontend/
│   └── .env.local              ← Ixtiyoriy
└── docs/
    └── SETUP_YANGI_CLONE.md    ← Bu fayl
```

---

**Tayyor!** 🎉 Loyiha to'liq ishlashi kerak.
