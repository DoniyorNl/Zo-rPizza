# 🍕 Zor Pizza - Professional Pizza Ordering System

Production-ready full-stack pizza ordering platform with comprehensive testing and error handling.

[![Tests](https://img.shields.io/badge/tests-43%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-setup-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-16-black)]()

---

## 📁 Project Structure

```
Zo-rPizza/
├── backend/        # Express + Prisma + PostgreSQL
├── frontend/       # Next.js 16 + React 19
├── e2e/           # Playwright E2E tests
└── docs/          # Complete documentation
```

---

## ✨ Features

### 🛍️ Customer Features
- Product catalog with filtering
- Shopping cart with variations (sizes, half-half)
- Checkout & order tracking
- Real-time notifications
- Coupons & deals
- Firebase authentication

### 👨‍💼 Admin Features
- Real-time dashboard
- Advanced analytics & charts
- Product management (CRUD with variations)
- Order management
- User management
- Coupon & deal management
- Category & topping management

### 🧪 Testing & Quality
- **43 tests** (34 backend, 9 frontend)
- Unit, integration, and E2E tests
- Professional error handling
- Error logging (Winston)
- User-friendly error messages (Uzbek)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project
- pnpm (recommended)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Zo-rPizza

# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 2. Environment Setup

See `backend/docs/ENVIRONMENT.md` and `frontend/docs/ENVIRONMENT.md` for details.

**Backend** (`.env`):
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
FIREBASE_ADMIN_PROJECT_ID="..."
FRONTEND_URLS="http://localhost:3000,https://your-domain.com"
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY="..."
```

### 3. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development

```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- Admin Panel: http://localhost:3000/admin

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pnpm test                # Run all tests
pnpm test:watch         # Watch mode
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
```

**Results**: ✅ 34/34 tests passed

### Frontend Tests

```bash
cd frontend
pnpm test               # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

**Results**: ✅ 9/9 tests passed

### E2E Tests

```bash
# First time: Install browsers
npx playwright install

# Run tests
pnpm test:e2e          # Headless mode
pnpm test:e2e:ui       # Interactive UI
```

---

## 📊 Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Backend Controllers | 16 | ✅ |
| Backend Middleware | 4 | ✅ |
| Backend Integration | 14 | ✅ |
| Frontend Hooks | 4 | ✅ |
| Frontend Components | 5 | ✅ |
| **Total** | **43** | **✅ 100%** |

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Firebase Admin SDK
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS + Shadcn UI
- **State**: Zustand + React Context
- **Auth**: Firebase Client SDK
- **Testing**: Jest + React Testing Library
- **Charts**: Chart.js + Recharts
- **E2E**: Playwright

---

## 📚 Documentation

All documentation is organized in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [TESTING.md](docs/TESTING.md) | Complete testing guide |
| [INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) | Installation & troubleshooting |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | File structure explained |
| [DAILY_LOG_2026_01_19.md](docs/DAILY_LOG_2026_01_19.md) | Latest development log |
| [IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md) | Technical details |
| [COMPLETED_WORK.md](docs/COMPLETED_WORK.md) | Work summary |

### Backend Docs
- [backend/docs/ENVIRONMENT.md](backend/docs/ENVIRONMENT.md) - Backend environment variables

### Frontend Docs
- [frontend/docs/ENVIRONMENT.md](frontend/docs/ENVIRONMENT.md) - Frontend environment variables
- [frontend/docs/README.md](frontend/docs/README.md) - Frontend-specific guide

---

## 🔒 Security

- ✅ Firebase Authentication
- ✅ Role-based access control (CUSTOMER, ADMIN)
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React)
- ✅ Token auto-refresh on 401

---

## ❌ Error Handling

### Backend
- 8 custom error classes (400, 401, 403, 404, 409, 422, 429, 500)
- Winston logging (console + file)
- Global error handler middleware
- Development vs production modes

### Frontend
- Global ErrorBoundary component
- Error tracking to backend
- 50+ user-friendly messages (Uzbek)
- Axios interceptor for token refresh

---

## 📈 API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/products/:id` - Product details
- `GET /api/categories` - List categories
- `GET /api/deals` - List deals

### Authenticated
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - User orders
- `GET /api/notifications` - User notifications

### Admin Only
- `GET /api/orders/admin/all` - All orders
- `POST /api/products` - Create product
- `GET /api/dashboard` - Dashboard stats
- `GET /api/analytics` - Analytics data
- `GET /api/users` - List users

---

## 🚢 Deployment

### Backend (Railway/Heroku)
```bash
npm run build
npm start
```

### Frontend (Vercel)
```bash
npm run build
```

Environment variables required - see documentation.

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. **Write tests!** (Required)
4. Commit changes
5. Push and create Pull Request

### Code Quality
- TypeScript strict mode
- ESLint configured
- Tests required
- Documentation required

---

## 📞 Support

- Email: support@zorpizza.uz
- Documentation: `/docs` folder
- Issues: GitHub Issues

---

## 📄 License

MIT License

---

## 👥 Team

Developed with ❤️ by Zor Pizza Team

---

**Status**: ✅ Production Ready

**Version**: 2.0.0

**Last Updated**: 2026-01-19
