# Zo'r Pizza – Tekshirish va linklar qo'llanmasi

Loyihani lokalda ishga tushirib, checkout va buyurtma flow'ini qanday tekshirish kerakligi.

---

## 1. Loyihani ishga tushirish

```bash
pnpm run dev:both
```

- **Frontend:** http://127.0.0.1:3000 (yoki http://localhost:3000)
- **Backend API:** http://localhost:5001

Brauzerda odatda **http://127.0.0.1:3000** ochasiz.

---

## 2. Asosiy sahifalar (linklar)

| Sahifa | URL | Tavsif |
|--------|-----|--------|
| Bosh sahifa / menyu | http://127.0.0.1:3000 | Kategoriyalar, mahsulotlar, savat |
| Savat | http://127.0.0.1:3000/cart | Savatdagi mahsulotlar, checkout ga o‘tish |
| Checkout (sotib olish) | http://127.0.0.1:3000/checkout | Manzil, telefon, to‘lov – buyurtma berish |
| Buyurtma muvaffaqiyatli | http://127.0.0.1:3000/checkout/success?orderId=... | Submit dan keyin – xabar + tugmalar |
| Mening buyurtmalarim | http://127.0.0.1:3000/orders | Ro‘yxat |
| Bitta buyurtma | http://127.0.0.1:3000/orders/[id] | Status, tafsilotlar, Menuga qaytish / Kuzatib borish |
| Kuzatib borish | http://127.0.0.1:3000/tracking/[id] | Buyurtma holati (tracking) |

---

## 3. Checkout va “Buyurtma tayyorlanmoqda” flow'ini tekshirish

### 3.1 Tayyorgarlik

1. Brauzerda **http://127.0.0.1:3000** oching.
2. Agar login talab qilinsa – ro‘yxatdan o‘ting / kiring.
3. Menudan biror mahsulot tanlang va **Savatga qo‘shing**.

### 3.2 Savat → Checkout

4. **Savat** ga o‘ting: http://127.0.0.1:3000/cart  
   - Savatda mahsulot(lar) ko‘rinishi kerak.
5. **Checkout** tugmasini bosing (yoki to‘g‘ridan-to‘g‘ri http://127.0.0.1:3000/checkout oching).

### 3.3 Ma’lumotlarni kiritish va Submit

6. **Checkout** sahifasida:
   - **Manzil** (delivery address) kiriting.
   - **Telefon** raqamini kiriting.
   - **To‘lov turi**ni tanlang (naqd/karta va hokazo).
7. **Buyurtma berish** (Submit) tugmasini bosing.

### 3.4 Submit dan keyin – success sahifasi

8. Submit muvaffaqiyatli bo‘lsa:
   - Siz avtomatik **Buyurtma muvaffaqiyatli** sahifasiga yo‘naltirilasiz:  
     **http://127.0.0.1:3000/checkout/success?orderId=...&orderNumber=...**
   - Sahifada quyidagilar chiqadi:
     - **“Buyurtmangiz qabul qilindi”** va **“Buyurtma tayyorlanmoqda”** xabari.
     - **Buyurtma raqami** (agar backend yuborsa).
     - **Menuga qaytish** tugmasi → bosh sahifa (http://127.0.0.1:3000).
     - **Kuzatib borish** tugmasi → http://127.0.0.1:3000/tracking/[orderId]

### 3.5 Tugmalarni tekshirish

9. **Menuga qaytish** ni bosing – bosh sahifa (menyu) ochilishi kerak.
10. Yana checkout orqali buyurtma bering yoki **Mening buyurtmalarim** dan bitta buyurtmani oching.
11. **Kuzatib borish** ni bosing – **tracking** sahifasi ochiladi:  
    http://127.0.0.1:3000/tracking/[id]  
    Bu yerda buyurtma holati (PENDING, PREPARING va hokazo) ko‘rinadi.

---

## 4. Buyurtma tafsiloti sahifasini tekshirish

- **http://127.0.0.1:3000/orders** – ro‘yxat.
- Biror buyurtmani oching: **http://127.0.0.1:3000/orders/[id]**.
- Sahifada:
  - **“Buyurtmangiz tayyorlanmoqda”** (yoki statusga qarab boshqa matn).
  - **Menuga qaytish** tugmasi → bosh sahifa.
  - **Kuzatib borish** tugmasi (faol buyurtmalar uchun – CANCELLED/COMPLETED dan boshqalar).
  - **Qayta buyurtma berish** (COMPLETED buyurtmalar uchun).

---

## 5. Qisqa xulosa

| Qadam | Harakat | Natija / link |
|-------|---------|----------------|
| 1 | http://127.0.0.1:3000 ochish | Bosh sahifa, menyu |
| 2 | Mahsulot tanlab savatga qo‘shish | Savat to‘ladi |
| 3 | http://127.0.0.1:3000/cart → Checkout | http://127.0.0.1:3000/checkout |
| 4 | Manzil, telefon, to‘lov kiritib Submit | Buyurtma yuboriladi |
| 5 | Submit dan keyin | http://127.0.0.1:3000/checkout/success?orderId=... – “Buyurtma tayyorlanmoqda” + Menuga qaytish / Kuzatib borish |
| 6 | Kuzatib borish | http://127.0.0.1:3000/tracking/[id] |
| 7 | Menuga qaytish | http://127.0.0.1:3000 |

Bu qo‘llanma orqali checkout, success xabari va ikkala tugma (Menuga qaytish, Kuzatib borish) to‘liq tekshiriladi.
