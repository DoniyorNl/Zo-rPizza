# ⚡ Quick Reference Guide

## 📚 Documentation Map

```
docs/
├── 📖 README.md (Root)          → Project overview
├── 📘 INSTALLATION_GUIDE.md     → Setup & troubleshooting
├── 📗 TESTING.md                → Testing commands & guide
├── 📙 PROJECT_STRUCTURE.md      → File organization
├── 📕 DAILY_LOG_2026_01_19.md   → Latest development log
├── 📔 IMPLEMENTATION_SUMMARY.md → Technical details
├── 📓 COMPLETED_WORK.md         → Work summary
├── 🧹 CLEANUP_SUMMARY.md        → Cleanup documentation
└── ⚡ QUICK_REFERENCE.md        → This file

backend/docs/
└── 📄 ENVIRONMENT.md            → Backend env vars

frontend/docs/
├── 📄 ENVIRONMENT.md            → Frontend env vars
└── 📄 README.md                 → Frontend guide
```

---

## 🚀 Quick Commands

### Development

```bash
# Backend
cd backend && pnpm dev             # Start backend (http://localhost:5001)

# Frontend  
cd frontend && pnpm dev            # Start frontend (http://localhost:3000)

# Database
cd backend && npx prisma studio    # Open Prisma Studio
```

### Testing

```bash
# Backend Tests
cd backend && pnpm test            # All tests
cd backend && pnpm test:watch      # Watch mode
cd backend && pnpm test:unit       # Unit tests only

# Frontend Tests
cd frontend && pnpm test           # All tests
cd frontend && pnpm test:watch     # Watch mode

# E2E Tests
npx playwright test                # Run E2E tests
npx playwright test --ui           # Interactive mode
```

### Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name <name>

# Seed database
npm run prisma:seed

# View database
npx prisma studio
```

---

## 📊 Test Results

### Current Status

| Component | Tests | Status |
|-----------|-------|--------|
| Backend | 480 | ✅ 100% |
| Frontend | 160 | ✅ 100% |
| **Total** | **640** | **✅ PASS** |

### Run Tests

```bash
# Quick test all
cd backend && pnpm test
cd frontend && pnpm test

# With coverage
cd backend && pnpm test -- --coverage
cd frontend && pnpm test -- --coverage
```

---

## 🔧 Troubleshooting

### Backend Won't Start

```bash
# Check PostgreSQL
psql -U postgres  # or your username

# Regenerate Prisma
cd backend
npx prisma generate
npx prisma db push

# Clear node_modules
rm -rf node_modules package-lock.json
pnpm install
```

### Frontend Won't Start

```bash
# Clear Next.js cache
cd frontend
rm -rf .next

# Reinstall
rm -rf node_modules package-lock.json
pnpm install
```

### Tests Failing

```bash
# Clear Jest cache
npx jest --clearCache

# Backend
cd backend
rm -rf node_modules
pnpm install
npx prisma generate

# Frontend
cd frontend
rm -rf node_modules
pnpm install
```

---

## 📍 Important URLs

### Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3000/admin
- **Prisma Studio**: http://localhost:5555

### API Endpoints
- **Health**: http://localhost:5001/health
- **API List**: http://localhost:5001/api
- **Products**: http://localhost:5001/api/products
- **Orders**: http://localhost:5001/api/orders
- **Dashboard**: http://localhost:5001/api/dashboard

---

## 📝 Common Tasks

### Create Admin User

```bash
cd backend
npx tsx src/scripts/create-first-admin.ts admin@example.com
```

### Add New Migration

```bash
cd backend
npx prisma migrate dev --name add_new_feature
```

### Update Dependencies

```bash
# Backend
cd backend && pnpm update

# Frontend
cd frontend && pnpm update
```

### Check for Linting Errors

```bash
# Backend
cd backend && tsc --noEmit

# Frontend
cd frontend && npm run lint
```

---

## 🔐 Environment Variables

### Backend (`.env`)

**Required:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
FIREBASE_ADMIN_PROJECT_ID="..."
FIREBASE_ADMIN_CLIENT_EMAIL="..."
FIREBASE_ADMIN_PRIVATE_KEY="..."
```

**Optional:**
```env
PORT=5001
NODE_ENV=development
FRONTEND_URLS="http://localhost:3000"
```

See: `backend/docs/ENVIRONMENT.md`

### Frontend (`.env.local`)

**Required:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
```

See: `frontend/docs/ENVIRONMENT.md`

---

## 🎯 Project Structure Summary

```
Zo-rPizza/
├── backend/           # Express + Prisma API
│   ├── src/          # Source code
│   ├── tests/        # Test files
│   └── prisma/       # Database schema
│
├── frontend/         # Next.js 16 app
│   ├── app/         # Pages (App Router)
│   ├── components/  # React components
│   ├── lib/         # Utilities
│   └── __tests__/   # Test files
│
├── e2e/             # Playwright E2E tests
└── docs/            # Documentation
```

---

## 📞 Getting Help

### Documentation
1. Start with [README.md](/README.md)
2. Check [INSTALLATION_GUIDE.md](/docs/INSTALLATION_GUIDE.md)
3. Read [PROJECT_STRUCTURE.md](/docs/PROJECT_STRUCTURE.md)

### Testing Issues
- See [TESTING.md](/docs/TESTING.md)
- Check troubleshooting section above

### Latest Changes
- Read [DAILY_LOG_2026_01_19.md](/docs/DAILY_LOG_2026_01_19.md)

---

## 🚨 Emergency Commands

### Reset Everything

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
pnpm install
npx prisma generate
npx prisma db push

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
pnpm install
```

### Fix Database

```bash
cd backend
npx prisma migrate reset  # ⚠️ Deletes all data!
npx prisma db push
npm run prisma:seed
```

### Fix Tests

```bash
# Backend
cd backend
npx jest --clearCache
rm -rf coverage
pnpm test

# Frontend
cd frontend
npx jest --clearCache
rm -rf coverage
pnpm test
```

---

**Last Updated**: 2026-02-21

**Quick Links**: [README](/README.md) | [2 kunlik reja](/docs/BUGUN_ERTAGA_REJA_2_KUN.md) | [Setup](/docs/INSTALLATION_GUIDE.md) | [Structure](/docs/PROJECT_STRUCTURE.md)
