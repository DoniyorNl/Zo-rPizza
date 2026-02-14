# 🚀 Deployment Guide - Local va Production Sync

## Maqsad

Local va production muhitlarda bir xil kod va endpoint'lar ishlashi.

---

## 📋 Pre-Deployment Checklist

### 1. Local Testing

```bash
# Backend test
cd backend
pnpm test

# Frontend test
cd frontend
pnpm test

# E2E test
pnpm test:e2e
```

### 2. Endpoint Sync Tekshiruvi

```bash
# Local endpoints
curl http://localhost:5001/ | jq '.endpoints'

# Production endpoints (deploy qilgandan keyin)
curl https://zo-rpizza-production.up.railway.app/ | jq '.endpoints'
```

**Kerakli endpoint'lar:**

- ✅ `/api/auth`
- ✅ `/api/notifications`
- ✅ `/api/tracking`
- ✅ `/api/orders`
- ✅ `/api/products`
- ✅ `/api/dashboard`
- ✅ `/api/analytics`

---

## 🔄 Production Deploy Process

### Railway (Backend)

```bash
# 1. O'zgarishlarni commit qiling
git add .
git commit -m "feat: your changes description"

# 2. Push to main branch
git push origin main

# 3. Railway avtomatik deploy qiladi (2-3 daqiqa)
# Deploy statusini tekshirish: https://railway.app/dashboard
```

### Vercel/Netlify (Frontend)

```bash
# 1. Frontend o'zgarishlarini commit qiling
git add frontend/
git commit -m "feat: frontend updates"

# 2. Push
git push origin main

# 3. Vercel/Netlify avtomatik deploy qiladi
```

---

## 🔍 Post-Deployment Verification

### 1. Backend Health Check

```bash
# Production backend
curl https://zo-rpizza-production.up.railway.app/health

# Expected response:
# {"success":true,"status":"up","uptime":123.45}
```

### 2. Endpoint Availability

```bash
# Notifications endpoint
curl https://zo-rpizza-production.up.railway.app/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tracking endpoint
curl https://zo-rpizza-production.up.railway.app/api/tracking/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Frontend API Connection

- Open browser console: `http://localhost:3000` (local)
- Check for: `🔧 Using local backend: http://localhost:5001`
- Open production: `https://your-frontend.vercel.app`
- Check for: `🚀 Using production backend: https://...`

---

## 🛠️ Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://..."
FIREBASE_PROJECT_ID="zo-rpizza"
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
PORT=5001
NODE_ENV=production
FRONTEND_URL="https://your-frontend.vercel.app"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://zo-rpizza-production.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

---

## ⚠️ Common Issues

### Issue 1: 404 on /api/notifications

**Sabab:** Production'da eski kod deploy qilingan  
**Yechim:** `git push origin main` va deploy kutish

### Issue 2: CORS Error

**Sabab:** Frontend URL backend'da whitelist qilinmagan  
**Yechim:** Backend `.env` da `FRONTEND_URL` to'g'ri sozlash

### Issue 3: Authentication 401

**Sabab:** Firebase token muddati tugagan  
**Yechim:** Logout/login qiling, token avtomatik yangilanadi

### Issue 4: Prisma P1001 – Can't reach database (Railway + Supabase)

**Xato:** `PrismaClientInitializationError: Can't reach database server at db.xxx.supabase.co:5432`

**Sabablar va yechimlar:**

1. **Supabase loyiha pauza holatida (free tier)**

   - Free tier’da 7 kun faoliyat bo‘lmasa loyiha avtomatik pauza bo‘ladi.
   - **Yechim:** [Supabase Dashboard](https://supabase.com/dashboard) → loyihangiz → **Restore project** (yoki **Resume**). Bir necha daqiqa kutib, Railway’da **Redeploy** qiling.

2. **To‘g‘ri connection string ishlatilmagan (direct 5432)**

   - Railway kabi serverless/cloud’dan **to‘g‘ridan-to‘g‘ri** `db.xxx.supabase.co:5432` ga ulanish cheklanishi yoki muvaffaqiyatsiz bo‘lishi mumkin.
   - **Yechim:** Supabase **Connection pooler** (Session yoki Transaction) URL ishlating, **5432 emas, 6543** port.
   - [Supabase Dashboard](https://supabase.com/dashboard) → loyiha → **Settings** → **Database** → **Connection string** → **URI** (Transaction pooler yoki Session pooler).
   - Format:  
     `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require`
   - Railway’da **Variables** → `DATABASE_URL` ni shu pooler URL bilan yangilang va **Redeploy**.

3. **SSL yo‘q**

   - Supabase SSL talab qiladi.
   - **Yechim:** `DATABASE_URL` oxirida `?sslmode=require` bo‘lishi kerak (yuqoridagi formatda bor).

4. **Parol maxsus belgilar**

   - Parolda `@`, `#`, `%` va boshqalar bo‘lsa, URL encode qiling (masalan `@` → `%40`).

5. **IPv4 (ixtiyoriy)**
   - Ba’zi cloud’lar IPv6 bilan muammo qiladi. Supabase Dashboard → **Settings** → **Database** → **Connection** bo‘limida **IPv4 add-on** bor bo‘lsa, yoqib urinib ko‘ring.

**Tezkor tekshiruv:** Supabase Dashboard’da loyiha **Active** (pauza emas), `DATABASE_URL` **pooler** (port 6543) va `?sslmode=require` borligini tekshiring.

---

## 📊 Monitoring

### Railway Logs

```bash
# Railway CLI orqali
railway logs --tail

# Yoki Railway dashboard: https://railway.app/project/YOUR_PROJECT/logs
```

### Frontend Logs

```bash
# Vercel CLI
vercel logs

# Yoki Vercel dashboard
```

---

## 🔐 Security Checklist

- [ ] Firebase credentials `.gitignore` da
- [ ] Database URL expose qilinmagan
- [ ] API rate limiting yoqilgan
- [ ] CORS to'g'ri sozlangan
- [ ] Environment variables production'da to'g'ri
- [ ] Authentication middleware barcha protected route'larda

---

## 📝 Rollback Strategy

Agar deploy muvaffaqiyatsiz bo'lsa:

```bash
# 1. Oxirgi ishlagan commit'ga qaytish
git log --oneline -10
git revert HEAD

# 2. Push
git push origin main

# 3. Railway avtomatik rollback qiladi
```

---

## ✅ Success Criteria

Deploy muvaffaqiyatli bo'lishi uchun:

1. ✅ Backend health check `/health` 200 qaytaradi
2. ✅ Barcha endpoint'lar local va production'da bir xil
3. ✅ Frontend production'da backend'ga ulanadi
4. ✅ Authentication ishlaydi
5. ✅ Notifications va tracking feature'lar ishlaydi
6. ✅ No console errors in production

---

---

## 🆕 Render'ga Deploy (Alternativ)

Agar Railway o'rniga **Render** ishlatmoqchi bo'lsangiz, batafsil qo'llanma:

👉 **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** – Render uchun to'liq qadam-baqadam qo'llanma

---

**Oxirgi yangilanish:** 2026-02-14  
**Muallif:** Zo-rPizza Development Team
