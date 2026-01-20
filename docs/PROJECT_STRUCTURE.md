# 📁 Project Structure Guide

## 🏗️ Overview

```
Zo-rPizza/
├── backend/                 # Backend API (Express + Prisma)
├── frontend/               # Frontend (Next.js 16)
├── e2e/                    # E2E tests (Playwright)
├── docs/                   # Project documentation
├── .gitignore
├── playwright.config.ts    # E2E test configuration
└── README.md              # Project overview
```

---

## 📂 Backend Structure

```
backend/
├── src/
│   ├── controllers/       # Route handlers
│   │   ├── analytics.controller.ts
│   │   ├── categories.controller.ts
│   │   ├── coupons.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── deals.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── products.controller.ts
│   │   ├── toppings.controller.ts
│   │   └── users.controller.ts
│   │
│   ├── routes/            # API routes
│   │   ├── analytics.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── coupons.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── deals.routes.ts
│   │   ├── errors.routes.ts       # Error logging endpoint
│   │   ├── orders.routes.ts
│   │   ├── products.routes.ts
│   │   ├── toppings.routes.ts
│   │   └── users.routes.ts
│   │
│   ├── middleware/        # Express middleware
│   │   ├── admin.middleware.ts    # Admin authorization
│   │   ├── auth.middleware.ts     # Firebase token verification
│   │   └── errorHandler.ts        # Global error handler
│   │
│   ├── validators/        # Zod schemas
│   │   ├── coupon.validator.ts
│   │   ├── deal.validator.ts
│   │   ├── product.validator.ts
│   │   └── topping.validator.ts
│   │
│   ├── utils/             # Utility functions
│   │   ├── errors.ts              # Custom error classes
│   │   └── logger.ts              # Winston logger
│   │
│   ├── lib/               # Libraries
│   │   └── prisma.ts              # Prisma client
│   │
│   ├── config/            # Configuration
│   │   └── firebase.ts            # Firebase Admin SDK
│   │
│   ├── scripts/           # Utility scripts
│   │   └── create-first-admin.ts
│   │
│   └── server.ts          # Express server setup
│
├── tests/                 # Test files
│   ├── setup.ts                   # Test configuration & mocks
│   ├── unit/                      # Unit tests
│   │   ├── controllers/
│   │   │   ├── products.controller.test.ts
│   │   │   └── users.controller.test.ts
│   │   └── middleware/
│   │       └── auth.middleware.test.ts
│   └── integration/               # Integration tests
│       ├── auth.api.test.ts
│       └── products.api.test.ts
│
├── prisma/                # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed data
│   └── migrations/               # Database migrations
│
├── logs/                  # Application logs (gitignored)
│   ├── combined.log
│   └── error.log
│
├── docs/                  # Backend documentation
│   └── ENVIRONMENT.md            # Environment variables guide
│
├── .gitignore
├── jest.config.js        # Jest configuration
├── package.json
├── tsconfig.json         # TypeScript config
└── tsconfig.test.json    # TypeScript config for tests
```

---

## 📂 Frontend Structure

```
frontend/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth pages (grouped route)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (shop)/           # Shop pages (grouped route)
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   └── orders/
│   │       ├── [id]/
│   │       │   └── page.tsx
│   │       └── page.tsx
│   │
│   ├── admin/            # Admin panel
│   │   ├── analytics/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── page.tsx
│   │   ├── coupons/
│   │   ├── dashboard/
│   │   ├── deals/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── toppings/
│   │   ├── users/
│   │   ├── layout.tsx   # Admin layout with header
│   │   └── page.tsx
│   │
│   ├── products/         # Product details
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── layout.tsx        # Root layout with ErrorBoundary
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── components/           # React components
│   ├── layout/
│   │   ├── Header.tsx            # User header (wrapper)
│   │   └── UnifiedHeader.tsx     # Unified header component
│   ├── admin/
│   │   └── AdminHeader.tsx       # Admin header (wrapper)
│   ├── notifications/
│   │   └── NotificationDropdown.tsx
│   ├── products/
│   │   └── ProductCard.tsx
│   ├── ui/                       # Shadcn UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx
│   └── ErrorBoundary.tsx         # Global error boundary
│
├── lib/                  # Libraries & utilities
│   ├── apiClient.ts             # Axios instance with interceptors
│   ├── apiFetch.ts              # Fetch wrapper
│   ├── api.ts                   # API URL helper
│   ├── AuthContext.tsx          # Firebase auth context
│   ├── firebase.ts              # Firebase client config
│   ├── errorTracking.ts         # Error logging service
│   ├── errorMessages.ts         # User-friendly error messages
│   ├── uploadImage.ts           # Image upload utility
│   └── utils.ts                 # General utilities
│
├── store/                # Zustand state management
│   └── cartStore.ts
│
├── hooks/                # Custom React hooks
│   └── useNotifications.ts
│
├── __tests__/           # Test files
│   ├── hooks/
│   │   └── useNotifications.test.tsx
│   └── components/
│       └── ErrorBoundary.test.tsx
│
├── public/              # Static files
│   ├── icons/
│   └── manifest.json
│
├── docs/                # Frontend documentation
│   ├── ENVIRONMENT.md
│   └── README.md
│
├── .gitignore
├── jest.config.cjs      # Jest configuration (CommonJS)
├── jest.setup.cjs       # Jest setup
├── next.config.ts       # Next.js configuration
├── package.json
├── postcss.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── components.json      # Shadcn config
```

---

## 📂 E2E Tests Structure

```
e2e/
├── order-flow.spec.ts         # Order flow tests
└── admin-operations.spec.ts   # Admin CRUD tests
```

---

## 📂 Documentation Structure

```
docs/                          # Root documentation
├── TESTING.md                # Testing guide
├── INSTALLATION_GUIDE.md     # Installation & troubleshooting
├── IMPLEMENTATION_SUMMARY.md # Technical implementation details
├── COMPLETED_WORK.md         # Work summary
├── PROJECT_STRUCTURE.md      # This file
└── DAILY_LOG_2026_01_19.md  # Daily development log
```

---

## 🔑 Key Files Explained

### Backend

| File | Purpose |
|------|---------|
| `server.ts` | Express app setup, routes, middleware |
| `prisma.ts` | Prisma client singleton |
| `errors.ts` | Custom error classes (8 types) |
| `logger.ts` | Winston logger configuration |
| `errorHandler.ts` | Global error handler middleware |
| `auth.middleware.ts` | Firebase token verification |
| `admin.middleware.ts` | Admin role check |

### Frontend

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout with ErrorBoundary |
| `UnifiedHeader.tsx` | Shared header (user + admin) |
| `ErrorBoundary.tsx` | Global React error boundary |
| `apiClient.ts` | Axios with interceptors & token refresh |
| `errorTracking.ts` | Error logging to backend |
| `errorMessages.ts` | 50+ user-friendly messages (Uzbek) |
| `AuthContext.tsx` | Firebase auth state management |
| `cartStore.ts` | Shopping cart Zustand store |

### Configuration

| File | Purpose |
|------|---------|
| `jest.config.js` | Backend test configuration |
| `jest.config.cjs` | Frontend test configuration |
| `playwright.config.ts` | E2E test configuration |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |

---

## 📊 File Counts

- **Backend**: ~50 files
- **Frontend**: ~80 files
- **Tests**: 7 test files
- **Documentation**: 6 MD files
- **Total**: ~140+ source files

---

## 🎯 Architecture Patterns

### Backend
- **MVC Pattern**: Controllers → Routes → Server
- **Middleware Chain**: Auth → Admin → Rate Limit
- **Error Handling**: Try-Catch → Custom Errors → Global Handler
- **Logging**: Winston → Console/File transports

### Frontend
- **App Router**: Next.js 16 file-based routing
- **Component Structure**: Feature folders (analytics, products, etc.)
- **State Management**: Zustand (cart), Context (auth)
- **Error Handling**: ErrorBoundary → Error Tracking → Backend

### Testing
- **Unit Tests**: Controllers, middleware, hooks, components
- **Integration Tests**: API endpoints with mocks
- **E2E Tests**: Full user flows with Playwright

---

## 🚀 Entry Points

### Development
- Backend: `backend/src/server.ts`
- Frontend: `frontend/app/layout.tsx`

### Testing
- Backend Tests: `backend/tests/setup.ts`
- Frontend Tests: `frontend/jest.setup.cjs`
- E2E Tests: `playwright.config.ts`

### Production
- Backend: `npm start` (runs `tsx src/server.ts`)
- Frontend: `npm run build && npm start`

---

**Last Updated**: 2026-01-19

**Maintainer**: Zor Pizza Team
