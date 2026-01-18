import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  ShoppingBag,
  Eye,
  Filter,
  Package,
  Printer,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { orderService } from "../../src/services";
import { ghnService } from "../../src/services/ghn.service";
import { OrderResponse } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import DataTable, { Column } from "../../src/components/common/DataTable";
import toast from "react-hot-toast";

const STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Người bán đang chuẩn bị hàng" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "delivered", label: "Đã giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    limit: number;
    offset: number;
    q?: string;
    status?: string;
  }>({
    limit: 20,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push("/login");
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
      const params: any = { ...searchParams };
      if (keyword) {
        params.q = keyword;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await orderService.search(params);
      setOrders(response?.data || []);
      setTotal(response?.total || 0);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error(
        `Không thể tải danh sách đơn hàng: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`,
      );
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams({ ...searchParams, offset: 0, q: keyword });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setSearchParams({
      ...searchParams,
      offset: 0,
      status: status || undefined,
    });
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "processing":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "shipping":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "delivered":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Đơn hàng - Labubu Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="px-6 py-4">
            <h1
              className="text-2xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Đơn hàng
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Filters */}
          <div className="galaxy-card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-300" />
              <h2 className="text-lg font-semibold text-white">Bộ lọc</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white backdrop-blur-sm"
                >
                  {STATUSES.map((status) => (
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
                key: "index",
                label: "STT",
                render: (_, index) => (
                  <span className="text-white">
                    {(searchParams.offset || 0) + index + 1}
                  </span>
                ),
              },
              {
                key: "orderNumber",
                label: "Mã đơn hàng",
                render: (order) => (
                  <span className="text-white font-mono font-semibold">
                    {order.orderNumber || order._id}
                  </span>
                ),
              },
              {
                key: "items",
                label: "Sản phẩm",
                render: (order) => {
                  const firstItem = order.items?.[0];
                  if (!firstItem) {
                    return (
                      <span className="text-xs text-purple-300">
                        Không có sản phẩm
                      </span>
                    );
                  }

                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                        {firstItem.coverImage ? (
                          <img
                            src={firstItem.coverImage}
                            alt={firstItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-purple-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {firstItem.name}
                        </div>
                        {order.items.length > 1 && (
                          <div className="text-xs text-purple-300">
                            +{order.items.length - 1} sản phẩm khác
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "customer",
                label: "Khách hàng",
                render: (order) => (
                  <div>
                    <div className="text-sm font-medium text-white">
                      {order.user?.name || order.user?.username || "Khách"}
                    </div>
                    {order.user?.email && (
                      <div className="text-xs text-purple-300">
                        {order.user.email}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "total",
                label: "Tổng tiền",
                render: (order) => (
                  <span
                    className="text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {formatPrice(order.total)}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (order) => (
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {STATUSES.find((s) => s.value === order.status)?.label ||
                      order.status}
                  </span>
                ),
              },
              {
                key: "createdAt",
                label: "Ngày tạo",
                render: (order) => (
                  <span className="text-sm text-purple-300">
                    {formatDate(order.createdAt)}
                  </span>
                ),
              },
              {
                key: "printBill",
                label: "In bill",
                align: "center",
                render: (order) => {
                  if (!order.ghnOrderCode) {
                    return (
                      <span className="text-xs text-purple-300">
                        Chưa tạo GHN
                      </span>
                    );
                  }

                  const handlePrintBill = async () => {
                    try {
                      const toastId = `print-bill-${order._id}`;
                      toast.loading("Đang tạo bill...", { id: toastId });

                      const response = await ghnService.getPrintUrlByGhnCode(
                        order.ghnOrderCode,
                      );

                      if (response?.printUrl) {
                        window.open(response.printUrl, "_blank");
                        toast.success("Đã mở bill để in", { id: toastId });
                      } else {
                        toast.error("Không thể tạo bill", { id: toastId });
                      }
                    } catch (error: any) {
                      console.error("Error printing bill:", error);
                      const errorMessage =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Không thể in bill";

                      if (
                        errorMessage.includes("chưa được tạo trên GHN") ||
                        errorMessage.includes("không tồn tại")
                      ) {
                        toast.error(
                          "Đơn hàng chưa được tạo trên GHN. Vui lòng tạo đơn GHN trước khi in bill.",
                          { duration: 5000 },
                        );
                      } else {
                        toast.error(errorMessage);
                      }
                    }
                  };

                  return (
                    <button
                      onClick={handlePrintBill}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="In bill GHN (chỉ áp dụng cho đơn hàng đã tạo trên GHN)"
                    >
                      <Printer className="w-4 h-4" />
                      In bill
                    </button>
                  );
                },
              },
              {
                key: "actions",
                label: "Thao tác",
                align: "right",
                render: (order) => {
                  const handleConfirm = async () => {
                    try {
                      const toastId = `confirm-order-${order._id}`;
                      toast.loading("Đang xác nhận đơn và tạo GHN...", {
                        id: toastId,
                      });
                      await orderService.confirmAndCreateGhn(order._id);
                      await loadOrders();
                      toast.success("Đã xác nhận đơn và tạo GHN thành công", {
                        id: toastId,
                      });
                    } catch (error: any) {
                      console.error("Error confirming order:", error);
                      const message =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Không thể xác nhận đơn hàng";
                      toast.error(message);
                    }
                  };

                  return (
                    <div className="flex items-center justify-end gap-2">
                      {order.status === "pending" && (
                        <button
                          onClick={handleConfirm}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-all text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Xác nhận
                        </button>
                      )}
                      {order.ghnOrderCode && (
                        <button
                          onClick={() => {
                            window.open("https://5sao.ghn.dev/", "_blank");
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-all text-sm"
                          title="Xem đơn hàng trên GHN"
                        >
                          <ExternalLink className="w-4 h-4" />
                          GHN
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                    </div>
                  );
                },
              },
            ]}
            data={orders}
            loading={loading}
            emptyMessage="Chưa có đơn hàng nào"
            emptyIcon={
              <ShoppingBag className="w-16 h-16 text-purple-400 mx-auto" />
            }
            keyExtractor={(order) => order._id}
          />

          {/* Pagination */}
          {total > (searchParams.limit || 20) && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-purple-200">
                Hiển thị {(searchParams.offset || 0) + 1} đến{" "}
                {Math.min(
                  (searchParams.offset || 0) + (searchParams.limit || 20),
                  total,
                )}{" "}
                trong tổng số {total} đơn hàng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSearchParams({
                      ...searchParams,
                      offset: Math.max(
                        0,
                        (searchParams.offset || 0) - (searchParams.limit || 20),
                      ),
                    })
                  }
                  disabled={(searchParams.offset || 0) === 0}
                  className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-white"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-purple-200">
                  Trang{" "}
                  {Math.floor(
                    (searchParams.offset || 0) / (searchParams.limit || 20),
                  ) + 1}{" "}
                  / {Math.ceil(total / (searchParams.limit || 20))}
                </span>
                <button
                  onClick={() =>
                    setSearchParams({
                      ...searchParams,
                      offset:
                        (searchParams.offset || 0) + (searchParams.limit || 20),
                    })
                  }
                  disabled={
                    (searchParams.offset || 0) + (searchParams.limit || 20) >=
                    total
                  }
                  className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-white"
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
