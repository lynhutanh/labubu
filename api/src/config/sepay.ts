export default () => ({
  merchantId: process.env.SEPAY_MERCHANT_ID || "",
  secretKey: process.env.SEPAY_SECRET_KEY || "",
  account: process.env.SEPAY_ACCOUNT || "",
  bank: process.env.SEPAY_BANK || "VIB",
  qrBaseUrl: "https://qr.sepay.vn/img",
  webhookTimeout: parseInt(process.env.SEPAY_WEBHOOK_TIMEOUT || "900000", 10), // 15 minutes default
});
