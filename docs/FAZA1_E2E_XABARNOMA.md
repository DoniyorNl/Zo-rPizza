# Faza 1 – E2E Testlar Xabarnomasi

## Yaratilgan fayllar

### 1. `e2e/tests/checkout-flow.spec.ts`

Checkout va savatcha E2E testlari:

| Test | Tavsif |
|------|--------|
| Bo'sh savatchada xabar | `cart-empty` da "Savatcha bo'sh" ko'rinishi |
| Menyuga qaytish | `cart-empty-menu-link` orqali `/` ga o'tish |
| Mahsulot qo'shish → Checkout | Product card → size tanlash → add-to-cart → cart → checkout tugmasi |
| Checkout forma elementlari | `checkout-form`, `checkout-address`, `checkout-phone`, to'lov usullari |
| To'lov tanlash | `payment-cash`, `payment-card` tugmalari |
| Manzil va telefon | Inputlarga yozish va qiymat tekshirish |

### 2. `e2e/tests/login-register.spec.ts`

Login va Register E2E testlari:

| Test | Tavsif |
|------|--------|
| Login sahifa | Form, email, password, submit mavjudligi |
| Bo'sh forma | Submit → sahifa `/login` da qoladi |
| Noto'g'ri credential | Firebase xato → `login-error` ko'rinishi |
| Parolni unutdingizmi | Link `/forgot-password` ga |
| Ro'yxatdan o'tish linki | Login → Register sahifasiga |
| Register sahifa | Barcha forma elementlari |
| Parol mos kelmasa | `register-error` va "Parollar mos kelmadi" |
| Qisqa parol | "6 ta belgidan iborat" xabari |
| Kirish linki | Register → Login sahifasiga |

## Qo'shilgan data-testid lar

| Komponent/Sahifa | data-testid |
|------------------|-------------|
| ProductCard | `product-card`, `product-card-select` |
| Product detail | `size-option`, `add-to-cart` |
| Checkout success | `checkout-success-title` |
| Register | `register-form`, `register-email`, `register-password`, `register-confirm-password`, `register-submit`, `register-error` |

## E2E testlarni ishga tushirish

```bash
# 1. Playwright brauzerlarni o'rnatish (birinchi marta)
pnpm exec playwright install

# 2. Backend va frontend ishlashi kerak (yoki Playwright config orqali avtomatik)
pnpm run dev:both

# 3. E2E testlarni ishga tushirish
pnpm run test:e2e

# Faqat yangi speclar
pnpm run test:e2e -- --grep "checkout-flow|login-register"
```

## Eslatma

- `login – noto'g'ri credential` testi Firebase ga so'rov yuboradi; backend va Firebase sozlangan bo'lishi kerak
- Checkout testlari user login bo'lmaganda `/login` ga yo'naltiradi; ba'zi testlar shartli (`if (page.url().includes('/checkout'))`)
