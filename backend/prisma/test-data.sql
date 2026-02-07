-- ====================================
-- 🧪 GPS TRACKING TEST DATA
-- Test Driver va Order yaratish
-- Zo'r Pizza Delivery System
-- ====================================

-- STEP 1: Test Driver User yaratish
-- Role: DRIVER
-- NOTE: firebaseUid keyin Firebase Console dan olish kerak

INSERT INTO "User" (
  id,
  "firebaseUid",
  email,
  name,
  phone,
  role,
  "vehicleType",
  "currentLocation",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'test-driver-001',  -- ⚠️ Firebase Console dan ID oling!
  'driver@test.com',
  'Test Driver Alisher',
  '+998901234567',
  'DRIVER',
  'motorcycle',
  NULL,
  NOW(),
  NOW()
);

-- STEP 2: Test Customer User yaratish (agar yo'q bo'lsa)

INSERT INTO "User" (
  id,
  "firebaseUid",
  email,
  name,
  phone,
  role,
  "vehicleType",
  "currentLocation",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'test-customer-001',  -- ⚠️ Firebase Console dan ID oling!
  'customer@test.com',
  'Test Customer John',
  '+998909876543',
  'CUSTOMER',
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- STEP 3: Get User IDs (keyingi qadamlar uchun)

SELECT 
  id AS "userId",
  name,
  role,
  email
FROM "User"
WHERE email IN ('driver@test.com', 'customer@test.com')
ORDER BY role;

-- Output:
-- userId (customer) | John  | CUSTOMER | customer@test.com
-- userId (driver)   | Alisher | DRIVER   | driver@test.com

-- ⚠️ Bu ID larni copy qiling!


-- STEP 4: Test Order yaratish
-- NOTE: userId va driverId ni yuqoridagi querydan oling

INSERT INTO "Order" (
  id,
  "orderNumber",
  "userId",       -- ⚠️ Customer ID
  "driverId",     -- ⚠️ Driver ID
  status,
  "totalPrice",
  "deliveryAddress",
  "deliveryPhone",
  "deliveryInstructions",
  "paymentMethod",
  "paymentStatus",
  "deliveryLocation",
  "driverLocation",
  "trackingStartedAt",
  "deliveryStartedAt",
  "deliveryCompletedAt",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '0001',
  'CUSTOMER_USER_ID_HERE',  -- ⚠️ O'zgartiring!
  'DRIVER_USER_ID_HERE',    -- ⚠️ O'zgartiring!
  'CONFIRMED',
  50000,
  'Toshkent, Chilonzor tumani, 12-mavze, 45-uy',
  '+998909876543',
  'Eshik oldiga qo''ying, qo''ng''iroqni 2 marta bosing',
  'CASH',
  'PENDING',
  '{"lat": 41.2995, "lng": 69.2401}',  -- Customer location
  NULL,  -- Driver location (GPS boshlanmagan)
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- STEP 5: Order Items qo'shish (optional, lekin recommended)

-- Avval Product ID oling:
SELECT id, name, price FROM "Product" LIMIT 5;

-- Order Item yaratish:
INSERT INTO "OrderItem" (
  id,
  "orderId",  -- ⚠️ Yuqoridagi order ID
  "productId",  -- ⚠️ Product ID
  quantity,
  price,
  "variationId",
  size,
  "halfHalfId",
  "createdAt"
) VALUES (
  gen_random_uuid(),
  'ORDER_ID_HERE',  -- ⚠️ O'zgartiring!
  'PRODUCT_ID_HERE',  -- ⚠️ O'zgartiring!
  2,  -- 2 ta pizza
  25000,
  NULL,
  'MEDIUM',
  NULL,
  NOW()
);

-- ====================================
-- 🧪 VERIFICATION QUERIES
-- Ma'lumotlar to'g'ri yaratilganini tekshirish
-- ====================================

-- 1. Driver mavjudmi?
SELECT 
  id,
  email,
  name,
  role,
  "vehicleType"
FROM "User"
WHERE role = 'DRIVER'
  AND email = 'driver@test.com';

-- Expected: 1 row


-- 2. Order mavjudmi?
SELECT 
  o.id,
  o."orderNumber",
  o.status,
  o."totalPrice",
  o."deliveryAddress",
  c.name AS "customerName",
  d.name AS "driverName"
FROM "Order" o
LEFT JOIN "User" c ON o."userId" = c.id
LEFT JOIN "User" d ON o."driverId" = d.id
WHERE o."orderNumber" = '0001';

-- Expected: 1 row, driverName = 'Test Driver Alisher'


-- 3. Driver orders count:
SELECT 
  d.name AS "driverName",
  COUNT(o.id) AS "orderCount"
FROM "User" d
LEFT JOIN "Order" o ON d.id = o."driverId"
WHERE d.role = 'DRIVER'
GROUP BY d.id, d.name;

-- Expected: Test Driver Alisher | 1


-- ====================================
-- 🗑️ CLEANUP (Test tugagandan keyin)
-- ====================================

-- Test data o'chirish:
DELETE FROM "OrderItem" WHERE "orderId" IN (
  SELECT id FROM "Order" WHERE "orderNumber" = '0001'
);

DELETE FROM "Order" WHERE "orderNumber" = '0001';

DELETE FROM "User" WHERE email IN ('driver@test.com', 'customer@test.com');

-- ====================================
-- 📋 FIREBASE SETUP
-- ====================================

/*
Firebase Console da user yaratish:

1. https://console.firebase.google.com
2. Project: zor-pizza
3. Authentication → Users → Add User

Driver:
  Email: driver@test.com
  Password: Test@123

Customer:
  Email: customer@test.com
  Password: Test@123

4. User yaratilgandan keyin:
   - UID ni copy qiling
   - SQL da UPDATE qiling:

UPDATE "User"
SET "firebaseUid" = 'COPIED_UID_HERE'
WHERE email = 'driver@test.com';

*/

-- ====================================
-- 🎯 QUICK START (Tez boshlash)
-- ====================================

/*
1. Prisma Studio: pnpm prisma studio
2. User jadvalini oching
3. Add Record:
   - firebaseUid: 'test-driver-001'
   - email: 'driver@test.com'
   - name: 'Test Driver'
   - role: DRIVER
   - vehicleType: 'motorcycle'
   
4. Order jadvalini oching
5. Add Record:
   - userId: <customer-id>
   - driverId: <driver-id>
   - status: CONFIRMED
   - deliveryLocation: {"lat": 41.2995, "lng": 69.2401}
   
6. Firebase Console:
   - Add user: driver@test.com / Test@123
   - Copy UID
   - Update User.firebaseUid

7. Test:
   - Login: http://localhost:3000/login
   - Email: driver@test.com
   - Password: Test@123
   - Dashboard: /driver/dashboard
   - Start delivery!
*/
