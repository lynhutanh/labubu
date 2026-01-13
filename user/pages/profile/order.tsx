import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { orderService, Order } from "../../src/services/order.service";
import { storage } from "../../src/utils/storage";
import toast from "react-hot-toast";
import { formatCurrency } from "../../src/lib/string";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ xử lý", color: "text-yellow-400", icon: Clock },
  confirmed: { label: "Đã xác nhận", color: "text-blue-400", icon: CheckCircle2 },
  processing: { label: "Người bán đang chuẩn bị hàng", color: "text-purple-400", icon: Package },
  shipping: { label: "Đang giao hàng", color: "text-indigo-400", icon: Package },
  delivered: { label: "Đã giao", color: "text-green-400", icon: CheckCircle2 },
  completed: { label: "Hoàn thành", color: "text-green-500", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "text-red-400", icon: XCircle },
  refunded: { label: "Đã hoàn tiền", color: "text-gray-400", icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ thanh toán", color: "text-yellow-400" },
  paid: { label: "Đã thanh toán", color: "text-green-400" },
  failed: { label: "Thanh toán thất bại", color: "text-red-400" },
  refunded: { label: "Đã hoàn tiền", color: "text-gray-400" },
};

const paymentMethodConfig: Record<string, { label: string; icon: any }> = {
  cod: { label: "Thanh toán khi nhận hàng", icon: Package },
  sepay: { label: "Chuyển khoản ngân hàng", icon: CreditCard },
  wallet: { label: "Ví điện tử", icon: DollarSign },
  paypal: { label: "PayPal", icon: CreditCard },
  zalopay: { label: "ZaloPay", icon: CreditCard },
};

export default function ProfileOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
  });

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem đơn hàng");
      router.push("/login");
      return;
    }

    loadOrders();
  }, [page, filters, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({
        page,
        limit: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      });
      // Đảm bảo parse đúng
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Head>
        <title>Đơn hàng của tôi | Labubu</title>
      </Head>
      <Layout>
        <ProfileLayout>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Package className="w-8 h-8" />
              Đơn hàng của tôi
            </h1>
            <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Trạng thái thanh toán
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thanh toán thất bại</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200"
            >
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</p>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Mua sắm ngay
              </button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {orders.map((order, index) => {
                  const StatusIcon = statusConfig[order.status]?.icon || Package;
                  const PaymentMethod = paymentMethodConfig[order.paymentMethod] || {
                    label: order.paymentMethod,
                    icon: CreditCard,
                  };
                  const PaymentIcon = PaymentMethod.icon;

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => router.push(`/profile/order/${order._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left: Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {order.orderNumber}
                              </h3>
                              <p className="text-gray-600 text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon
                                className={`w-5 h-5 ${statusConfig[order.status]?.color || "text-gray-400"}`}
                              />
                              <span
                                className={`font-semibold ${statusConfig[order.status]?.color || "text-gray-400"}`}
                              >
                                {statusConfig[order.status]?.label || order.status}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="mb-3">
                            <p className="text-gray-600 text-sm mb-2">{order.items.length} sản phẩm</p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 text-sm"
                                >
                                  {item.name} x{item.quantity}
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 text-sm">
                                  +{order.items.length - 3} sản phẩm khác
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <PaymentIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">{PaymentMethod.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${paymentStatusConfig[order.paymentStatus]?.color || "text-gray-400"}`}
                              >
                                {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Total & Action */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-gray-600 text-sm mb-1">Tổng tiền</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/profile/order/${order._id}`);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                          >
                            Xem chi tiết
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                  >
                    Sau
                  </button>
                </motion.div>
              )}
            </>
          )}
        </ProfileLayout>
      </Layout>
    </>
  );
}
