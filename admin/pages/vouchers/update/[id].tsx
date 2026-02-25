import Head from "next/head";
import { useState, useEffect }from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Tag, RefreshCw }from "lucide-react";
import { voucherService, VoucherResponse, UpdateVoucherPayload } from "../../../src/services/voucher.service";
import { storage } from "../../../src/utils/storage";
import AdminLayout from "../../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

const toDateStr = (d: string | Date) => {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
};

export default function UpdateVoucherPage() {
  const router = useRouter();
  const { id }= router.query;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<any>({
    code: "", name: "", description: "", type: "percentage",
    value: 10, minOrderAmount: 0, maxDiscountAmount: 100000,
    totalQuantity: 100, startDateStr: "", endDateStr: "",
    maxUsesPerUser: 1, status: "active",
  });

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) router.push("/login");
  }, [router]);

  useEffect(() => {
    if (mounted && id) loadVoucher();
  }, [mounted, id]);

  const loadVoucher = async () => {
    try {
      setFetching(true);
      const data = await voucherService.getById(id as string);
      setForm({
        code: data.code,
        name: data.name,
        description: data.description || "",
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        totalQuantity: data.totalQuantity,
        startDateStr: toDateStr(data.startDate),
        endDateStr: toDateStr(data.endDate),
        maxUsesPerUser: data.maxUsesPerUser,
        status: data.status,
      });
    }catch {
      toast.error("Không thể tải thông tin voucher");
      router.push("/vouchers");
    } finally {
      setFetching(false);
    }
  };

  const set = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên voucher");
    if (form.value <= 0) return toast.error("Giá trị giảm phải lớn hơn 0");
    if (form.type === "percentage" && form.value > 100) return toast.error("Phần trăm không được vượt quá 100%");
    if (new Date(form.startDateStr) >= new Date(form.endDateStr)) return toast.error("Ngày bắt đầu phải trước ngày kết thúc");

    try {
      setLoading(true);
      const payload: UpdateVoucherPayload = {
        code: form.code,
        name: form.name,
        description: form.description,
        type: form.type,
        value: form.value,
        minOrderAmount: form.minOrderAmount,
        maxDiscountAmount: form.maxDiscountAmount,
        totalQuantity: form.totalQuantity,
        startDate: form.startDateStr,
        endDate: form.endDateStr,
        maxUsesPerUser: form.maxUsesPerUser,
        status: form.status,
      };
      await voucherService.update(id as string, payload);
      toast.success("Cập nhật voucher thành công!");
      router.push("/vouchers");
    }catch (error: any) {
      toast.error(error?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <AdminLayout>
      <Head><title>Cập nhật Voucher - Labubu Admin</title></Head>
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center gap-4">
            <button onClick={() => router.back()}className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Cập nhật Voucher
            </h1>
          </div>
        </header>

        <main className="p-6 max-w-2xl mx-auto">
          {fetching ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Đang tải...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="galaxy-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-pink-400" /> Thông tin cơ bản
                </h2>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Mã voucher *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Tên voucher *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active" className="bg-gray-900">Hoạt động</option>
                    <option value="inactive" className="bg-gray-900">Tắt</option>
                  </select>
                </div>
              </div>

              {/* Discount Config */}
              <div className="galaxy-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Cấu hình giảm giá</h2>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Loại giảm giá *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "percentage", label: "Phần trăm (%)" },
                      { value: "fixed", label: "Số tiền cố định" },
                      { value: "shipping", label: "Miễn phí ship" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set("type", t.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.type === t.value
                            ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400/50 text-white"
                            : "bg-white/5 border-purple-500/30 text-purple-300 hover:bg-white/10"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">
                      Giá trị giảm {form.type === "percentage" ? "(%)" : "(đ)"} *
                    </label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) => set("value", Number(e.target.value))}
                      min={0}
                      max={form.type === "percentage" ? 100 : undefined}
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">Giảm tối đa (đ)</label>
                    <input
                      type="number"
                      value={form.maxDiscountAmount}
                      onChange={(e) => set("maxDiscountAmount", Number(e.target.value))}
                      min={0}
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Đơn hàng tối thiểu (đ)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => set("minOrderAmount", Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Quantity & Dates */}
              <div className="galaxy-card rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Số lượng & Thời hạn</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">Tổng số lượt *</label>
                    <input
                      type="number"
                      value={form.totalQuantity}
                      onChange={(e) => set("totalQuantity", Number(e.target.value))}
                      min={1}
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">Mỗi người dùng tối đa</label>
                    <input
                      type="number"
                      value={form.maxUsesPerUser}
                      onChange={(e) => set("maxUsesPerUser", Number(e.target.value))}
                      min={1}
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">Ngày bắt đầu *</label>
                    <input
                      type="date"
                      value={form.startDateStr}
                      onChange={(e) => set("startDateStr", e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">Ngày kết thúc *</label>
                    <input
                      type="date"
                      value={form.endDateStr}
                      onChange={(e) => set("endDateStr", e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-white/10 border border-purple-500/30 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
