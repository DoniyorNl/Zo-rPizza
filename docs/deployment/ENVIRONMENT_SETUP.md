# 🔧 Environment Variables Setup

## Frontend Environment Variables

Create `/frontend/.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://zo-rpizza-production.up.railway.app

# Force production API even on localhost (optional)
# NEXT_PUBLIC_USE_PRODUCTION_API=true

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zo-rpizza.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zo-rpizza
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zo-rpizza.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Frontend Behavior

**Local Development (localhost:3000):**

- Avtomatik `http://localhost:5001` ishlatadi
- `NEXT_PUBLIC_USE_PRODUCTION_API=true` bo'lsa production API ishlatadi

**Production (vercel.app):**

- `NEXT_PUBLIC_API_URL` dan olingan URL ishlatadi
- Default: `https://zo-rpizza-production.up.railway.app`

---

## Backend Environment Variables

Create `/backend/.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="zo-rpizza"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@zo-rpizza.iam.gserviceaccount.com"

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS - Frontend URLs (comma-separated)
FRONTEND_URL="http://localhost:3000"
FRONTEND_URLS="http://localhost:3000,https://your-frontend.vercel.app"
ALLOW_LOCALHOST_ORIGIN=true

# Security
JWT_SECRET="your-secret-key-here"
```

### Production Backend (.env)

```env
DATABASE_URL="postgresql://production-db-url"
FIREBASE_PROJECT_ID="zo-rpizza"
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
PORT=5001
NODE_ENV=production
FRONTEND_URLS="https://your-frontend.vercel.app,https://your-custom-domain.com"
ALLOW_LOCALHOST_ORIGIN=false
```

---

## Verification

### Check Frontend API URL

```bash
# Open browser console on http://localhost:3000
# You should see:
# 🔧 Using local backend: http://localhost:5001
```

### Check Backend CORS

```bash
curl -X OPTIONS http://localhost:5001/api/products \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

---

## Railway Environment Variables

Railway dashboard'da qo'shish kerak:

1. `DATABASE_URL` - Automatically set by Railway Postgres
2. `FIREBASE_PROJECT_ID`
3. `FIREBASE_PRIVATE_KEY` - Escape newlines: `\n`
4. `FIREBASE_CLIENT_EMAIL`
5. `NODE_ENV=production`
6. `FRONTEND_URLS` - Your frontend URL(s)
7. `PORT` - Railway automatically sets this

---

## Security Notes

⚠️ **NEVER commit these files:**

- `/frontend/.env.local`
- `/backend/.env`
- Any file with real credentials

✅ **Safe to commit:**

- `/frontend/.env.example` (without real values)
- `/backend/.env.example` (without real values)
- This documentation file
