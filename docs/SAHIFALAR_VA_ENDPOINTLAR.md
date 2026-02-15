# Zo'r Pizza – sahifalar va endpointlar

Har bir URL da nima ko‘rinadi va qaysi API lar ishlatiladi.

---

## 1. Bosh sahifa (Home / Menyu)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/ |
| **Nima chiqadi** | Birinchi kirish sahifasi: kategoriyalar, mahsulotlar, savat ikonkasi. Menudan mahsulot tanlash mumkin. |
| **Frontend route** | `/` (app yoki (shop) layout) |
| **API (agar chaqirilsa)** | `GET /api/categories`, `GET /api/products`, `GET /api/deals` va boshqalar. |

---

## 2. Mahsulot sahifasi (bitta product)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/products/hawaiian-1 (slug yoki id product ga qarab) |
| **Nima chiqadi** | Shu mahsulot haqida: rasm, narx, o‘lcham, toppinglar, **Savatga qo‘shish** tugmasi. |
| **Frontend route** | `/products/[slug]` |
| **API** | `GET /api/products/:slug` (yoki id orqali). |

---

## 3. Savat (Cart)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/cart |
| **Nima chiqadi** | Savatdagi mahsulotlar, miqdor, jami narx. **Buyurtma berish** tugmasi → checkout ga. Savat bo‘sh bo‘lsa: «Savatcha bo‘sh» + **Menyu'ga qaytish** (bosh sahifaga `/`). |
| **Frontend route** | `/cart` |
| **API** | Savat faqat frontend (cartStore). API chaqirilmaydi. |

---

## 4. Checkout (sotib olish formasi)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/checkout |
| **Nima chiqadi** | Forma: yetkazib berish manzili, telefon, to‘lov (naqd/karta), buyurtma tafsilotlari. **Buyurtma berish** tugmasi. |
| **Frontend route** | `/checkout` |
| **API** | **POST /api/orders** – forma submit qilganda (Bearer token bilan). Javob: `{ data: { id, orderNumber, ... } }`. |

**Muhim:** Submit muvaffaqiyatli bo‘lgach foydalanuvchi **cart ga emas**, **checkout success** sahifasiga yo‘naltiriladi.

---

## 5. Checkout success (harid keyin)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/checkout/success?orderId=...&orderNumber=... |
| **Nima chiqadi** | «Buyurtmangiz qabul qilindi», «Buyurtma tayyorlanmoqda», buyurtma raqami. Ikki tugma: **Menuga qaytish** (bosh sahifa), **Kuzatib borish** (tracking sahifasi). |
| **Frontend route** | `/checkout/success` |
| **API** | Bu sahifada API chaqirilmaydi (orderId va orderNumber URL dan olinadi). |

---

## 6. Buyurtmani kuzatib borish (Tracking)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/tracking/[orderId] |
| **Nima chiqadi** | Buyurtma holati (PENDING, PREPARING, ON_THE_WAY, COMPLETED va h.k.), xarita/yetkazib berish ma’lumotlari. |
| **Frontend route** | `/tracking/[id]` |
| **API** | `GET /api/orders/:id` (yoki tracking uchun maxsus endpoint bo‘lsa – shu). |

---

## 7. Mening buyurtmalarim (ro‘yxat)

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/orders |
| **Nima chiqadi** | Foydalanuvchi buyurtmalari ro‘yxati. Biror buyurtmani ochish → `/orders/[id]`. |
| **Frontend route** | `/orders` |
| **API** | `GET /api/orders/user/:userId` (Bearer token). |

---

## 8. Bitta buyurtma tafsiloti

| Nima | Qiymat |
|------|--------|
| **URL** | http://127.0.0.1:3000/orders/[id] |
| **Nima chiqadi** | Buyurtma statusi, mahsulotlar, manzil, to‘lov. **Menuga qaytish**, **Kuzatib borish** (faol buyurtmalar uchun), **Qayta buyurtma berish** (COMPLETED uchun). |
| **Frontend route** | `/orders/[id]` |
| **API** | `GET /api/orders/:id`. |

---

## Live Tracking (xarita) – qachon va nima ko‘rinadi

**URL:** http://127.0.0.1:3000/tracking/[orderId]  
**API:** `GET /api/tracking/order/:orderId` (Bearer token).

| Holat | Nima ko‘rinadi |
|-------|-----------------|
| **Xarita yo‘q, faqat kartochka** | «Joylashuvni yoqing» – pizzeria bilan oranizdagi masofani ko‘rish uchun brauzer joylashuvga ruxsat so‘raydi. Tugma: **Joylashuvni yoqing**. |
| **Ruxsat berildi** | Xarita: **🍕 Pizzeria** (default joy) va **📍 Sizning joylashuvingiz** (brauzer GPS). Ularning orasidagi **masofa (km)** va chiziq ko‘rsatiladi. |
| **Buyurtmada yetkazib berish koordinatalari bor** (deliveryLocation/deliveryLat/Lng) | Xarita: 🍕 Pizzeria va 🏠 Yetkazib berish manzili. Haydovchi yo‘lda bo‘lganda 🏍️ va marshrut ham chiqadi. |
| **Haydovchi yo‘lda** | Masofa, ETA, progress bar va haydovchi nuqtasi yangilanadi. |

**Qanday tekshirish**

1. **Pizzeria + sizning joylashuv + masofa:**  
   - http://127.0.0.1:3000/tracking/[orderId] oching.  
   - «Joylashuvni yoqing» kartochkasida **Joylashuvni yoqing** tugmasini bosing.  
   - Brauzer «Joylashuvga ruxsat bering» degan modal/so‘rov chiqadi – **Ruxsat** bering.  
   - Xaritada pizzeria va sizning nuqtangiz, ular orasidagi masofa (km) ko‘rinadi.  
2. **Yetkazib berish manzili (order da koordinatalar bor):**  
   - Checkout da to‘liq manzil yozilgan buyurtma uchun tracking sahifasida restoran + yetkazib berish nuqtasi ko‘rinadi (ruxsat so‘ramasdan, agar API tracking qaytarsa).  
3. **Haydovchi:**  
   - Admin/haydovchi orqali buyurtmaga haydovchi tayinlang va joy yuboring – tracking sahifasida haydovchi va marshrut yangilanadi.

---

## Harid flow (qisqacha)

1. **/** – menyu, mahsulot tanlash  
2. **/products/hawaiian-1** – mahsulot, Savatga qo‘shish  
3. **/cart** – savat, Buyurtma berish  
4. **/checkout** – forma to‘ldirish, Buyurtma berish (POST /api/orders)  
5. **/checkout/success?orderId=...** – «Buyurtma tayyorlanmoqda» + **Menuga qaytish** + **Kuzatib borish**  
6. **Menuga qaytish** → **/**  
7. **Kuzatib borish** → **/tracking/[orderId]**

Submit dan keyin foydalanuvchi **cart ga qaytmaydi** – to‘g‘ridan-to‘g‘ri **checkout success** da ikkala tugma bilan ko‘rinadi.
