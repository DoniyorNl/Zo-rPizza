# Pizza Delivery Platform – 7 Features Implementation

## Implementation order & dependencies

| # | Feature | Depends on | Backend | Frontend |
|---|--------|------------|---------|----------|
| 1 | **Branch finder** | - | Branch model, GET /api/branches, GET /api/branches/nearest | BranchFinder page, map |
| 2 | **Delivery time estimation** | Branch | POST/GET /api/delivery/estimate | DeliveryTimeEstimate component |
| 3 | **Saved addresses** | - | Already: GET/POST/PUT/DELETE /api/profile/addresses | Use in checkout (existing) |
| 4 | **Promo codes** | - | POST /api/promos/validate, apply in createOrder | PromoCodeInput in cart/checkout |
| 5 | **Loyalty program** | - | GET /api/loyalty/balance, /redeem-options, /transactions; apply in createOrder | LoyaltyDisplay, redeem at checkout |
| 6 | **Order history + reorder** | - | GET /api/orders/user/:userId, POST /api/orders/:id/reorder | OrderHistory page, Reorder button |
| 7 | **Live order tracking** | Order, Tracking | Socket.io, emit on status + driver location | OrderTracking page, progress bar, socket client |

---

## 1. Live order tracking

### Database (Prisma)
- Uses existing `Order`: `status`, `driverLocation`, `deliveryLocation`, `trackingStartedAt`, `deliveryStartedAt`, `deliveryCompletedAt`.

### Backend API
- **GET /api/tracking/order/:orderId** – order tracking (status, driverLocation, deliveryAddress).
- **POST /api/tracking/order/:orderId/start** – start delivery tracking (driver).
- **Socket.io** – room `order:${orderId}`. Events:
  - Client: `join_order`, `leave_order` (payload: orderId).
  - Server: `order:update` – `{ status?, driverLocation?, estimatedTime? }`.

### Frontend
- Install: `socket.io-client`.
- Connect to backend URL, then `socket.emit('join_order', orderId)` and `socket.on('order:update', (payload) => ...)`.
- **OrderTrackingPage**: progress bar (PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERING → DELIVERED), map (delivery + driver if present).

### Validation
- orderId must be valid; user can only track own order (backend checks ownership in getOrderTracking).

---

## 2. Delivery time estimation

### Database
- **Branch** model: name, address, lat, lng, phone, isActive.

### Backend API
- **POST /api/delivery/estimate** – body: `{ lat?, lng?, address? }`. Returns `{ estimatedMinutes, branchId?, branchName?, distanceKm? }`.
- **GET /api/delivery/estimate?lat=...&lng=...** – same, query params.

### Frontend
- **DeliveryTimeEstimate** component: call estimate with current address or map coords; show “~X min” and optional branch name.

### Validation
- lat/lng in range or address present; backend uses Branch + `gps.utils` (distance, ETA).

---

## 3. Location / branch finder

### Database
- **Branch** (see above).

### Backend API
- **GET /api/branches** – list active branches.
- **GET /api/branches/nearest?lat=...&lng=...** – nearest branch + distance, optional alternatives.
- **GET /api/branches/:id** – one branch.

### Frontend
- **BranchFinder** page: map (e.g. Leaflet/Google Maps) with branch markers; list with distance; “Nearest” uses `/api/branches/nearest`.

### Validation
- lat/lng required for nearest; valid numbers in range.

---

## 4. Saved addresses

### Database (Prisma)
- **Address**: userId, label, street, building, apartment, floor, entrance, landmark, lat, lng, isDefault.

### Backend API
- **GET /api/profile/addresses** – user addresses.
- **POST /api/profile/addresses** – create.
- **PUT /api/profile/addresses/:id** – update.
- **DELETE /api/profile/addresses/:id** – delete.

### Frontend
- Use in checkout: address selector or “Add new address” → save via profile APIs; set delivery address from selected Address (street + building, etc., and lat/lng if present for estimate/tracking).

### Validation
- label, street required; optional lat/lng validated as numbers.

---

## 5. Order history & reorder

### Backend API
- **GET /api/orders/user/:userId** – user orders (auth: token userId must match).
- **POST /api/orders/:id/reorder** – create new order with same items and delivery address (auth; must be order owner).

### Frontend
- **OrderHistory** page: list from GET /api/orders/user/:userId; each row: date, total, status, “Reorder” button → POST /api/orders/:id/reorder then redirect to cart or success.

### Validation
- Order id required; backend checks ownership.

---

## 6. Loyalty program

### Database (Prisma)
- **User**: loyaltyPoints, totalSpent.
- **LoyaltyTransaction**: userId, type (EARN | REDEEM), points, orderId?, description.

### Backend API
- **GET /api/loyalty/balance** – `{ points, totalSpent, redeemableDiscount }`.
- **GET /api/loyalty/redeem-options** – `{ points, pointsPerCurrency, maxDiscount }`.
- **GET /api/loyalty/transactions** – list for user.
- **Order create** – body may include `loyaltyPointsToUse`; backend applies redeem and adds EARN transaction; updates User.loyaltyPoints and totalSpent.

### Constants (backend)
- `POINTS_PER_CURRENCY` = 1 (earn per currency spent).
- `REDEEM_POINTS_PER_CURRENCY` = 100 (points per 1 currency discount).

### Frontend
- **LoyaltyDisplay**: show points and redeemable discount (from balance).
- **Checkout**: optional “Use X points” (capped by maxDiscount); send `loyaltyPointsToUse` in createOrder.

### Validation
- loyaltyPointsToUse ≤ user.loyaltyPoints and ≤ allowed discount; backend enforces.

---

## 7. Promo codes

### Database (Prisma)
- **Coupon**: code, discountType, discountValue, minOrderTotal?, isActive, startsAt, endsAt, usageLimit?, perUserLimit?.
- **CouponUsage**: userId, couponId, orderId?, usedAt.

### Backend API
- **POST /api/promos/validate** – body: `{ code, orderTotal }`. Returns `{ valid, message?, data?: { couponId, code, discountAmount, discountType, discountValue } }`.
- **Order create** – body may include `couponCode`; backend validates and applies discount; creates CouponUsage; stores discountAmount and couponId on Order.

### Frontend
- **PromoCodeInput**: input + “Apply”; call POST /api/promos/validate with current cart total; show message and applied discount; on submit order send `couponCode` in createOrder body.

### Validation
- code required; orderTotal >= 0; backend checks dates, limits, minOrderTotal.

---

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/branches | No | List branches |
| GET | /api/branches/nearest?lat=&lng= | No | Nearest branch |
| GET | /api/branches/:id | No | One branch |
| GET/POST | /api/delivery/estimate | No | Delivery time estimate |
| GET | /api/profile/addresses | Yes | List addresses |
| POST | /api/profile/addresses | Yes | Create address |
| PUT | /api/profile/addresses/:id | Yes | Update address |
| DELETE | /api/profile/addresses/:id | Yes | Delete address |
| POST | /api/promos/validate | Yes | Validate promo code |
| GET | /api/loyalty/balance | Yes | Loyalty balance |
| GET | /api/loyalty/redeem-options | Yes | Redeem options |
| GET | /api/loyalty/transactions | Yes | Loyalty history |
| GET | /api/orders/user/:userId | Yes | User orders |
| POST | /api/orders/:id/reorder | Yes | Reorder |
| GET | /api/tracking/order/:orderId | Yes | Order tracking |
| POST | /api/tracking/order/:orderId/start | Yes | Start delivery tracking |
| Socket | join_order / order:update | - | Live tracking |

---

## Migration

Run after schema changes:

```bash
cd backend && pnpm prisma migrate deploy
```

Seed branches (example):

```bash
cd backend && pnpm prisma db seed
```

Add to `prisma/seed.ts` (if not exists) creation of a few Branch records.

---

## Frontend integration (short)

1. **Tracking**: `socket.io-client` → connect to `NEXT_PUBLIC_API_URL` (or WS base); on order page `join_order(orderId)`, on `order:update` update status and driver location; render progress bar and map.
2. **Delivery time**: Before checkout or on address change, call GET/POST `/api/delivery/estimate` with lat/lng or address; show result in checkout.
3. **Branch finder**: GET /api/branches and /api/branches/nearest; map + list.
4. **Addresses**: Use existing profile addresses in checkout; pass selected address as delivery fields (+ lat/lng for estimate).
5. **Order history**: GET /api/orders/user/:userId; “Reorder” → POST /api/orders/:id/reorder.
6. **Loyalty**: GET /api/loyalty/balance and /redeem-options; show points; in checkout send `loyaltyPointsToUse` with createOrder.
7. **Promo**: POST /api/promos/validate with code and orderTotal; show discount; in checkout send `couponCode` with createOrder.
