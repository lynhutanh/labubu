import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus, Trash2, Search, Tag, Edit, ToggleLeft, ToggleRight,
  Percent, DollarSign, Truck, Calendar, Users, Copy, CheckCircle,
}from "lucide-react";
import { voucherService, VoucherResponse } from "../../src/services/voucher.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  percentage: { label: "Phần trăm", icon: Percent, color: "text-yellow-400" },
  fixed: { label: "Cố định", icon: DollarSign, color: "text-green-400" },
  shipping: { label: "Miễn ship", icon: Truck, color: "text-blue-400" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  inactive: { label: "Tắt", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  expired: { label: "Hết hạn", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ totalVouchers: 0, activeVouchers: 0, expiredVouchers: 0, inactiveVouchers: 0 });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const limit = 12;

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) { router.push("/login"); return; }
    loadStats();
  }, [router]);

  useEffect(() => {
    if (mounted) loadVouchers();
  }, [mounted, page, statusFilter, typeFilter]);

  const loadStats = async () => {
    try {
      const data = await voucherService.getStats();
      setStats(data);
    } catch {}
  };

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherService.search({
        keyword: searchTerm || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit,
      });
      setVouchers(data.vouchers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      toast.error("Không thể tải danh sách voucher");
    }finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadVouchers();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa voucher "${code}"?`)) return;
    try {
      await voucherService.delete(id);
      toast.success("Đã xóa voucher");
      loadVouchers();
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Xóa thất bại");
    }
  };

  const handleToggleStatus = async (voucher: VoucherResponse) => {
    const newStatus = voucher.status === "active" ? "inactive" : "active";
    try {
      await voucherService.update(voucher._id, { status: newStatus });
      toast.success(`Voucher đã ${newStatus === "active" ? "bật" : "tắt"}`);
      loadVouchers();
      loadStats();
    }catch (error: any) {
      toast.error("Cập nhật thất bại");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatValue = (voucher: VoucherResponse) => {
    if (voucher.type === "percentage") return `${voucher.value}%`;
    return `${voucher.value.toLocaleString("vi-VN")}đ`;
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  if (!mounted) return null;

  return (
    <AdminLayout>
      <Head><title>Voucher - Labubu Admin</title></Head>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Quản lý Voucher
            </h1>
            <a href="/vouchers/create" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all" style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}>
              <Plus className="w-5 h-5" /> Tạo voucher
            </a>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tổng voucher", value: stats.totalVouchers, color: "from-purple-500 to-indigo-600" },
              { label: "Đang hoạt động", value: stats.activeVouchers, color: "from-green-500 to-emerald-600" },
              { label: "Đã tắt", value: stats.inactiveVouchers, color: "from-gray-500 to-slate-600" },
              { label: "Hết hạn", value: stats.expiredVouchers, color: "from-red-500 to-pink-600" },
            ].map((s) => (
              <div key={s.label} className="galaxy-card rounded-xl p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`} style={{ boxShadow: "0 0 15px rgba(168,85,247,0.3)" }}>
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-purple-300">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm mã hoặc tên voucher..."
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-900">Tất cả trạng thái</option>
              <option value="active" className="bg-gray-900">Hoạt động</option>
              <option value="inactive" className="bg-gray-900">Tắt</option>
              <option value="expired" className="bg-gray-900">Hết hạn</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-900">Tất cả loại</option>
              <option value="percentage" className="bg-gray-900">Phần trăm</option>
              <option value="fixed" className="bg-gray-900">Cố định</option>
              <option value="shipping" className="bg-gray-900">Miễn ship</option>
            </select>
            <button onClick={handleSearch} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
              Tìm kiếm
            </button>
          </div>

          {/* Voucher Grid */}
          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Đang tải...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <Tag className="w-16 h-16 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chưa có voucher nào</p>
              <a href="/vouchers/create" className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
                Tạo voucher đầu tiên
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vouchers.map((voucher) => {
                const typeInfo = TYPE_LABELS[voucher.type] || TYPE_LABELS.fixed;
                const TypeIcon = typeInfo.icon;
                const statusInfo = STATUS_LABELS[isExpired(voucher.endDate) ? "expired" : voucher.status] || STATUS_LABELS.inactive;
                const remaining = voucher.totalQuantity - voucher.usedQuantity;
                const usagePercent = Math.round((voucher.usedQuantity / voucher.totalQuantity) * 100);

                return (
                  <div key={voucher._id} className="galaxy-card rounded-xl p-5 flex flex-col gap-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center" style={{ boxShadow: "0 0 15px rgba(236,72,153,0.3)" }}>
                          <TypeIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{voucher.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-yellow-400">{formatValue(voucher)}</span>
                    </div>

                    {/* Code */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                      <code className="text-purple-200 font-mono text-sm flex-1">{voucher.code}</code>
                      <button onClick={() => copyCode(voucher.code)} className="text-purple-400 hover:text-white transition-colors">
                        {copiedCode === voucher.code ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-purple-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Còn {remaining}/{voucher.totalQuantity} lượt</span>
                      </div>
                    </div>

                    {/* Usage bar */}
                    <div>
                      <div className="flex justify-between text-xs text-purple-400 mb-1">
                        <span>Đã dùng</span>
                        <span>{usagePercent}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Min order */}
                    {voucher.minOrderAmount > 0 && (
                      <p className="text-xs text-purple-400">Đơn tối thiểu: {voucher.minOrderAmount.toLocaleString("vi-VN")}đ</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => router.push(`/vouchers/update/${voucher._id}`)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all"
                      >
                        <Edit className="w-3 h-3" /> Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(voucher)}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          voucher.status === "active"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                        }`}
                      >
                        {voucher.status === "active" ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                        {voucher.status === "active" ? "Tắt" : "Bật"}
                      </button>
                      <button
                        onClick={() => handleDelete(voucher._id, voucher.code)}
                        className="flex items-center justify-center px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg disabled:opacity-40 hover:bg-white/20 transition-all text-sm"
              >
                Trước
              </button>
              <span className="text-purple-300 text-sm">Trang {page}/{totalPages} ({total} voucher)</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
