# ⚡ Qo'lda Bajarish Kerak Bo'lgan Ishlar

Loyiha deyarli tayyor. Faqat **2 ta narsa**ni o'zingiz qilishingiz kerak:

---

## 1️⃣ Supabase Database Credentials Yangilash

**Xato:** `Authentication failed - database credentials not valid`

**Yechim:** Supabase Dashboard dan yangi connection string oling:

1. [Supabase Dashboard](https://supabase.com/dashboard) ga kiring
2. Loyihangizni tanlang (zo-rpizza)
3. **Settings** → **Database** → **Connection string**
4. **URI** ni nusxalang (Transaction pooler yoki Session pooler)
5. `backend/.env` faylida `DATABASE_URL` ni yangilang:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

> ⚠️ Parol maxsus belgilar (`@`, `#`, `%`) bo'lsa, URL encode qiling.

---

## 2️⃣ Firebase Service Account Fayli

**Backend** Firebase Admin SDK uchun service account kerak.

**Qadamlar:**

1. [Firebase Console](https://console.firebase.google.com) → **zo-rpizza** loyihasi
2. ⚙️ **Project Settings** → **Service Accounts**
3. **Generate new private key** tugmasini bosing
4. Yuklab olgan JSON faylni quyidagi joyga qo'ying:

```
Zo-rPizza/backend/firebase-service-account.json
```

Fayl structure:
```
Zo-rPizza/
  backend/
    firebase-service-account.json   ← shu yerda
```

---

## ✅ Keyin Qilish Kerak Bo'lgan Buyruqlar

Database va Firebase sozlangach:

```bash
# 1. Database schema (migratsiyalar)
cd backend && pnpm run prisma:migrate

# 2. Test ma'lumotlarni yuklash
pnpm run prisma:seed

# 3. Backend ishga tushirish
pnpm dev

# 4. Yana bir terminalda - Frontend
cd frontend && pnpm dev
```

---

## 📋 Bajarilgan Ishlar

- ✅ pnpm install
- ✅ Backend .env (ALLOW_LOCALHOST_ORIGIN, sslmode qo'shildi)
- ✅ Frontend .env.local
- ✅ Prisma onlyBuiltDependencies sozlandi
- ✅ prisma:migrate script qo'shildi
