import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Package,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  User,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  FileText,
  Copy,
  QrCode,
} from "lucide-react";
import Layout from "../../../src/components/layout/Layout";
import ProfileLayout from "../../../src/components/profile/ProfileLayout";
import { orderService, Order } from "../../../src/services/order.service";
import { storage } from "../../../src/utils/storage";
import toast from "react-hot-toast";
import { formatCurrency } from "../../../src/lib/string";

const statusConfig: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  pending: {
    label: "Chờ xử lý",
    color: "text-yellow-400",
    icon: Clock,
    bgColor: "bg-yellow-400/20",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-400",
    icon: CheckCircle2,
    bgColor: "bg-blue-400/20",
  },
  processing: {
    label: "Người bán đang chuẩn bị hàng",
    color: "text-purple-400",
    icon: Package,
    bgColor: "bg-purple-400/20",
  },
  shipping: {
    label: "Đang giao hàng",
    color: "text-indigo-400",
    icon: Truck,
    bgColor: "bg-indigo-400/20",
  },
  delivered: {
    label: "Đã giao",
    color: "text-green-400",
    icon: CheckCircle2,
    bgColor: "bg-green-400/20",
  },
  completed: {
    label: "Hoàn thành",
    color: "text-green-500",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-400",
    icon: XCircle,
    bgColor: "bg-red-400/20",
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "text-gray-400",
    icon: XCircle,
    bgColor: "bg-gray-400/20",
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: "Chờ thanh toán",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
  },
  paid: {
    label: "Đã thanh toán",
    color: "text-green-400",
    bgColor: "bg-green-400/20",
  },
  failed: {
    label: "Thanh toán thất bại",
    color: "text-red-400",
    bgColor: "bg-red-400/20",
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "text-gray-400",
    bgColor: "bg-gray-400/20",
  },
};

const paymentMethodConfig: Record<string, { label: string; icon: any }> = {
  cod: { label: "Thanh toán khi nhận hàng", icon: Package },
  sepay: { label: "Chuyển khoản ngân hàng", icon: CreditCard },
  wallet: { label: "Ví", icon: DollarSign },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem đơn hàng");
      router.push("/login");
      return;
    }

    if (id) {
      loadOrder();
    }
  }, [id, router]);

  const loadOrder = async () => {
    if (!id || typeof id !== "string") return;

    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (error: any) {
      console.error("Failed to load order:", error);
      toast.error("Không thể tải thông tin đơn hàng");
      router.push("/profile/order");
    } finally {
      setLoading(false);
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  if (loading) {
    return (
      <Layout>
        <ProfileLayout>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 animate-pulse mb-4" />
              <p className="text-gray-600 text-lg">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </ProfileLayout>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <ProfileLayout>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <p className="text-gray-900 text-lg mb-4">Không tìm thấy đơn hàng</p>
              <button
                onClick={() => router.push("/profile/order")}
                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Quay lại danh sách đơn hàng
              </button>
            </div>
          </div>
        </ProfileLayout>
      </Layout>
    );
  }

  const StatusConfig = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = StatusConfig.icon;
  const PaymentStatusConfig = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
  const PaymentMethod = paymentMethodConfig[order.paymentMethod] || {
    label: order.paymentMethod,
    icon: CreditCard,
  };
  const PaymentIcon = PaymentMethod.icon;

  return (
    <>
      <Head>
        <title>Chi tiết đơn hàng {order.orderNumber} | Labubu</title>
      </Head>
      <Layout>
        <ProfileLayout>
          <div className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/profile/order")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Package className="w-8 h-8" />
                    Đơn hàng {order.orderNumber}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Đặt ngày {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${StatusConfig.bgColor}`}
                >
                  <StatusIcon className={`w-5 h-5 ${StatusConfig.color}`} />
                  <span className={`font-semibold ${StatusConfig.color}`}>
                    {StatusConfig.label}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${PaymentStatusConfig.bgColor}`}
                >
                  <span className={`font-semibold text-sm ${PaymentStatusConfig.color}`}>
                    {PaymentStatusConfig.label}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Sản phẩm
                  </h2>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                if (target.parentElement) {
                                  target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500"><svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                              <Package className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-gray-900 font-semibold mb-1">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            Số lượng: {item.quantity}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.salePrice ? (
                              <>
                                <span className="text-gray-400 line-through text-sm">
                                  {formatCurrency(item.price)}
                                </span>
                                <span className="text-orange-500 font-semibold">
                                  {formatCurrency(item.salePrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-900 font-semibold">
                                {formatCurrency(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 font-bold text-lg">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    Địa chỉ giao hàng
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-gray-500 text-sm">Họ và tên</p>
                        <p className="text-gray-900 font-semibold">
                          {order.shippingAddress.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-gray-500 text-sm">Số điện thoại</p>
                        <p className="text-gray-900 font-semibold">
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-gray-500 text-sm">Địa chỉ</p>
                        <p className="text-gray-900">
                          {order.shippingAddress.address}
                          {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                          {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                          {`, ${order.shippingAddress.city}`}
                        </p>
                      </div>
                    </div>
                    {order.shippingAddress.note && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-500 mt-1" />
                        <div>
                          <p className="text-gray-500 text-sm">Ghi chú</p>
                          <p className="text-gray-900">{order.shippingAddress.note}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảm giá</span>
                        <span className="text-orange-500 font-semibold">
                          -{formatCurrency(order.discount)}
                        </span>
                      </div>
                    )}
                    {order.shippingFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí vận chuyển</span>
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(order.shippingFee)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold text-lg">Tổng cộng</span>
                        <span className="text-orange-500 font-bold text-2xl">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <PaymentIcon className="w-5 h-5" />
                    Thanh toán
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Phương thức</p>
                      <p className="text-gray-900 font-semibold">{PaymentMethod.label}</p>
                    </div>
                    {order.paymentRef && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">Nội dung chuyển khoản</p>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <code className="text-gray-900 font-mono text-sm flex-1">
                            {order.paymentRef}
                          </code>
                          <button
                            onClick={() => copyToClipboard(order.paymentRef!)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Sao chép"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </ProfileLayout>
      </Layout>
    </>
  );
}
