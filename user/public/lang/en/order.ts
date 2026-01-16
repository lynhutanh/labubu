export default {
  title: "My Orders | Labubu",
  pageTitle: "My Orders",
  description: "Manage and track all your orders",
  status: {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Seller is preparing",
    shipping: "Shipping",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  },
  paymentStatus: {
    pending: "Pending Payment",
    paid: "Paid",
    failed: "Payment Failed",
    refunded: "Refunded",
  },
  paymentMethod: {
    cod: "Cash on Delivery",
    sepay: "Bank Transfer",
    wallet: "Wallet",
    paypal: "PayPal",
    zalopay: "ZaloPay",
  },
  filters: {
    orderStatus: "Order Status",
    paymentStatus: "Payment Status",
    all: "All",
  },
  empty: {
    title: "No orders yet",
    description: "You don't have any orders yet. Start shopping now!",
    shopNow: "Shop Now",
  },
  order: {
    products: "products",
    moreProducts: "more products",
    total: "Total",
    viewDetails: "View Details",
  },
  pagination: {
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "/",
  },
  errors: {
    loginRequired: "Please login to view orders",
    loadError: "Cannot load order list",
  },
};
