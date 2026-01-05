import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save } from 'lucide-react';
import { orderService } from '../../src/services';
import { OrderResponse } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'delivered', label: 'Đã giao hàng' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thanh toán thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (mounted && id) {
      loadOrder();
    }
  }, [mounted, id]);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
    }
  }, [order]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(id as string);
      setOrder(data);
    } catch (error: any) {
      toast.error(`Không thể tải chi tiết đơn hàng: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      if (status !== order.status) {
        await orderService.updateStatus(order._id, status);
      }
      if (paymentStatus !== order.paymentStatus) {
        await orderService.updatePaymentStatus(order._id, paymentStatus);
      }
      toast.success('Cập nhật đơn hàng thành công!');
      await loadOrder();
    } catch (error: any) {
      toast.error(`Cập nhật thất bại: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`);
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Chi tiết đơn hàng - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng {order.orderNumber}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Tạo lúc: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin đơn hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || (status === order.status && paymentStatus === order.paymentStatus)}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sản phẩm ({order.totalItems})
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.salePrice || item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tổng: {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Địa chỉ giao hàng
            </h2>

            <div className="space-y-2">
              <p className="text-gray-900">
                <span className="font-medium">Người nhận:</span> {order.shippingAddress.fullName}
              </p>
              <p className="text-gray-900">
                <span className="font-medium">Số điện thoại:</span> {order.shippingAddress.phone}
              </p>
              <p className="text-gray-900">
                <span className="font-medium">Địa chỉ:</span>{' '}
                {order.shippingAddress.address}
                {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
              </p>
              {order.shippingAddress.note && (
                <p className="text-gray-900">
                  <span className="font-medium">Ghi chú:</span> {order.shippingAddress.note}
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tổng kết đơn hàng
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-gray-900">{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-red-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-lg font-semibold text-pink-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin thanh toán
            </h2>

            <div className="space-y-2">
              <p className="text-gray-900">
                <span className="font-medium">Phương thức:</span> {order.paymentMethod}
              </p>
              <p className="text-gray-900">
                <span className="font-medium">Trạng thái:</span>{' '}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {PAYMENT_STATUSES.find(s => s.value === order.paymentStatus)?.label || order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}






