# Hướng dẫn cập nhật Translation cho các trang

## Các bước để cập nhật một trang:

### 1. Import translation hooks và serverSideTranslations:
```typescript
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
```

### 2. Thêm useTranslation hook trong component:
```typescript
export default function YourPage() {
  const { t } = useTranslation("common");
  // ... rest of your code
}
```

### 3. Thay thế text hardcoded bằng t():
```typescript
// Trước:
<h1>Sản Phẩm</h1>

// Sau:
<h1>{t("products.pageTitle")}</h1>
```

### 4. Thêm getStaticProps hoặc getServerSideProps ở cuối file:
```typescript
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

// Hoặc nếu cần server-side rendering:
export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
```

## Các trang đã được cập nhật:
- ✅ index.tsx (homepage)
- ✅ products/index.tsx

## Các trang cần cập nhật:
- ⏳ cart/index.tsx
- ⏳ checkout/index.tsx
- ⏳ contact/index.tsx
- ⏳ login/index.tsx
- ⏳ wishlist/index.tsx
- ⏳ products/[slug].tsx
- ⏳ profile/index.tsx
- ⏳ profile/order.tsx
- ⏳ profile/order/[id].tsx
- ⏳ profile/address.tsx
- ⏳ profile/wallet.tsx
- ⏳ profile/coupons.tsx

## Lưu ý:
- Tất cả các keys translation đã được thêm vào file `public/locales/vi/common.json` và `public/locales/en/common.json`
- Khi thêm text mới, nhớ cập nhật cả 2 file JSON
- Sử dụng nested keys để tổ chức tốt hơn (ví dụ: `cart.title`, `cart.emptyCart`)
