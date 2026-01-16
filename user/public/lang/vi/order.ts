export default {
  title: "Đơn hàng của tôi | Labubu",
  pageTitle: "Đơn hàng của tôi",
  description: "Quản lý và theo dõi tất cả đơn hàng của bạn",
  status: {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Người bán đang chuẩn bị hàng",
    shipping: "Đang giao hàng",
    delivered: "Đã giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  },
  paymentStatus: {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  },
  paymentMethod: {
    cod: "Thanh toán khi nhận hàng",
    sepay: "Chuyển khoản ngân hàng",
    wallet: "Ví",
    paypal: "PayPal",
    zalopay: "ZaloPay",
  },
  filters: {
    orderStatus: "Trạng thái đơn hàng",
    paymentStatus: "Trạng thái thanh toán",
    all: "Tất cả",
  },
  empty: {
    title: "Chưa có đơn hàng nào",
    description: "Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!",
    shopNow: "Mua sắm ngay",
  },
  order: {
    products: "sản phẩm",
    moreProducts: "sản phẩm khác",
    total: "Tổng tiền",
    viewDetails: "Xem chi tiết",
  },
  pagination: {
    previous: "Trước",
    next: "Sau",
    page: "Trang",
    of: "/",
  },
  errors: {
    loginRequired: "Vui lòng đăng nhập để xem đơn hàng",
    loadError: "Không thể tải danh sách đơn hàng",
  },
};
