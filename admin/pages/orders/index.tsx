import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Package, Eye, Filter } from 'lucide-react';
import { orderService } from '../../src/services';
import { OrderResponse, OrderSearchParams } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import DataTable, { Column } from '../../src/components/common/DataTable';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: '', label: 'Tất cả' },
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
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thanh toán thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipping':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [router]);

  useEffect(() => {
    if (mounted) {
      loadOrders();
    }
  }, [searchParams, mounted]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams };
      if (keyword) {
        params.keyword = keyword;
      }
      const response = await orderService.search(params);
      setOrders(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toast.error(`Không thể tải danh sách đơn hàng: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams({ ...searchParams, page: 1, keyword });
  };

  const handleStatusFilter = (status: string) => {
    setSearchParams({ ...searchParams, page: 1, status: status || undefined });
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setSearchParams({ ...searchParams, page: 1, paymentStatus: paymentStatus || undefined });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
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

  return (
    <AdminLayout>
      <Head>
        <title>Đơn hàng - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Tìm kiếm theo mã đơn hàng..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={searchParams.status || ''}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <select
                  value={searchParams.paymentStatus || ''}
                  onChange={(e) => handlePaymentStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <DataTable
            columns={[
              {
                key: 'orderNumber',
                label: 'Mã đơn',
                render: (order) => (
                  <span className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </span>
                ),
              },
              {
                key: 'customer',
                label: 'Khách hàng',
                render: (order) => (
                  <div>
                    <div className="text-sm text-gray-900">
                      {order.shippingAddress.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.shippingAddress.phone}
                    </div>
                  </div>
                ),
              },
              {
                key: 'items',
                label: 'Sản phẩm',
                render: (order) => (
                  <div>
                    <div className="text-sm text-gray-900">
                      {order.totalItems} sản phẩm
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items[0]?.name || '-'}
                      {order.items.length > 1 && ` +${order.items.length - 1} sản phẩm khác`}
                    </div>
                  </div>
                ),
              },
              {
                key: 'total',
                label: 'Tổng tiền',
                render: (order) => (
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Trạng thái',
                render: (order) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                  </span>
                ),
              },
              {
                key: 'paymentStatus',
                label: 'Thanh toán',
                render: (order) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {PAYMENT_STATUSES.find(s => s.value === order.paymentStatus)?.label || order.paymentStatus}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Ngày tạo',
                render: (order) => (
                  <span className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Thao tác',
                align: 'right',
                render: (order) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/orders/${order._id}`);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
            data={orders}
            loading={loading}
            emptyMessage="Chưa có đơn hàng nào"
            emptyIcon={<Package className="w-16 h-16 text-gray-300 mx-auto" />}
            keyExtractor={(order) => order._id}
          />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Hiển thị {((searchParams.page || 1) - 1) * (searchParams.limit || 20) + 1} đến{' '}
                    {Math.min((searchParams.page || 1) * (searchParams.limit || 20), total)} trong tổng số {total} đơn hàng
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSearchParams({ ...searchParams, page: (searchParams.page || 1) - 1 })}
                      disabled={(searchParams.page || 1) === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      Trang {searchParams.page || 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setSearchParams({ ...searchParams, page: (searchParams.page || 1) + 1 })}
                      disabled={(searchParams.page || 1) >= totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
        </main>
      </div>
    </AdminLayout>
  );
}


