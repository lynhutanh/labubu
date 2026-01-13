# TÍCH HỢP SEPAY - TÀI LIỆU KỸ THUẬT

## 📋 FLOW DIAGRAM

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Đặt hàng (POST /api/orders)
     ▼
┌─────────────────┐
│  BACKEND API    │
│  - Validate cart│
│  - Tính tổng    │
│  - Tạo order    │
│  - payment_ref  │
│  = SP_{code}    │
└────┬────────────┘
     │ 2. Response: order với payment_ref
     ▼
┌─────────┐
│  USER   │
└────┬────┘
     │ 3. GET /api/orders/{code}/payment
     ▼
┌─────────────────┐
│  BACKEND API    │
│  - Generate QR  │
│  - URL SePay    │
└────┬────────────┘
     │ 4. Response: QR URL, amount, payment_ref
     ▼
┌─────────┐
│  USER   │
└────┬────┘
     │ 5. Quét QR & Chuyển khoản
     ▼
┌─────────┐
│  SEPAY  │
└────┬────┘
     │ 6. Webhook POST /api/webhook/sepay
     ▼
┌─────────────────┐
│  BACKEND API    │
│  - Verify       │
│    merchant_id  │
│  - Verify       │
│    signature    │
│  - Find order   │
│  - Verify       │
│    amount       │
│  - Update       │
│    order PAID   │
│  - Save         │
│    transaction  │
└────┬────────────┘
     │ 7. Response: success
     ▼
┌─────────┐
│  USER   │
│  Poll   │
│  Status │
└─────────┘
```

## 🔐 PSEUDO-CODE WEBHOOK HANDLER

```typescript
async handleWebhook(payload: ISePayWebhookPayload) {
  // 1. Verify merchant_id
  if (payload.merchant_id !== MERCHANT_ID) {
    return { success: false, message: "Merchant ID không hợp lệ" };
  }

  // 2. Verify signature
  rawString = payload.merchant_id + 
              payload.transaction_id + 
              payload.amount + 
              payload.content + 
              payload.status;
  
  expectedSignature = HMAC_SHA256(rawString, SECRET_KEY);
  
  if (!timingSafeEqual(payload.signature, expectedSignature)) {
    return { success: false, message: "Chữ ký không hợp lệ" };
  }

  // 3. Check idempotent (transaction đã xử lý?)
  existingTransaction = findTransactionByExternalId(payload.transaction_id);
  if (existingTransaction) {
    return { success: true, message: "Giao dịch đã được xử lý" };
  }

  // 4. Find order by payment_ref
  order = findOrderByPaymentRef(payload.content);
  if (!order) {
    return { success: false, message: "Không tìm thấy đơn hàng" };
  }

  // 5. Verify order status
  if (order.status !== PENDING) {
    return { success: false, message: "Đơn hàng không ở trạng thái PENDING" };
  }

  // 6. Verify amount
  if (order.total !== payload.amount) {
    return { success: false, message: "Số tiền không khớp" };
  }

  // 7. Verify webhook status
  if (payload.status !== "SUCCESS") {
    return { success: false, message: "Trạng thái thanh toán không thành công" };
  }

  // 8. Check timeout (15 phút)
  if (now - order.createdAt > WEBHOOK_TIMEOUT) {
    return { success: false, message: "Đơn hàng đã hết hạn" };
  }

  // 9. Create transaction record
  transaction = createTransaction({
    orderId: order._id,
    externalTransactionId: payload.transaction_id,
    amount: payload.amount,
    rawWebhook: payload,
    ...
  });

  // 10. Update order
  updateOrder(order._id, {
    paymentStatus: PAID,
    paidAt: now,
    paymentTransactionId: transaction._id
  });

  return { success: true, message: "Xác nhận thanh toán thành công" };
}
```

## ✅ CHECKLIST CÁC TASK CẦN CODE

### Database Schema
- [x] Thêm `payment_ref` vào order schema
- [x] Thêm `rawWebhook` vào transaction schema
- [x] Tạo index cho `payment_ref`

### Configuration
- [x] Tạo config file `sepay.ts`
- [x] Load config vào `app.module.ts`
- [x] Thêm biến môi trường:
  - `SEPAY_MERCHANT_ID`
  - `SEPAY_SECRET_KEY`
  - `SEPAY_ACCOUNT`
  - `SEPAY_BANK` (default: VIB)
  - `SEPAY_WEBHOOK_TIMEOUT` (default: 900000ms = 15 phút)

### Constants
- [x] Thêm `SEPAY` vào `PAYMENT_METHOD`
- [x] Thêm `SEPAY` vào `PAYMENT_PROVIDER`

### Services
- [x] Tạo `SePayService` với các method:
  - [x] `generateQRUrl()` - Tạo URL QR SePay
  - [x] `verifySignature()` - Verify webhook signature
  - [x] `verifyMerchantId()` - Verify merchant ID
  - [x] `handleWebhook()` - Xử lý webhook (idempotent)
  - [x] `getPaymentInfo()` - Lấy thông tin thanh toán

### Controllers
- [x] Tạo `SePayController` - `/payment/sepay`
- [x] Tạo `WebhookController` - `/webhook/sepay`
- [x] Cập nhật `BuyerOrderController`:
  - [x] `GET /orders/:orderCode/payment` - Lấy QR thanh toán
  - [x] `GET /orders/:orderCode/status` - Poll trạng thái đơn

### Order Service
- [x] Cập nhật `createOrder()`:
  - [x] Tạo `payment_ref = SP_{orderNumber}` khi `paymentMethod = SEPAY`
  - [x] Lưu `payment_ref` vào order

### DTOs
- [x] Cập nhật `CreateTransactionDto` - thêm `rawWebhook` field

### Module
- [x] Cập nhật `PaymentModule` - thêm `SePayService` và `WebhookController`
- [x] Export `SePayService` để dùng trong `OrderModule`

## 🧪 TEST CASES CẦN VERIFY

### 1. Tạo đơn hàng với SePay
- [ ] POST `/api/orders` với `paymentMethod: "sepay"`
- [ ] Verify order được tạo với:
  - `paymentMethod = "sepay"`
  - `payment_ref = "SP_{orderNumber}"`
  - `status = "pending"`
  - `paymentStatus = "pending"`

### 2. Lấy QR thanh toán
- [ ] GET `/api/orders/{orderCode}/payment`
- [ ] Verify response có:
  - `amount` (số tiền)
  - `paymentRef` (nội dung CK)
  - `qrUrl` (URL QR SePay)
  - `expiredAt` (thời gian hết hạn)

### 3. Verify QR URL
- [ ] QR URL có format đúng:
  - `https://qr.sepay.vn/img?acc=...&bank=...&amount=...&des=...&template=compact`
- [ ] `des` = `payment_ref` của order

### 4. Webhook - Success Case
- [ ] POST `/api/webhook/sepay` với payload hợp lệ
- [ ] Verify:
  - Signature đúng
  - Merchant ID đúng
  - Order tồn tại
  - Amount khớp
  - Order status = PENDING
- [ ] Verify order được cập nhật:
  - `paymentStatus = "paid"`
  - `paidAt` được set
  - `paymentTransactionId` được set
- [ ] Verify transaction được tạo với `rawWebhook`

### 5. Webhook - Idempotent
- [ ] Gửi webhook lần 1 → Success
- [ ] Gửi webhook lần 2 (cùng transaction_id) → Success nhưng không cập nhật lại
- [ ] Verify transaction chỉ có 1 record

### 6. Webhook - Invalid Merchant ID
- [ ] Gửi webhook với `merchant_id` sai
- [ ] Verify response: `success: false, message: "Merchant ID không hợp lệ"`

### 7. Webhook - Invalid Signature
- [ ] Gửi webhook với `signature` sai
- [ ] Verify response: `success: false, message: "Chữ ký không hợp lệ"`

### 8. Webhook - Order Not Found
- [ ] Gửi webhook với `content` không tồn tại
- [ ] Verify response: `success: false, message: "Không tìm thấy đơn hàng"`

### 9. Webhook - Wrong Amount
- [ ] Gửi webhook với `amount` khác order.total
- [ ] Verify response: `success: false, message: "Số tiền không khớp"`

### 10. Webhook - Order Not PENDING
- [ ] Tạo order và set status = CANCELLED
- [ ] Gửi webhook cho order đó
- [ ] Verify response: `success: false, message: "Đơn hàng không ở trạng thái PENDING"`

### 11. Webhook - Expired Order
- [ ] Tạo order với `createdAt` > 15 phút trước
- [ ] Gửi webhook cho order đó
- [ ] Verify response: `success: false, message: "Đơn hàng đã hết hạn"`

### 12. Webhook - Wrong Status
- [ ] Gửi webhook với `status != "SUCCESS"`
- [ ] Verify response: `success: false, message: "Trạng thái thanh toán không thành công"`

### 13. Poll Order Status
- [ ] GET `/api/orders/{orderCode}/status`
- [ ] Verify response có:
  - `orderCode`
  - `status`
  - `paymentStatus`
  - `paymentRef`

### 14. Security
- [ ] Verify SECRET_KEY không bị expose trong code
- [ ] Verify SECRET_KEY được load từ environment variable
- [ ] Verify webhook endpoint không cần authentication (public)
- [ ] Verify signature verification dùng constant-time comparison

### 15. Edge Cases
- [ ] Chuyển khoản sai nội dung → Webhook không match order
- [ ] Chuyển thiếu tiền → Webhook bị reject
- [ ] Chuyển trùng nội dung → Xử lý như thế nào? (Chưa xác minh)
- [ ] Webhook đến sau khi đơn hết hạn → Bị reject

## ⚠️ CHƯA XÁC MINH

1. **Cấu trúc webhook payload chính xác**: Hiện tại giả định có các field:
   - `merchant_id`
   - `transaction_id`
   - `amount`
   - `content`
   - `status`
   - `signature`
   - Có thể có thêm field khác

2. **Cách tạo signature**: Giả định:
   - `raw_string = merchant_id + transaction_id + amount + content + status`
   - `signature = HMAC_SHA256(raw_string, SECRET_KEY)`
   - Format: hex string

3. **Giá trị status hợp lệ**: Giả định `"SUCCESS"` là giá trị thành công, có thể có giá trị khác

4. **Xử lý chuyển khoản trùng nội dung**: Chưa có logic xử lý nếu 2 order có cùng payment_ref (không nên xảy ra vì orderNumber unique)

5. **Webhook retry mechanism**: SePay có retry không? Cần xử lý như thế nào?

6. **Timeout chính xác**: 15 phút là giả định, cần xác nhận với SePay

## 📝 ENVIRONMENT VARIABLES

Thêm vào `.env`:

```env
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_secret_key
SEPAY_ACCOUNT=your_bank_account_number
SEPAY_BANK=VIB
SEPAY_WEBHOOK_TIMEOUT=900000
```

## 🔗 API ENDPOINTS

### Public Endpoints
- `POST /api/webhook/sepay` - Webhook từ SePay

### Protected Endpoints (Require Auth)
- `GET /api/orders/:orderCode/payment` - Lấy QR thanh toán
- `GET /api/orders/:orderCode/status` - Poll trạng thái đơn

## 📚 NOTES

- QR chỉ để user chuyển khoản - webhook + verify mới quyết định đơn hàng PAID
- Không xác nhận thanh toán từ frontend
- Chỉ tin webhook từ SePay sau khi verify signature
- Code phải idempotent (webhook có thể gửi nhiều lần)
- Không hard-code secret
- Không suy đoán dữ liệu không có
