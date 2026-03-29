import { useState, useEffect } from "react";
import { UserResponse } from "../../interfaces";
import { userService } from "../../services";
import { petService } from "../../services/pet.service";
import { walletService } from "../../services/wallet.service";
import { X, Save, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface UserEditModalProps {
    user: UserResponse;
    onClose: () => void;
    onUpdate: () => void;
}

// ROLES removed

const STATUSES = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
];

export default function UserEditModal({
    user,
    onClose,
    onUpdate,
}: UserEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        status: user.status || "active",
    });

    // Pet Points state
    const [petTotalPoints, setPetTotalPoints] = useState<number>(0);
    const [petOrderPoints, setPetOrderPoints] = useState<number>(0);
    const [petPointsLoaded, setPetPointsLoaded] = useState(false);

    // Wallet state
    const [balance, setBalance] = useState<number>(0);
    const [initialBalance, setInitialBalance] = useState<number>(0);
    const [balanceLoaded, setBalanceLoaded] = useState(false);

    useEffect(() => {
        loadWalletBalance();
        loadPetPoints();
    }, [user._id]);

    const loadPetPoints = async () => {
        try {
            const res = await petService.getUserPetPoints(user._id);
            const data = (res as any)?.data || res;
            if (data && typeof data.totalPoints === "number") {
                setPetTotalPoints(data.totalPoints);
                setPetOrderPoints(data.orderPoints);
            }
            setPetPointsLoaded(true);
        } catch (error) {
            console.error("Failed to fetch pet points", error);
            setPetPointsLoaded(true);
        }
    };

    const loadWalletBalance = async () => {
        try {
            const res = await walletService.getUserBalance(user._id);
            // Check if response has data.balance (DataResponse structure)
            const walletData = res?.data || res;
            if (walletData && typeof walletData.balance === 'number') {
                setBalance(walletData.balance);
                setInitialBalance(walletData.balance);
                setBalanceLoaded(true);
            } else {
                console.error("Invalid wallet response format:", res);
                toast.error("Format ví không hợp lệ");
            }
        } catch (error) {
            console.error("Failed to load wallet balance", error);
            toast.error("Không thể tải thông tin ví");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // 1. Update user info + pet points
            const newBonusPetPoints = petTotalPoints - petOrderPoints;
            const updatePayload = { ...formData, role: user.role, bonusPetPoints: newBonusPetPoints };
            await userService.update(user._id, updatePayload);

            // 2. Update wallet if changed
            const diff = balance - initialBalance;
            if (diff !== 0 && balanceLoaded) {
                const type = diff > 0 ? 'deposit' : 'withdraw';
                const amount = Math.abs(diff);

                await walletService.adjustUserBalance(user._id, {
                    amount,
                    type,
                    description: `Admin điều chỉnh số dư: ${type === 'deposit' ? '+' : '-'}${amount.toLocaleString('vi-VN')}đ`,
                });
            }

            toast.success("Cập nhật thông tin thành công");
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">
                    Chỉnh sửa người dùng
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/20 pb-2">
                            Thông tin chung
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Họ tên
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                >
                                    {STATUSES.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                            className="bg-slate-800"
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-300 border-b border-green-500/20 pb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Ví tài khoản
                        </h3>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Số dư hiện tại (VNĐ)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={balance}
                                    onChange={(e) => setBalance(Number(e.target.value))}
                                    placeholder={balanceLoaded ? "0" : "Đang tải..."}
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-xl font-bold focus:outline-none focus:border-green-500 transition-colors"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                    đ
                                </div>
                            </div>

                            {balance !== initialBalance && (
                                <div className={`mt-2 text-sm ${balance > initialBalance ? 'text-green-400' : 'text-red-400'}`}>
                                    {balance > initialBalance ? (
                                        <span>Sẽ cộng thêm: +{(balance - initialBalance).toLocaleString('vi-VN')} đ</span>
                                    ) : (
                                        <span>Sẽ trừ bớt: -{(initialBalance - balance).toLocaleString('vi-VN')} đ</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pet Points Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-pink-300 border-b border-pink-500/20 pb-2 flex items-center gap-2">
                            🐾 Điểm nuôi thú
                        </h3>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tổng điểm nuôi thú hiện tại
                            </label>
                            <input
                                type="number"
                                value={petTotalPoints}
                                onChange={(e) => setPetTotalPoints(Number(e.target.value))}
                                placeholder={petPointsLoaded ? "0" : "Đang tải..."}
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-xl font-bold focus:outline-none focus:border-pink-500 transition-colors"
                            />
                            <p className="mt-2 text-xs text-gray-500 italic">
                                Điểm từ đơn hàng: {petOrderPoints} | Nhập giá trị mới sẽ ghi đè tổng điểm
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !balanceLoaded}
                            className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Đang xử lý..." : "Lưu tất cả thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
