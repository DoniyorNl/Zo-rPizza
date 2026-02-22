# 🍕 Zor Pizza — Full-Stack Pizza Delivery Platform

> A production-ready, real-time pizza ordering and delivery management system built with modern web technologies.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://zo-r-pizza.vercel.app)
[![Tech Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Express%20%7C%20Prisma-blue)](#tech-stack)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Challenges & Learning](#challenges--learning)
- [Roadmap](#roadmap)
- [Contact](#contact)

---

## 🎯 Overview

**Zor Pizza** is a full-stack web application that simulates a real-world pizza delivery service. It features:

- **Customer Portal**: Browse menu, customize orders, track deliveries in real-time
- **Admin Dashboard**: Manage products, orders, analytics, and staff
- **Driver Interface**: Accept deliveries, update status, navigate with live maps
- **Real-time Updates**: WebSocket-powered order tracking and notifications
- **Payment Integration**: Stripe for card payments, support for cash on delivery
- **Progressive Web App**: Installable, works offline, push notifications

Built for scalability, maintainability, and modern UX standards — perfect for portfolio or production deployment.

---

## 🚀 Live Demo

**🌐 Live Site**: [https://zo-r-pizza.vercel.app](https://zo-r-pizza.vercel.app)

**Test Credentials:**

| Role       | Email                      | Password       |
|------------|----------------------------|----------------|
| Customer   | `user@example.com`         | `password123`  |
| Admin      | `admin@example.com`        | `admin123`     |
| Driver     | `driver@example.com`       | `driver123`    |

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242` (any future date, any CVC)
- Decline: `4000 0000 0000 0002`

---

## ✨ Features

### For Customers
- 🛒 Browse menu with categories, deals, and popular items
- 🍕 Customize pizzas with toppings, sizes, and crust options
- 💳 Multiple payment methods (Cash, Stripe card payments with Google Pay)
- 🗺️ Real-time order tracking with live driver location on map
- 🎁 Loyalty points system and promo codes
- 📱 PWA support — install as native app
- 🔔 Push notifications for order updates

### For Admins
- 📊 Real-time dashboard with revenue, order metrics, and analytics
- 📦 Product management (CRUD operations)
- 📋 Order management with status updates
- 👥 User and driver management
- 🎉 Deals, coupons, and promotions
- 📈 Advanced analytics and reports

### For Drivers
- 🚗 Accept/reject delivery requests
- 🗺️ Navigate to customer with integrated map
- 📍 Update delivery status in real-time
- 📱 Mobile-optimized interface

### Technical Features
- 🔐 Firebase Authentication with JWT
- 🔄 Real-time updates via Socket.IO
- 🛡️ Rate limiting and security (Helmet, CORS)
- 🧪 Comprehensive test coverage (Unit, Integration, E2E)
- 📦 Monorepo architecture with pnpm workspaces
- 🚀 CI/CD ready with Railway (backend) and Vercel (frontend)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand
- **Maps**: Leaflet.js
- **Payments**: Stripe React SDK (`@stripe/react-stripe-js`)
- **Real-time**: Socket.IO client
- **PWA**: `@ducanh2912/next-pwa`
- **Testing**: Jest, React Testing Library, Playwright (E2E)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma
- **Auth**: Firebase Admin SDK
- **Payments**: Stripe Node SDK
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Express Rate Limit
- **Logging**: Morgan, Winston
- **Testing**: Jest, Supertest

### DevOps & Tools
- **Package Manager**: pnpm (workspaces)
- **Deployment**: Vercel (frontend), Railway (backend)
- **Database**: Neon PostgreSQL
- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions (linting, tests)
- **Monitoring**: Vercel Speed Insights

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Customer   │  │    Admin     │  │    Driver    │          │
│  │   (Next.js)  │  │  Dashboard   │  │  Interface   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                   │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ (HTTPS/WSS)
┌───────────────────────────┼──────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Express Server (Port 5001)                             │    │
│  │  • Rate Limiting • CORS • Helmet • JWT Auth             │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Orders     │  │  Products   │  │  Payments   │             │
│  │ Controller  │  │ Controller  │  │ Controller  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                 │                     │
│  ┌──────┴────────────────┴─────────────────┴──────┐            │
│  │          Socket.IO (Real-time Updates)         │            │
│  └────────────────────────────────────────────────┘            │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │             Prisma ORM (Type-safe queries)              │    │
│  └─────────────────────────┬───────────────────────────────┘    │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         PostgreSQL Database (Neon Serverless)           │    │
│  │  • Users • Orders • Products • Reviews • Analytics      │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Firebase   │  │    Stripe    │  │   Leaflet    │          │
│  │     Auth     │  │   Payments   │  │     Maps     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Monorepo**: Shared types, unified tooling, atomic deployments
- **Type Safety**: End-to-end TypeScript with Prisma generated types
- **Real-time**: Socket.IO for live order tracking without polling
- **Modular Architecture**: Controllers → Services → Repository pattern
- **Serverless-Ready**: Stateless backend, database connection pooling

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 20
pnpm >= 8
PostgreSQL (or Neon account)
Firebase project
Stripe account
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/Zo-rPizza.git
cd Zo-rPizza
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/zorpizza
DIRECT_URL=postgresql://user:pass@host:5432/zorpizza

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

# Security
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URLS=http://localhost:3000

# Server
PORT=5001
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. **Set up the database**

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed   # Optional: seed with sample data
```

5. **Run the development servers**

From the root directory:

```bash
pnpm dev:both   # Runs frontend (3000) + backend (5001)
```

Or separately:
```bash
pnpm dev          # Frontend only
pnpm dev:backend  # Backend only
```

6. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- API Docs: http://localhost:5001/api

### Testing Stripe Locally

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

2. Forward webhooks to local backend:
```bash
stripe listen --forward-to localhost:5001/api/payment/webhook
```

3. Use test card numbers at checkout:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

---

## 📚 API Documentation

### Base URL

- **Production**: `https://zor-pizza-backend.railway.app`
- **Development**: `http://localhost:5001`

### Authentication

All protected endpoints require a Firebase JWT token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

### Core Endpoints

#### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/me` | Get current user profile | ✅ |
| GET | `/api/auth/verify-token` | Verify Firebase token | ✅ |
| POST | `/api/auth/set-admin` | Set user as admin | ✅ Admin |

#### 🍕 Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List all products | ❌ |
| GET | `/api/products/:id` | Get product details | ❌ |
| POST | `/api/products` | Create product | ✅ Admin |
| PUT | `/api/products/:id` | Update product | ✅ Admin |
| DELETE | `/api/products/:id` | Delete product | ✅ Admin |

#### 📦 Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | List all orders (admin) | ✅ Admin |
| GET | `/api/orders/user/:uid` | User's orders | ✅ |
| POST | `/api/orders` | Create new order | ✅ |
| PATCH | `/api/orders/:id/status` | Update order status | ✅ Admin/Driver |
| DELETE | `/api/orders/:id` | Cancel order | ✅ |

#### 💳 Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payment/create-intent` | Create Stripe PaymentIntent | ✅ |
| POST | `/api/payment/webhook` | Stripe webhook handler | ❌ (signed) |
| POST | `/api/payments/initiate` | Initiate payment (Click/Payme) | ✅ |
| POST | `/api/payments/callback` | Payment gateway callback | ❌ |

#### 🗺️ Tracking

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tracking/:orderId` | Track order real-time | ✅ |
| POST | `/api/tracking/update-location` | Update driver location | ✅ Driver |

#### 🎁 Promotions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/deals` | Active deals | ❌ |
| POST | `/api/coupons/validate` | Validate promo code | ✅ |
| GET | `/api/loyalty/balance` | User loyalty points | ✅ |

#### 📊 Analytics (Admin)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Real-time dashboard stats | ✅ Admin |
| GET | `/api/analytics` | Detailed analytics | ✅ Admin |

### Request/Response Examples

**Create Order** (`POST /api/orders`)

Request:
```json
{
  "items": [
    {
      "productId": "uuid-here",
      "quantity": 2,
      "size": "MEDIUM",
      "toppings": ["cheese", "pepperoni"]
    }
  ],
  "deliveryAddress": "123 Main St, Tashkent",
  "paymentMethod": "CARD",
  "couponCode": "SAVE10"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": "#0042",
    "totalPrice": 45000,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "estimatedDelivery": "2026-02-22T18:30:00Z",
    "items": [...]
  }
}
```

**Create Stripe Payment** (`POST /api/payment/create-intent`)

Request:
```json
{
  "orderId": "order-uuid"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_yyy",
    "paymentIntentId": "pi_xxx"
  }
}
```

### Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| General API | 100 req/min |
| Authentication | 20 req/min |
| Dashboard | 120 req/min |
| Analytics | 60 req/min |

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

Common status codes:
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `429` — Too Many Requests
- `500` — Internal Server Error

---

## 🧪 Testing

### Test Coverage

- **Backend**: 85%+ coverage (unit + integration tests)
- **Frontend**: 80%+ coverage (component + integration tests)
- **E2E**: Critical user flows (Playwright)

### Running Tests

**All tests:**
```bash
pnpm test
```

**Frontend tests:**
```bash
pnpm test:frontend
pnpm test:frontend:watch      # Watch mode
pnpm test:frontend:coverage   # With coverage report
```

**Backend tests:**
```bash
pnpm test:backend
pnpm test:backend:watch
pnpm test:backend:coverage
```

**E2E tests (Playwright):**
```bash
pnpm test:e2e        # Headless mode
pnpm test:e2e:ui     # Interactive UI mode
```

**Test only changed files:**
```bash
pnpm test:changed
```

### Test Structure

**Backend** (`backend/tests/`):
- `unit/` — Controllers, services, utilities
- `integration/` — API endpoints with test database

**Frontend** (`frontend/__tests__/`):
- `components/` — React component tests
- `hooks/` — Custom hooks tests
- `pages/` — Page-level integration tests
- `e2e/` — End-to-end user flows

### Example Test

**Backend (Order Controller)**:
```typescript
describe('POST /api/orders', () => {
  it('should create order with valid data', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validOrderData)
    
    expect(response.status).toBe(201)
    expect(response.body.data.orderNumber).toMatch(/^#\d{4}$/)
  })
})
```

**Frontend (Checkout Component)**:
```tsx
describe('<CheckoutPage />', () => {
  it('should open Stripe modal for card payment', async () => {
    render(<CheckoutPage />)
    
    fireEvent.click(screen.getByText('Karta'))
    fireEvent.click(screen.getByText('Buyurtma berish'))
    
    await waitFor(() => {
      expect(screen.getByText(/To'lash/i)).toBeInTheDocument()
    })
  })
})
```

---

## 📸 Screenshots

### Customer Experience

**Homepage — Menu & Deals**
![Homepage](docs/screenshots/homepage.png)
*Browse pizzas, deals, and popular items with category filters*

**Product Detail — Customization**
![Product Detail](docs/screenshots/product-detail.png)
*Customize size, crust, and toppings with live price updates*

**Cart & Checkout**
![Checkout](docs/screenshots/checkout.png)
*Review order, apply promo codes, select payment method*

**Stripe Payment Modal**
![Stripe Payment](docs/screenshots/stripe-modal.png)
*Google Pay + card input with real-time validation*

**Order Tracking**
![Order Tracking](docs/screenshots/tracking.png)
*Real-time driver location on interactive map*

### Admin Dashboard

**Real-time Dashboard**
![Admin Dashboard](docs/screenshots/admin-dashboard.png)
*Live metrics: revenue, orders, active users*

**Order Management**
![Order Management](docs/screenshots/admin-orders.png)
*Update order status, view details, contact customers*

### Driver Interface

**Delivery Queue**
![Driver Queue](docs/screenshots/driver-queue.png)
*Accept/reject deliveries, navigate to customer*

---

## 💡 Challenges & Learning

### Technical Challenges

#### 1. Real-time Order Tracking at Scale
**Challenge**: Efficiently broadcast order updates to thousands of concurrent users without overloading the server.

**Solution**: 
- Implemented Socket.IO rooms to isolate user connections
- Only emit updates to relevant users (customer, admin, assigned driver)
- Added debouncing for driver location updates (every 5 seconds instead of continuous)
- Used Redis adapter for horizontal scaling (future-ready)

**Learning**: Real-time features require careful consideration of network overhead and state management.

#### 2. Stripe Webhook Security
**Challenge**: Ensuring webhook requests are authentic and not spoofed.

**Solution**:
- Mounted webhook endpoint *before* `express.json()` to preserve raw body
- Used Stripe's signature verification with `stripe.webhooks.constructEvent()`
- Added idempotency checks to prevent duplicate order updates

**Learning**: Payment integrations demand strict security — always verify signatures and handle race conditions.

#### 3. Monorepo Type Safety
**Challenge**: Sharing types between frontend and backend without duplication.

**Solution**:
- Created shared `types/` directory at monorepo root
- Used Prisma-generated types as single source of truth
- Set up TypeScript path aliases for clean imports

**Learning**: Monorepos require careful configuration but pay off with DRY code and unified tooling.

#### 4. Mobile-First Responsive Design
**Challenge**: Creating smooth UX on mobile while maintaining desktop richness.

**Solution**:
- Mobile-first CSS with Tailwind breakpoints
- Touch-optimized buttons (44px min height)
- Modal scrolling for small screens
- Lazy loading images with Next.js `<Image />`

**Learning**: Progressive enhancement > graceful degradation. Start mobile, add desktop features.

#### 5. Test Coverage for Real-time Features
**Challenge**: Testing WebSocket connections in unit tests.

**Solution**:
- Mocked Socket.IO with `jest.mock()`
- Used Supertest for HTTP endpoints, manual socket client for integration tests
- E2E tests with Playwright for full user flows

**Learning**: Real-time features benefit most from integration/E2E tests — unit tests alone are insufficient.

### Key Takeaways

- **Architecture**: SOLID principles and layered architecture make refactoring painless
- **TypeScript**: Catch bugs at compile time — saved hours of debugging
- **Testing**: High coverage gives confidence to ship fast
- **User Experience**: Small touches (loading states, error messages, animations) elevate perceived quality
- **DevOps**: CI/CD from day one prevents technical debt accumulation

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] User authentication
- [x] Product catalog
- [x] Order management
- [x] Real-time tracking
- [x] Stripe payments
- [x] Admin dashboard
- [x] PWA support

### Phase 2: Enhancements 🚧
- [ ] SMS notifications (Twilio)
- [ ] Email receipts (SendGrid)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Advanced analytics (Charts.js)
- [ ] Customer reviews & ratings
- [ ] Chatbot support (OpenAI)

### Phase 3: Scale 🔮
- [ ] Multi-tenant (franchise support)
- [ ] Mobile apps (React Native)
- [ ] AI-powered recommendations
- [ ] Inventory management
- [ ] Staff scheduling
- [ ] Marketing automation

---

## 📞 Contact

**Developer**: [Your Name]

- 📧 Email: your.email@example.com
- 💼 LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- 🐙 GitHub: [github.com/yourusername](https://github.com/yourusername)
- 🌐 Portfolio: [yourportfolio.com](https://yourportfolio.com)

**Project Links**:
- 🚀 Live Demo: [https://zo-r-pizza.vercel.app](https://zo-r-pizza.vercel.app)
- 📂 Repository: [https://github.com/yourusername/Zo-rPizza](https://github.com/yourusername/Zo-rPizza)
- 📖 Docs: [https://github.com/yourusername/Zo-rPizza/wiki](https://github.com/yourusername/Zo-rPizza/wiki)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — Amazing React framework
- [Prisma](https://www.prisma.io/) — Type-safe database toolkit
- [Stripe](https://stripe.com/) — Seamless payment integration
- [Firebase](https://firebase.google.com/) — Authentication made easy
- [Vercel](https://vercel.com/) & [Railway](https://railway.app/) — Effortless deployments

---

<p align="center">Made with ❤️ and lots of ☕ by [Your Name]</p>

<p align="center">
  <sub>If this project helped you, consider giving it a ⭐ on GitHub!</sub>
</p>
