# Siz Nima Qilishingiz Kerak – Render Deploy

Bu fayl **sizning harakatlaringiz** uchun. Loyiha tekshirildi, fayllar tayyor.

---

## Loyiha Qanday (Tekshirilgan)

```
Zo-rPizza/
├── backend/          ← Express API, Prisma, PostgreSQL, Firebase Admin
│   ├── package.json   (pnpm, tsx, prisma)
│   ├── prisma/        (migrations mavjud)
│   └── src/
├── frontend/          ← Next.js 16, React 19
│   ├── package.json   (pnpm, next build/start)
│   └── app/
├── render.yaml        ← Render uchun sozlama (tayyor)
└── pnpm-workspace.yaml
```

**Texnologiyalar:**
- Backend: Node.js, Express, Prisma, PostgreSQL, Firebase Admin SDK
- Frontend: Next.js, React, Firebase Client
- Package manager: pnpm
- Monorepo: backend va frontend alohida, lekin bir repoda

**render.yaml** loyihaga mos:
- `rootDir: backend` va `rootDir: frontend` – monorepo uchun
- `pnpm install`, `pnpm build`, `pnpm start` – har bir papkada o'z scriptlari
- `plan: free` – to'lovsiz

---

## Sizning Qadamlaringiz

### 1. PostgreSQL Bazasi

**A)** Render'da: **New +** → **PostgreSQL** → yarating  
**B)** Yoki Supabase'dan mavjud bazani ishlating  

**Kerak:** `DATABASE_URL` va `DIRECT_URL` (Supabase bo'lsa – pooler va direct URL)

---

### 2. Firebase Service Account (Base64)

1. Firebase Console → Project Settings → Service Accounts
2. **Generate new private key** – JSON fayl yuklanadi
3. Terminalda (Mac):
   ```bash
   base64 -i ~/Downloads/zo-rpizza-*.json | pbcopy
   ```
4. Nusxalangan matn – bu `FIREBASE_SERVICE_ACCOUNT_BASE64`

---

### 3. GitHub'ga Push

```bash
cd /Users/mac/Desktop/Zo-rPizza
git add render.yaml docs/
git commit -m "Render deploy sozlamalari"
git push origin main
```

---

### 4. Render'da Blueprint

1. [render.com](https://render.com) → **New +** → **Blueprint**
2. GitHub reponi tanlang: **Zo-rPizza**
3. **Apply** bosing
4. 2 ta service yaratiladi: `zo-rpizza-backend`, `zo-rpizza-frontend`

---

### 5. Backend Environment Variables

`zo-rpizza-backend` → **Environment** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Xuddi shu (yoki Supabase direct URL) |
| `FRONTEND_URL` | `https://zo-rpizza-frontend.onrender.com` (frontend deploydan keyin) |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | 2-qadamda olingan base64 matn |

Keyin **Manual Deploy** → **Deploy latest commit**

---

### 6. Frontend Environment Variables

`zo-rpizza-frontend` → **Environment** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://zo-rpizza-backend.onrender.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web config (Firebase Console) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `zo-rpizza.firebaseapp.com` (yoki sizning project) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `zo-rpizza` (yoki sizning project ID) |

Keyin **Manual Deploy** → **Deploy latest commit**

---

### 7. CORS (Agar xato bo'lsa)

Backend'da `FRONTEND_URL` to'g'ri ekanligini tekshiring. Frontend URL Render'da:
`https://zo-rpizza-frontend.onrender.com`

---

## Xulosa

| # | Siz qilasiz |
|---|-------------|
| 1 | PostgreSQL yaratasiz (Render yoki Supabase) |
| 2 | Firebase JSON ni base64 qilasiz |
| 3 | `git push` qilasiz |
| 4 | Render'da Blueprint ulaysiz |
| 5 | Backend'ga 4 ta env var qo'shasiz |
| 6 | Frontend'ga 4 ta env var qo'shasiz |
| 7 | Deploy tugashini kutasiz |

Batafsil: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
