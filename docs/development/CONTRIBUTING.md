# Dasturchilar uchun Qo'llanma

## 🛠️ Development Setup

### Talablar

- Node.js 18+
- pnpm 8+
- Git

### Qadam-qadam Setup

1. **Repository ni klonlash:**

   ```bash
   git clone <repository-url>
   cd Zo-rPizza
   ```

2. **Paketlarni o'rnatish:**

   ```bash
   pnpm install
   ```

3. **Environment sozlash:**

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

4. **Database sozlash:**

   ```bash
   cd backend
   pnpm prisma:push
   pnpm prisma:seed
   ```

5. **Ishga tushurish:**
   ```bash
   pnpm dev
   ```

## 📁 Koding Standartlari

### TypeScript

- Strict mode aktiv
- Typelar `shared/` papkasida saqlanadi
- Interface lar `I` prefiksi bilan emas, to'g'ridan-to'g'ri nomlanadi

### ESLint & Prettier

- Avtomatik formatlash `tools/configs/` dan sozlanadi
- Commit qilishdan oldin `pnpm lint` ishga tushiriladi

### Git Conventions

- Feat: Yangi xususiyat
- Fix: Xatolik tuzatish
- Docs: Dokumentatsiya
- Style: Kod stil o'zgarishi
- Refactor: Kod refaktoringi
- Test: Testlar
- Chore: Build, dependency updates

## 🧪 Testlash

### Unit Testlar

```bash
# Frontend
cd frontend && pnpm test

# Backend
cd backend && pnpm test
```

### E2E Testlar

```bash
pnpm test:e2e
```

## 🚀 Deployment

### Environmentlar

- **Development:** `pnpm dev`
- **Production:** `pnpm build && pnpm start`

### Build Process

```bash
# Frontend build
pnpm --filter frontend build

# Backend build (agar kerak bo'lsa)
pnpm --filter backend build
```

## 🔍 Debugging

### Backend

- VSCode debugger konfiguratsiyasi `.vscode/` da
- Loglar `logs/` papkasida saqlanadi

### Frontend

- React DevTools
- Next.js debug mode

## 📞 Yordam

Savollar uchun:

- Team lead ga murojaat qiling
- [Issues](../../issues) oching
