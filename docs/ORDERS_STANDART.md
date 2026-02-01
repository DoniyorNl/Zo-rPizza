# Buyurtmalar: standart pizzeria holati

/orders sahifasi va buyurtma oqimi standart pizzeria rejimida: faqat foydalanuvchi o‘zi bergan buyurtmalar ko‘rinadi, seed demo buyurtmalar yaratmaydi.

---

## Oqim

1. **Seed** – buyurtma yaratmaydi. Seed faqat kategoriyalar, mahsulotlar, userlar va hokazolarni yaratadi.
2. **Checkout** – foydalanuvchi buyurtma beradi → backend `createOrder` Firebase UID orqali userni topadi (yoki yaratadi), buyurtmani `Order.userId = user.id` bilan yozadi.
3. **GET /api/orders/user/:userId** – backend URL’dagi `userId` ni Firebase UID deb oladi, `User`ni `firebaseUid` bo‘yicha topadi, keyin faqat shu user’ning `userId` (DB id) bo‘yicha buyurtmalarni qaytaradi. Shuning uchun faqat o‘zingizning buyurtmalaringiz ko‘rinadi.
4. **DELETE /api/orders/:id** – faqat buyurtma egasi o‘zining PENDING buyurtmasini o‘chira oladi.

---

## Mavjud bazadagi seed buyurtmalarini tozalash

Agar ilgari seed ishlatilgan va bazada demo buyurtmalar qolgan bo‘lsa, ularni bir marta tozalash uchun:

```bash
cd backend
pnpm exec tsx scripts/clear-orders.ts
```

Yoki bazani to‘liq qayta yaratib, seed’ni qayta ishlatish (barcha ma’lumotlar o‘chadi, faqat seed ma’lumotlar qoladi):

```bash
cd backend
pnpm exec prisma migrate reset
```

---

## Qisqacha

| Nima | Qanday |
|------|--------|
| Yangi buyurtma | Faqat checkout orqali → /orders da ko‘rinadi |
| Seed | Buyurtma yaratmaydi |
| /orders | Faqat joriy user’ning buyurtmalari (Firebase UID → user.id → orders) |
| O‘chirish | Faqat PENDING, faqat egasi; frontend’da "Bekor qilish" tugmasi |
