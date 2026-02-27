import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Trophy, Save, Key, Gift, Tag, Calendar, ChevronUp, Plus } from "lucide-react";
import { rankService, Rank } from "../../../src/services/rank.service";
import { voucherService, CreateVoucherPayload } from "../../../src/services/voucher.service";
import { storage } from "../../../src/utils/storage";
import AdminLayout from "../../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

const generateVoucherCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return "RANK_" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const today = () => new Date().toISOString().split("T")[0];
const nextYear = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
};

export default function EditRankPage() {
    const router = useRouter();
    const { id } = router.query;
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Rank Form State
    const [form, setForm] = useState<Partial<Rank>>({
        name: "",
        key: "",
        threshold: 0,
        rewardVoucherCode: "",
        order: 0,
        color: "#3b82f6",
        description: "",
    });

    // Voucher Creation State
    const [showVoucherForm, setShowVoucherForm] = useState(false);
    const [voucherForm, setVoucherForm] = useState<CreateVoucherPayload>({
        code: generateVoucherCode(),
        name: "",
        description: "",
        type: "percentage",
        value: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 50000,
        totalQuantity: 1000,
        startDate: today(),
        endDate: nextYear(),
    });

    useEffect(() => {
        setMounted(true);
        const user = storage.getUser();
        if (!user) router.push("/login");
    }, [router]);

    useEffect(() => {
        if (id && mounted) {
            loadRank();
        }
    }, [id, mounted]);

    const loadRank = async () => {
        try {
            setFetching(true);
            const response = await rankService.search();
            const rank = response.data.find((r: Rank) => r._id === id);
            if (rank) {
                setForm(rank);
                // If rank already has reward voucher, pre-fill its name 
                setVoucherForm(prev => ({ ...prev, name: `Thưởng cấp bậc ${rank.name}` }));
            } else {
                toast.error("Không tìm thấy cấp bậc");
                router.push("/memberships");
            }
        } catch (err) {
            toast.error("Lỗi khi tải dữ liệu");
        } finally {
            setFetching(false);
        }
    };

    const handleRankChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleVoucherChange = (field: keyof CreateVoucherPayload, value: any) => {
        setVoucherForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name?.trim()) return toast.error("Vui lòng nhập tên cấp bậc");
        if (!id) return;

        try {
            setLoading(true);

            let finalRewardVoucherCode = form.rewardVoucherCode;

            // 1. Create voucher if enabled
            if (showVoucherForm) {
                if (!voucherForm.name.trim()) return toast.error("Vui lòng nhập tên voucher thưởng");
                const voucher = await voucherService.create(voucherForm);
                const code = voucher?.code || (voucher as any)?.data?.code || (voucher as any)?.data?.data?.code || voucherForm.code;
                finalRewardVoucherCode = code;
                toast.success(`Đã tạo voucher thưởng: ${code}`);
            }

            // 2. Update rank
            await rankService.update(id as string, {
                ...form,
                rewardVoucherCode: finalRewardVoucherCode
            });

            toast.success("Cập nhật cấp bậc thành công!");
            router.push("/memberships");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || fetching) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-purple-300">
            Đang tải...
        </div>
    );

    return (
        <AdminLayout>
            <Head>
                <title>Chỉnh sửa Cấp Bậc - Labubu Admin</title>
            </Head>
            <div className="flex-1 overflow-y-auto">
                <header
                    className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
                    style={{ background: "rgba(0,0,0,0.3)" }}
                >
                    <div className="px-6 py-4 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-300 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1
                            className="text-2xl font-bold"
                            style={{
                                background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Chỉnh sửa Cấp Bậc
                        </h1>
                    </div>
                </header>

                <main className="p-6 max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="galaxy-card rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                                <Trophy className="w-5 h-5 text-yellow-400" /> Thông tin cấp bậc
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Tên cấp bậc *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleRankChange("name", e.target.value)}
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1 flex items-center gap-1">
                                        <Key className="w-3 h-3" /> Mã định danh (không thể sửa)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.key}
                                        disabled
                                        className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-gray-500 font-mono cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Ngưỡng chi tiêu (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={form.threshold}
                                        onChange={(e) => handleRankChange("threshold", Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        value={form.order}
                                        onChange={(e) => handleRankChange("order", Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-purple-300 mb-1">Màu sắc chủ đạo</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        value={form.color}
                                        onChange={(e) => handleRankChange("color", e.target.value)}
                                        className="w-12 h-12 bg-transparent border-none cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={form.color}
                                        onChange={(e) => handleRankChange("color", e.target.value)}
                                        className="flex-1 px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-purple-300 mb-1">Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => handleRankChange("description", e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Reward Voucher Section */}
                        <div className={`galaxy-card rounded-xl p-6 transition-all border ${showVoucherForm ? 'border-pink-500/50' : 'border-purple-500/20'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-pink-400" /> Voucher Thưởng
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowVoucherForm(!showVoucherForm)}
                                    className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full transition-colors ${showVoucherForm ? 'bg-pink-500/20 text-pink-300' : 'bg-white/5 text-purple-300 hover:bg-white/10'
                                        }`}
                                >
                                    {showVoucherForm ? (
                                        <><ChevronUp className="w-4 h-4" /> Đang tạo mới</>
                                    ) : (
                                        <><Plus className="w-4 h-4" /> Tạo voucher mới</>
                                    )}
                                </button>
                            </div>

                            {!showVoucherForm ? (
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Nhập mã voucher có sẵn (nếu có)</label>
                                    <input
                                        type="text"
                                        value={form.rewardVoucherCode}
                                        onChange={(e) => handleRankChange("rewardVoucherCode", e.target.value.toUpperCase())}
                                        placeholder="VD: GIAM20K, SHIP0D..."
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                    />
                                    <p className="text-xs text-purple-400 mt-2 italic">Dùng voucher này để thưởng cho người dùng khi họ đạt cấp bậc này.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1 flex items-center gap-1">
                                                <Tag className="w-3 h-3" /> Mã voucher thưởng *
                                            </label>
                                            <input
                                                type="text"
                                                value={voucherForm.code}
                                                onChange={(e) => handleVoucherChange("code", e.target.value.toUpperCase())}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1">Tên voucher thưởng *</label>
                                            <input
                                                type="text"
                                                value={voucherForm.name}
                                                onChange={(e) => handleVoucherChange("name", e.target.value)}
                                                placeholder="VD: Quà tặng thành viên Vàng"
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1">Loại giảm giá</label>
                                            <select
                                                value={voucherForm.type}
                                                onChange={(e) => handleVoucherChange("type", e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="percentage">Phần trăm (%)</option>
                                                <option value="fixed">Số tiền cố định (đ)</option>
                                                <option value="shipping">Miễn phí ship</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1">
                                                Giá trị ({voucherForm.type === 'percentage' ? '%' : 'đ'})
                                            </label>
                                            <input
                                                type="number"
                                                value={voucherForm.value}
                                                onChange={(e) => handleVoucherChange("value", Number(e.target.value))}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1">Tổng số lượt dùng</label>
                                            <input
                                                type="number"
                                                value={voucherForm.totalQuantity}
                                                onChange={(e) => handleVoucherChange("totalQuantity", Number(e.target.value))}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Ngày bắt đầu
                                            </label>
                                            <input
                                                type="date"
                                                value={voucherForm.startDate}
                                                onChange={(e) => handleVoucherChange("startDate", e.target.value)}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-purple-300 mb-1 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Ngày kết thúc
                                            </label>
                                            <input
                                                type="date"
                                                value={voucherForm.endDate}
                                                onChange={(e) => handleVoucherChange("endDate", e.target.value)}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-pink-300 font-medium bg-pink-500/10 p-2 rounded">
                                        * Voucher này sẽ tự động được gán cho cấp bậc này sau khi nhấn Lưu.
                                    </p>
                                </div>
                            )}
                        </div>

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
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}
                            >
                                {loading ? "Đang xử lý..." : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
