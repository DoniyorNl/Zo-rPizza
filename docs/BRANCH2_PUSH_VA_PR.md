# Branch2 ga push va Pull Request (CodeRabbit tekshiruvi)

**Maqsad:** O‘zgarishlarni branch2 ga push qilish va PR ochganda CodeRabbit (yoki boshqa bot) tekshirishini osonlashtirish.

---

## 1. Push oldidan tekshirish

```bash
# Loyiha root da
cd /Users/mac/Desktop/Zo-rPizza

# Hech narsa commit qilinmasin: .env, .env.local, node_modules
git status

# Testlar va build o‘tsin
pnpm test
pnpm build
```

**Commit qilmaslik kerak:** `.env`, `.env.local`, `node_modules`, `logs/`, `coverage/`, `.next/`.

---

## 2. Branch2 ga push

```bash
# Barcha o‘zgarishlarni stage qilish (keraklilari)
git add .
# Yoki aniq fayllar: git add .github docs frontend/app/layout.tsx ...

# Keraksiz fayllarni olib tashlash (agar add qilingan bo‘lsa)
git reset HEAD .env
git reset HEAD .env.local

# Commit
git commit -m "feat: build fix, CI branch2, tracking tests, docs va PR template"

# Remote da branch2 bor bo‘lsa
git push origin branch2
# Yoki birinchi marta: git push -u origin branch2
```

---

## 3. Pull Request ochish

1. GitHub repo sahifasiga o‘ting.
2. **Compare & pull request** (yoki **Pull requests** → **New pull request**).
3. **base:** `main` (yoki asosiy branch), **compare:** `branch2` tanlang.
4. **Title:** aniq va qisqa (masalan: "Build fix, CI, tracking tests, docs").
5. **Description:** GitHub avtomatik **PR template** (.github/PULL_REQUEST_TEMPLATE.md) ni ko‘rsatadi – qatorlarni to‘ldiring:
   - **Nima o'zgartirildi?** – qisqacha ro‘yxat.
   - **Qanday tekshirish?** – checklist (build, test, qo‘lda).
   - **Eslatmalar** – agar kerak bo‘lsa.

PR ni **Create** qiling.

---

## 4. CodeRabbit tekshirishini osonlashtirish

| Nima qilish | Nima uchun |
|-------------|------------|
| **CI yashil bo‘lsin** | Push dan keyin GitHub Actions ishlaydi; barcha steplar o‘tsa CodeRabbit “checks passed” ko‘radi. |
| **PR description to‘ldirish** | PR template dagi “Nima o‘zgartirildi?” va “Qanday tekshirish?” – bot va odamlar kontekstni tushunadi. |
| **Kichik va aniq PR** | Bir PR da bitta mavzu (masalan: “Build + test”) – tekshirish oson. |
| **.coderabbit.yaml** | Repo ildizida bor – `profile: chill`, `auto_review: true`; kerak bo‘lsa [docs](https://docs.coderabbit.ai/reference/configuration-schema) orqali sozlang. |

**CodeRabbit** repo ga ulangan bo‘lsa, PR ochilgach avtomatik diff ni tekshiradi va sharh qoldiradi. Sozlamalar: repo **Settings** → **Integrations** (yoki CodeRabbit dashboard).

---

## 5. Qisqa buyruqlar

```bash
git status
pnpm test && pnpm build
git add .
git commit -m "feat: ..."
git push origin branch2
```

Keyin GitHub da **Pull request** ochib, template bo‘yicha description yozing.

---

_Oxirgi yangilanish: 2026-02-21_
