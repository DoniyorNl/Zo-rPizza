-- Supabase SQL Editor da ishlating: 1 ta filial qo'shish
-- Agar "branches" jadvali bo'lmasa, avval migratsiyalarni ishga tushiring (yoki jadvalni yarating).

INSERT INTO "branches" (
  "id",
  "name",
  "address",
  "lat",
  "lng",
  "phone",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'seed-branch-1',
  'Zo-rPizza Markaziy',
  'Toshkent sh., Amir Temur ko''chasi 1',
  41.2995,
  69.2401,
  '+998712000000',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Yana filial qo'shish (id ni o'zgartiring, bir xil bo'lmasin):
-- INSERT INTO "branches" ("id", "name", "address", "lat", "lng", "phone", "isActive", "createdAt", "updatedAt")
-- VALUES (gen_random_uuid(), 'Ikkinchi filial', 'Toshkent, Chilonzor 9', 41.2850, 69.1780, '+998901234567', true, NOW(), NOW());
