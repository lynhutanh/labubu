import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search, Award, Gift, Package, Truck, CheckCircle, Clock, Image as ImageIcon,
} from "lucide-react";
import { spinService, SpinResultResponse } from "../../../src/services/spin.service";
import { storage } from "../../../src/utils/storage";
import AdminLayout from "../../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

const DELIVERY_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chưa gửi", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  shipped: { label: "Đã gửi", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Truck },
  delivered: { label: "Đã nhận", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  prize: { label: "Trúng thưởng", color: "text-yellow-400" },
  lose: { label: "May mắn lần sau", color: "text-gray-400" },
};

export default function SpinResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<SpinResultResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) { router.push("/login"); return; }
  }, [router]);

  useEffect(() => {
    if (mounted) loadResults();
  }, [mounted, page, typeFilter, deliveryFilter]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await spinService.searchResults({
        keyword: searchTerm || undefined,
        type: typeFilter || undefined,
        deliveryStatus: deliveryFilter || undefined,
        page,
        limit,
      });
      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Không thể tải kết quả");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (page === 1) loadResults();
    else setPage(1);
  };

  const handleUpdateDelivery = async (id: string, deliveryStatus: string) => {
    try {
      await spinService.updateDeliveryStatus(id, deliveryStatus);
      toast.success("Cập nhật thành công");
      loadResults();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("vi-VN");

  if (!mounted) return null;

  return (
    <AdminLayout>
      <Head><title>Kết quả vòng quay - Labubu Admin</title></Head>
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Kết quả vòng quay
            </h1>
            <a href="/spin" className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
              ← Cấu hình
            </a>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Tìm tên, SĐT, email..."
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-900">Tất cả kết quả</option>
              <option value="prize" className="bg-gray-900">Trúng thưởng</option>
              <option value="lose" className="bg-gray-900">May mắn lần sau</option>
            </select>
            <select
              value={deliveryFilter}
              onChange={e => { setDeliveryFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-900">Tất cả trạng thái gửi</option>
              <option value="pending" className="bg-gray-900">Chưa gửi</option>
              <option value="shipped" className="bg-gray-900">Đã gửi</option>
              <option value="delivered" className="bg-gray-900">Đã nhận</option>
            </select>
            <button onClick={handleSearch} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
              Tìm kiếm
            </button>
          </div>

          {/* Results Table */}
          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Đang tải...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <Award className="w-16 h-16 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chưa có kết quả nào</p>
            </div>
          ) : (
            <div className="galaxy-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-purple-400 border-b border-purple-500/30 bg-white/5">
                      <th className="text-left py-3 px-4">Thời gian</th>
                      <th className="text-left py-3 px-4">SĐT quay</th>
                      <th className="text-left py-3 px-4">Kết quả</th>
                      <th className="text-left py-3 px-4">Hình</th>
                      <th className="text-left py-3 px-4">Loại</th>
                      <th className="text-left py-3 px-4">Thông tin nhận</th>
                      <th className="text-left py-3 px-4">Trạng thái gửi</th>
                      <th className="text-center py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => {
                      const deliveryInfo = DELIVERY_LABELS[result.deliveryStatus] || DELIVERY_LABELS.pending;
                      const DeliveryIcon = deliveryInfo.icon;
                      const typeInfo = TYPE_LABELS[result.type] || TYPE_LABELS.lose;

                      return (
                        <tr key={result._id} className="border-b border-purple-500/10 text-purple-200 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-xs">{formatDate(result.createdAt)}</td>
                          <td className="py-3 px-4 font-mono">{result.buyerPhone}</td>
                          <td className="py-3 px-4 text-white font-medium">{result.slotLabel}</td>
                          <td className="py-3 px-4">
                            {result.slotImage ? (
                              <img src={result.slotImage} alt="" className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-purple-500" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={typeInfo.color}>{typeInfo.label}</span>
                          </td>
                          <td className="py-3 px-4">
                            {result.fullName ? (
                              <div className="text-xs space-y-0.5">
                                <p className="text-white">{result.fullName}</p>
                                <p>{result.phone}</p>
                                <p>{result.email}</p>
                                <p className="text-purple-400">{result.address}</p>
                              </div>
                            ) : (
                              <span className="text-purple-500 text-xs italic">Chưa nhập</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${deliveryInfo.color}`}>
                              <DeliveryIcon className="w-3 h-3" /> {deliveryInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {result.type === "prize" && (
                              <div className="flex justify-center gap-1">
                                {result.deliveryStatus !== "shipped" && (
                                  <button
                                    onClick={() => handleUpdateDelivery(result._id, "shipped")}
                                    className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30 transition-all"
                                    title="Đánh dấu đã gửi"
                                  >
                                    <Truck className="w-3 h-3" />
                                  </button>
                                )}
                                {result.deliveryStatus !== "delivered" && (
                                  <button
                                    onClick={() => handleUpdateDelivery(result._id, "delivered")}
                                    className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-all"
                                    title="Đánh dấu đã nhận"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg disabled:opacity-40 hover:bg-white/20 transition-all text-sm"
              >
                Trước
              </button>
              <span className="text-purple-300 text-sm">Trang {page}/{totalPages} ({total} kết quả)</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg disabled:opacity-40 hover:bg-white/20 transition-all text-sm"
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
