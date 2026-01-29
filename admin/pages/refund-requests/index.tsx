import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  Package,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { refundRequestService, RefundRequest } from "../../src/services/refund-request.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "approved", label: "Đã chấp nhận" },
  { value: "rejected", label: "Đã từ chối" },
];

export default function RefundRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<{
    isOpen: boolean;
    requestId: string;
    action: "approve" | "reject";
  }>({
    isOpen: false,
    requestId: "",
    action: "approve",
  });
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    loadRequests();
  }, [router]);

  useEffect(() => {
    if (mounted) {
      loadRequests();
    }
  }, [page, statusFilter, mounted]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await refundRequestService.getRefundRequests({
        status: statusFilter || undefined,
        page,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      console.log("Refund requests response:", response);
      console.log("Requests data:", response?.data);
      console.log("Requests count:", response?.data?.length);
      const requestsData = Array.isArray(response?.data) ? response.data : [];
      setRequests(requestsData);
      setTotal(response?.total || 0);
      setTotalPages(response?.totalPages || 1);
      console.log("Set requests:", requestsData);
    } catch (error: any) {
      console.error("Error loading refund requests:", error);
      toast.error(
        `Không thể tải danh sách yêu cầu hoàn tiền: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`,
      );
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!showModal.requestId) return;

    try {
      setProcessingId(showModal.requestId);
      await refundRequestService.approveRefundRequest(showModal.requestId, {
        adminNote: adminNote || undefined,
      });
      toast.success("Đã xác nhận hoàn tiền thành công!");
      setShowModal({ isOpen: false, requestId: "", action: "approve" });
      setAdminNote("");
      await loadRequests();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể xác nhận hoàn tiền",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!showModal.requestId) return;

    try {
      setProcessingId(showModal.requestId);
      await refundRequestService.rejectRefundRequest(showModal.requestId, {
        adminNote: adminNote || undefined,
      });
      toast.success("Đã từ chối yêu cầu hoàn tiền!");
      setShowModal({ isOpen: false, requestId: "", action: "reject" });
      setAdminNote("");
      await loadRequests();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể từ chối yêu cầu",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
      pending: {
        label: "Chờ xử lý",
        color: "text-yellow-300",
        icon: Clock,
        bgColor: "bg-yellow-500/20 border-yellow-500/30",
      },
      approved: {
        label: "Đã chấp nhận",
        color: "text-green-300",
        icon: CheckCircle2,
        bgColor: "bg-green-500/20 border-green-500/30",
      },
      rejected: {
        label: "Đã từ chối",
        color: "text-red-300",
        icon: XCircle,
        bgColor: "bg-red-500/20 border-red-500/30",
      },
    };
    return configs[status] || configs.pending;
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Yêu cầu hoàn tiền | Labubu Admin</title>
      </Head>
      <AdminLayout>
        <div className="flex-1 overflow-y-auto">
          <header
            className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
            style={{
              background: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="px-6 py-4">
              <h1
                className="text-2xl font-bold flex items-center gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <RotateCcw className="w-6 h-6" />
                Yêu cầu hoàn tiền
              </h1>
            </div>
          </header>

          <main className="p-6">
            <div className="galaxy-card rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-purple-300" />
                <h2 className="text-lg font-semibold text-white">Bộ lọc</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setStatusFilter(status.value);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                      statusFilter === status.value
                        ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white border-pink-400/50"
                        : "bg-white/10 text-purple-300 border-purple-500/30 hover:bg-white/20"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="galaxy-card rounded-xl p-12 text-center">
                <RotateCcw className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                <p className="text-purple-300 text-lg">Không có yêu cầu hoàn tiền nào</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {requests.map((request) => {
                    const statusConfig = getStatusConfig(request.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={request._id}
                        className="galaxy-card rounded-xl p-6 hover:shadow-lg transition-all border border-purple-500/30"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-white">
                                Đơn hàng #{request.orderNumber}
                              </h3>
                              <div
                                className={`px-3 py-1 rounded-lg flex items-center gap-2 border ${statusConfig.bgColor}`}
                              >
                                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                <span className={`text-sm font-medium ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200 mb-3">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-purple-300" />
                                <span className="font-semibold text-white">
                                  Số tiền: {formatCurrency(request.amount)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-300" />
                                <span className="text-purple-200">
                                  Ngày tạo: {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                            {request.reason && (
                              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-purple-500/20">
                                <p className="text-sm text-purple-200">
                                  <span className="font-semibold text-white">Lý do:</span> {request.reason}
                                </p>
                              </div>
                            )}
                            {request.adminNote && (
                              <div className="mt-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                <p className="text-sm text-blue-200">
                                  <span className="font-semibold text-blue-100">Ghi chú admin:</span>{" "}
                                  {request.adminNote}
                                </p>
                              </div>
                            )}
                            {request.processedAt && (
                              <div className="mt-2 text-xs text-purple-400">
                                Xử lý lúc: {formatDate(request.processedAt)}
                              </div>
                            )}
                          </div>
                          {request.status === "pending" && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() =>
                                  setShowModal({
                                    isOpen: true,
                                    requestId: request._id,
                                    action: "approve",
                                  })
                                }
                                disabled={processingId === request._id}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Chấp nhận
                              </button>
                              <button
                                onClick={() =>
                                  setShowModal({
                                    isOpen: true,
                                    requestId: request._id,
                                    action: "reject",
                                  })
                                }
                                disabled={processingId === request._id}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                              >
                                <XCircle className="w-4 h-4" />
                                Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-purple-300">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {showModal.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="galaxy-card rounded-xl shadow-2xl max-w-md w-full p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">
                {showModal.action === "approve"
                  ? "Xác nhận hoàn tiền"
                  : "Từ chối yêu cầu hoàn tiền"}
              </h3>
              <p className="text-purple-200 mb-4">
                {showModal.action === "approve"
                  ? "Bạn có chắc chắn muốn chấp nhận và hoàn tiền cho yêu cầu này?"
                  : "Bạn có chắc chắn muốn từ chối yêu cầu hoàn tiền này?"}
              </p>
              <div className="mb-4">
                <label className="block text-purple-200 mb-2 text-sm font-medium">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Nhập ghi chú..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal({ isOpen: false, requestId: "", action: "approve" });
                    setAdminNote("");
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 border border-purple-500/30 text-purple-300 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={
                    showModal.action === "approve" ? handleApprove : handleReject
                  }
                  disabled={processingId === showModal.requestId}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    showModal.action === "approve"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                  }`}
                >
                  {processingId === showModal.requestId
                    ? "Đang xử lý..."
                    : showModal.action === "approve"
                      ? "Xác nhận"
                      : "Từ chối"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
