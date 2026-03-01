# 🎨 Loading Skeletons - Usage Guide

## 📦 Available Components

### 1. ProductCardSkeleton
**Purpose:** Loading placeholder for product cards  
**File:** `components/skeletons/ProductCardSkeleton.tsx`

```tsx
import { ProductCardSkeleton, ProductCardSkeletonGrid } from '@/components/skeletons'

// Single skeleton
<ProductCardSkeleton />

// Grid of skeletons
<ProductCardSkeletonGrid count={8} />
```

**Where to use:**
- ✅ Home page - Products section
- ✅ Menu page - All products
- ✅ Popular products section
- ✅ Favorites page

---

### 2. TableSkeleton
**Purpose:** Loading placeholder for data tables  
**File:** `components/skeletons/TableSkeleton.tsx`

```tsx
import { TableSkeleton, CompactTableSkeleton } from '@/components/skeletons'

// Full table skeleton
<TableSkeleton rows={5} columns={5} />

// Compact list skeleton
<CompactTableSkeleton rows={3} />
```

**Where to use:**
- ✅ Admin dashboard - Orders table
- ✅ Admin users page
- ✅ Admin products/categories
- ✅ Driver orders list

---

### 3. MapSkeleton
**Purpose:** Loading placeholder for map components  
**File:** `components/skeletons/MapSkeleton.tsx`

```tsx
import { MapSkeleton, TrackingCardSkeleton } from '@/components/skeletons'

// Map skeleton
<MapSkeleton />

// Tracking info card
<TrackingCardSkeleton />
```

**Where to use:**
- ✅ Tracking page - Map view
- ✅ Driver delivery page
- ✅ Order tracking modal

---

## 🎯 Implementation Strategy

### ✅ What We Improved:

#### **Before (Old Approach):**
```tsx
{loading && (
  <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />
)}
```

❌ **Problems:**
- Too simple - doesn't match content layout
- No shimmer effect
- Layout shift when content loads
- Not reusable

#### **After (New Approach):**
```tsx
{loading && <ProductCardSkeleton />}
```

✅ **Benefits:**
- Matches exact ProductCard layout
- Professional shimmer animation
- No layout shift
- Reusable across the app
- Better UX

---

## 🌟 Shimmer Animation

### Technical Details:
```css
/* Tailwind config */
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
}

/* Usage */
className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 
           animate-shimmer bg-[length:200%_100%]"
```

**Why Shimmer?**
- ✨ Modern and professional look
- 🎯 Indicates loading progress
- 👁️ Better than static pulse
- 🚀 Used by Facebook, LinkedIn, YouTube

---

## 📊 Performance Considerations

### CSS-only Animation:
✅ No JavaScript required  
✅ Hardware accelerated  
✅ Low CPU usage  
✅ Smooth 60fps animation

### Best Practices:
1. **Match Layout Exactly** - Prevent layout shift
2. **Use Realistic Counts** - Show expected number of items
3. **Keep It Fast** - 2s animation cycle is optimal
4. **Gradient Colors** - gray-200 → gray-100 → gray-200

---

## 🎨 Design Principles

### 1. Content Placeholder
Skeleton should look like content structure:
```tsx
// Product Card Structure:
- Image (h-48)
- Title (h-5, w-3/4)
- Description (h-4, 2 lines)
- Meta info (h-4)
- Price + Button (h-6, h-9)
```

### 2. Appropriate Timing
```tsx
// Quick API calls (< 500ms) - Maybe no skeleton needed
// Medium (500ms - 2s) - Show skeleton
// Slow (> 2s) - Show skeleton + progress indicator
```

### 3. Graceful Degradation
```tsx
{isLoading ? (
  <ProductCardSkeleton />
) : products.length === 0 ? (
  <EmptyState />
) : (
  products.map(p => <ProductCard key={p.id} product={p} />)
)}
```

---

## 📋 Implementation Checklist

### ✅ Completed:
- [x] ProductCardSkeleton component
- [x] TableSkeleton component
- [x] MapSkeleton component
- [x] Shimmer animation in Tailwind
- [x] Updated home page
- [x] Updated menu page
- [x] Updated popular products

### 🔜 Can Be Added Later:
- [ ] DashboardCardSkeleton (for stats cards)
- [ ] FormSkeleton (for checkout/forms)
- [ ] ListSkeleton (for simple lists)
- [ ] Dark mode variants

---

## 🚀 Usage Examples

### Example 1: Home Page Products
```tsx
{loading ? (
  <ProductCardSkeletonGrid count={8} />
) : (
  products.map(p => <ProductCard key={p.id} product={p} />)
)}
```

### Example 2: Admin Orders Table
```tsx
{loading ? (
  <TableSkeleton rows={10} columns={6} />
) : (
  <OrdersTable orders={orders} />
)}
```

### Example 3: Tracking Map
```tsx
{!mapLoaded && <MapSkeleton />}
{mapLoaded && <TrackingMap orderId={id} />}
```

---

## 🎯 Key Takeaways

1. **Always Match Layout** - Skeleton = Real content structure
2. **Use Shimmer** - More professional than pulse
3. **Keep It Simple** - Don't over-engineer
4. **Performance First** - CSS-only animations
5. **Reusable Components** - DRY principle

---

## 📚 Resources

- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Loading UI Patterns](https://www.nngroup.com/articles/progress-indicators/)

---

**Status:** ✅ Production Ready  
**Updated:** 2026-03-01  
**Version:** 1.0.0
