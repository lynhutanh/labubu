import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Loader2,
  Truck,
} from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import TrackingModal from "../../src/components/order/TrackingModal";
import { useTrans } from "../../src/hooks/useTrans";
import { orderService, Order } from "../../src/services/order.service";
import { storage } from "../../src/utils/storage";
import toast from "react-hot-toast";
import { formatCurrency } from "../../src/lib/string";

export default function ProfileOrderPage() {
  const router = useRouter();
  const t = useTrans();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
  });
  const [trackingModal, setTrackingModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
  }>({
    isOpen: false,
    orderId: "",
    orderNumber: "",
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      pending: { color: "text-yellow-400", icon: Clock },
      confirmed: { color: "text-blue-400", icon: CheckCircle2 },
      processing: { color: "text-purple-400", icon: Package },
      shipping: { color: "text-indigo-400", icon: Package },
      delivered: { color: "text-green-400", icon: CheckCircle2 },
      completed: { color: "text-green-500", icon: CheckCircle2 },
      cancelled: { color: "text-red-400", icon: XCircle },
      refunded: { color: "text-gray-400", icon: XCircle },
    };
    return configs[status] || { color: "text-gray-400", icon: Package };
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs: Record<string, { color: string }> = {
      pending: { color: "text-yellow-400" },
      paid: { color: "text-green-400" },
      failed: { color: "text-red-400" },
      refunded: { color: "text-gray-400" },
    };
    return configs[status] || { color: "text-gray-400" };
  };

  const getPaymentMethodConfig = (method: string) => {
    const configs: Record<string, { icon: any }> = {
      cod: { icon: Package },
      sepay: { icon: CreditCard },
      wallet: { icon: DollarSign },
      paypal: { icon: CreditCard },
      zalopay: { icon: CreditCard },
    };
    return configs[method] || { icon: CreditCard };
  };

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      toast.error(t.order.errors.loginRequired);
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrders({
          page,
          limit: 10,
          ...(filters.status && { status: filters.status }),
          ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        });
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      } catch (error: any) {
        toast.error(t.order.errors.loadError);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [page, filters.status, filters.paymentStatus]);

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
        <title>{t.order.title}</title>
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
              {t.order.pageTitle}
            </h1>
            <p className="text-gray-600">{t.order.description}</p>
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
                  {t.order.filters.orderStatus}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{t.order.filters.all}</option>
                  <option value="pending">{t.order.status.pending}</option>
                  <option value="confirmed">{t.order.status.confirmed}</option>
                  <option value="processing">{t.order.status.processing}</option>
                  <option value="shipping">{t.order.status.shipping}</option>
                  <option value="delivered">{t.order.status.delivered}</option>
                  <option value="completed">{t.order.status.completed}</option>
                  <option value="cancelled">{t.order.status.cancelled}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  {t.order.filters.paymentStatus}
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{t.order.filters.all}</option>
                  <option value="pending">{t.order.paymentStatus.pending}</option>
                  <option value="paid">{t.order.paymentStatus.paid}</option>
                  <option value="failed">{t.order.paymentStatus.failed}</option>
                  <option value="refunded">{t.order.paymentStatus.refunded}</option>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.order.empty.title}</h3>
              <p className="text-gray-600 mb-6">{t.order.empty.description}</p>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                {t.order.empty.shopNow}
              </button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;
                  const paymentMethodConfig = getPaymentMethodConfig(order.paymentMethod);
                  const PaymentIcon = paymentMethodConfig.icon;

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
                                className={`w-5 h-5 ${statusConfig.color}`}
                              />
                              <span
                                className={`font-semibold ${statusConfig.color}`}
                              >
                                {t.order.status[order.status as keyof typeof t.order.status] || order.status}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="mb-3">
                            <p className="text-gray-600 text-sm mb-2">{order.items.length} {t.order.order.products}</p>
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
                                  +{order.items.length - 3} {t.order.order.moreProducts}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <PaymentIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                {t.order.paymentMethod[order.paymentMethod as keyof typeof t.order.paymentMethod] || order.paymentMethod}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${getPaymentStatusConfig(order.paymentStatus).color}`}
                              >
                                {t.order.paymentStatus[order.paymentStatus as keyof typeof t.order.paymentStatus] || order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Total & Action */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-gray-600 text-sm mb-1">{t.order.order.total}</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.ghnOrderCode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTrackingModal({
                                    isOpen: true,
                                    orderId: order._id,
                                    orderNumber: order.orderNumber,
                                  });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
                              >
                                <Truck className="w-4 h-4" />
                                Theo dõi
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/order/${order._id}`);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                            >
                              {t.order.order.viewDetails}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
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
                    {t.order.pagination.previous}
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    {t.order.pagination.page} {page} {t.order.pagination.of} {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                  >
                    {t.order.pagination.next}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </ProfileLayout>
      </Layout>

      <TrackingModal
        isOpen={trackingModal.isOpen}
        onClose={() =>
          setTrackingModal({ isOpen: false, orderId: "", orderNumber: "" })
        }
        orderId={trackingModal.orderId}
        orderNumber={trackingModal.orderNumber}
      />
    </>
  );
}
