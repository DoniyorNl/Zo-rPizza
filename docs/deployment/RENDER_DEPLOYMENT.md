# 🚀 Zo-rPizza - Render'ga Deploy Qilish Qo'llanmasi

Bu qo'llanma loyihani **Render** platformasiga deploy qilish uchun barcha qadamlarni tushuntiradi.

---

## 📋 Loyiha Tuzilishi

```
Zo-rPizza/
├── backend/          # Express API + Prisma + Firebase
├── frontend/         # Next.js
├── render.yaml       # Render Blueprint (avtomatik deploy)
└── pnpm-workspace.yaml
```

---

## 🔧 Kerakli Fayllar

### 1. `render.yaml` (Loyiha ildizida)

Render Blueprint – backend va frontend uchun 2 ta Web Service belgilaydi. Fayl allaqachon mavjud.

**Muhim:** `envVars` ichida faqat oddiy o'zgaruvchilar. Maxfiy ma'lumotlar (DATABASE_URL, Firebase) ni **Render Dashboard** orqali qo'shasiz.

### 2. Backend `.env` o'rniga Environment Variables

Production'da `.env` fayl ishlatilmaydi. Barcha o'zgaruvchilar Render Dashboard > Service > Environment da qo'yiladi.

### 3. Frontend Environment Variables

Frontend uchun `NEXT_PUBLIC_*` o'zgaruvchilari build vaqtida qo'shilishi kerak.

---

## 📝 Qadam-baqadam Deploy

### Bosqich 1: Render Hisobini Yaratish

1. [render.com](https://render.com) ga kiring
2. **Get Started** → GitHub bilan ro'yxatdan o'ting
3. GitHub reponingizga ruxsat bering

---

### Bosqich 2: PostgreSQL Bazasi (Agar yo'q bo'lsa)

**Variant A: Render PostgreSQL (tavsiya)**

1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `zo-rpizza-db`
3. Region: **Frankfurt** yoki sizga yaqin
4. **Create Database**
5. Database yaratilgach → **Connect** → **Internal Database URL** ni nusxalang
6. Bu URL `DATABASE_URL` va `DIRECT_URL` uchun ishlatiladi (Render PostgreSQL'da ikkalasi bir xil bo'lishi mumkin)

**Variant B: Supabase (mavjud bo'lsa)**

- Supabase Dashboard → Settings → Database → Connection string
- **Transaction pooler** (port 6543) ishlating
- `DATABASE_URL` va `DIRECT_URL` ni alohida qo'shing (pooler va direct)

---

### Bosqich 3: Blueprint orqali Deploy

1. Render Dashboard → **New +** → **Blueprint**
2. GitHub reponi tanlang: `Zo-rPizza`
3. Render `render.yaml` ni avtomatik topadi
4. **Apply** bosing
5. 2 ta service yaratiladi: `zo-rpizza-backend` va `zo-rpizza-frontend`

---

### Bosqich 4: Backend Environment Variables

`zo-rpizza-backend` service → **Environment** bo'limiga o'ting va qo'shing:

| O'zgaruvchi | Qayerdan | Misol |
|-------------|----------|-------|
| `DATABASE_URL` | Render PostgreSQL yoki Supabase | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `DIRECT_URL` | Xuddi shu (Prisma migrations) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `FRONTEND_URL` | Frontend URL (deploydan keyin) | `https://zo-rpizza-frontend.onrender.com` |
| `FIREBASE_PROJECT_ID` | Firebase Console | `zo-rpizza` |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account JSON | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account | `firebase-adminsdk-xxx@zo-rpizza.iam.gserviceaccount.com` |
| `NODE_ENV` | - | `production` |

**Firebase Service Account olish:**

1. Firebase Console → Project Settings → Service Accounts
2. **Generate new private key**
3. JSON fayldan `private_key` va `client_email` ni nusxalang
4. `private_key` da `\n` ni haqiqiy yangi qatorga almashtiring (yoki to'g'ridan-to'g'ri qoldiring)

---

### Bosqich 5: Frontend Environment Variables

`zo-rpizza-frontend` service → **Environment** bo'limiga o'ting:

| O'zgaruvchi | Qiymat |
|-------------|--------|
| `NEXT_PUBLIC_API_URL` | `https://zo-rpizza-backend.onrender.com` (backend URL) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `zo-rpizza.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `zo-rpizza` |

**Muhim:** `NEXT_PUBLIC_*` o'zgaruvchilari **build** vaqtida qo'shiladi. O'zgartirsangiz, **Redeploy** qilishingiz kerak.

---

### Bosqich 6: CORS Sozlash

Backend `FRONTEND_URL` dan keladigan so'rovlarni qabul qiladi. Frontend URL Render'da quyidagicha bo'ladi:

```
https://zo-rpizza-frontend.onrender.com
```

Agar boshqa domain (masalan, custom domain) ishlatsangiz, `FRONTEND_URLS` da vergul bilan ajrating:

```
FRONTEND_URLS=https://zo-rpizza-frontend.onrender.com,https://zor-pizza.com
```

---

## ⚠️ Render Free Tier Xususiyatlari

- **Spin down:** 15 daqiqa faoliyat bo'lmasa service to'xtaydi
- **Cold start:** Birinchi so'rov 30–60 soniya davom etishi mumkin
- **Build time:** Oyiga cheklangan
- **Database:** Render PostgreSQL free tier – 90 kun, keyin to'xtaydi (yoki upgrade)

Agar tez ishlashi kerak bo'lsa, **Paid plan** olish tavsiya etiladi.

---

## 🔄 Keyingi Deploy'lar

GitHub'ga `main` branch'ga push qilganingizda Render avtomatik deploy qiladi:

```bash
git add .
git commit -m "feat: yangi xususiyat"
git push origin main
```

- **Backend** – faqat `backend/**` o'zgarganida deploy
- **Frontend** – faqat `frontend/**` o'zgarganida deploy

---

## 🧪 Deploydan Keyin Tekshirish

### Backend Health Check

```bash
curl https://zo-rpizza-backend.onrender.com/health
# {"success":true,"status":"up","uptime":...}
```

### Frontend

Brauzerda oching: `https://zo-rpizza-frontend.onrender.com`

Console'da xato bo'lmasa va API so'rovlari ishlasa – deploy muvaffaqiyatli.

---

## 🐛 Muammolar va Yechimlar

### 1. Build xatosi: "prisma migrate failed"

**Sabab:** `DATABASE_URL` yoki `DIRECT_URL` noto'g'ri / bo'sh.

**Yechim:** Environment Variables tekshiring. Supabase bo'lsa, **pooler** (6543) va **direct** (5432) URL'larni to'g'ri kiriting.

### 2. CORS xatosi

**Sabab:** Frontend URL backend'da whitelist qilinmagan.

**Yechim:** `FRONTEND_URL` yoki `FRONTEND_URLS` da to'liq frontend URL (https://...) qo'shing.

### 3. 502 Bad Gateway

**Sabab:** Backend hali ishga tushmagan yoki crash bo'lgan.

**Yechim:** Render Dashboard → Logs. Xatolarni tekshiring. Database ulanishi, Firebase credentials to'g'riligini tekshiring.

### 4. Frontend API'ga ulanmayapti

**Sabab:** `NEXT_PUBLIC_API_URL` noto'g'ri yoki build qilingan vaqtda bo'sh edi.

**Yechim:** Environment'da to'g'ri URL qo'ying va **Manual Deploy** → **Clear build cache & deploy** qiling.

---

## 📊 Xulosa

| Qadam | Vazifa |
|------|--------|
| 1 | render.com da hisob, GitHub ulash |
| 2 | PostgreSQL (Render yoki Supabase) yaratish |
| 3 | Blueprint orqali backend + frontend deploy |
| 4 | Backend: DATABASE_URL, DIRECT_URL, FRONTEND_URL, Firebase |
| 5 | Frontend: NEXT_PUBLIC_API_URL, Firebase config |
| 6 | FRONTEND_URL ni backend'da to'g'ri qo'yish (CORS) |

Barcha qadamlardan keyin loyiha Render'da ishlashi kerak.
