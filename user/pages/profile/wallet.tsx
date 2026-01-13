import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import {
    RefreshCw,
    QrCode,
    CreditCard,
    Filter,
    Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { walletService, WalletBalance, WalletTransaction } from "../../src/services/wallet.service";
import { formatCurrency } from "../../src/lib/string";

export default function ProfileWalletPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [depositing, setDepositing] = useState(false);
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("");
    const [transactionLimit, setTransactionLimit] = useState<number>(30);

    useEffect(() => {
        const currentUser = storage.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);
        loadWalletData();
    }, [router]);

    const loadWalletData = async () => {
        try {
            setLoading(true);
            const [balance, transactionsData] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions({
                    type: transactionTypeFilter || undefined,
                    limit: transactionLimit,
                    offset: 0,
                }),
            ]);
            setWalletBalance(balance);
            setTransactions(transactionsData?.transactions || []);
        } catch (error: any) {
            console.error("Failed to load wallet data:", error);
            toast.error("Không thể tải thông tin ví");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadWalletData();
        }
    }, [transactionTypeFilter, transactionLimit, user]);

    const refreshBalance = async () => {
        try {
            setLoadingBalance(true);
            const balance = await walletService.getBalance();
            setWalletBalance(balance);
            toast.success("Đã làm mới số dư");
        } catch (error: any) {
            console.error("Failed to refresh balance:", error);
            toast.error("Không thể làm mới số dư");
        } finally {
            setLoadingBalance(false);
        }
    };

    const handleDeposit = async () => {
        const amount = selectedAmount || parseInt(customAmount);
        if (!amount || amount <= 0) {
            toast.error("Vui lòng chọn số tiền");
            return;
        }
        if (!selectedPaymentMethod) {
            toast.error("Vui lòng chọn phương thức thanh toán");
            return;
        }

        try {
            setDepositing(true);
            // TODO: Implement deposit flow based on payment method
            // For now, just call the deposit API
            await walletService.deposit({
                amount,
                description: `Nạp tiền qua ${selectedPaymentMethod}`,
            });
            toast.success("Đang xử lý nạp tiền...");
            // Refresh balance after deposit
            await refreshBalance();
            await loadWalletData();
        } catch (error: any) {
            console.error("Failed to deposit:", error);
            toast.error("Không thể nạp tiền. Vui lòng thử lại.");
        } finally {
            setDepositing(false);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTransactionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            deposit: "Nạp tiền",
            withdraw: "Rút tiền",
            payment: "Thanh toán",
            refund: "Hoàn tiền",
        };
        return labels[type] || type;
    };

    const getTransactionStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "Đang xử lý",
            completed: "Hoàn thành",
            failed: "Thất bại",
            cancelled: "Đã hủy",
        };
        return labels[status] || status;
    };

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <Head>
                <title>Ví - Labubu Store</title>
            </Head>
            <ProfileLayout>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Sidebar - Wallet Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Wallet Balance */}
                        <div className="bg-blue-600 rounded-lg p-6 text-white relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium">
                                    Số dư hiện tại của ví
                                </h3>
                                <button
                                    onClick={refreshBalance}
                                    disabled={loadingBalance}
                                    className="p-2 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingBalance ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                            <p className="text-3xl font-bold">
                                {walletBalance ? formatCurrency(walletBalance.balance) : "0 ₫"}
                            </p>
                        </div>

                        {/* Top-up Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Nạp tiền vào ví
                            </h3>

                            {/* Predefined Amounts */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[10000, 50000, 100000, 200000, 500000, 1000000].map(
                                    (amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => {
                                                setSelectedAmount(amount);
                                                setCustomAmount("");
                                            }}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                                selectedAmount === amount
                                                    ? "bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {amount.toLocaleString("vi-VN")}₫
                                        </button>
                                    ),
                                )}
                            </div>

                            {/* Custom Amount Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nhập số tiền khác
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => {
                                            setCustomAmount(e.target.value);
                                            setSelectedAmount(null);
                                        }}
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        ₫
                                    </span>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Phương thức thanh toán
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        {
                                            id: "transfer",
                                            name: "Chuyển đổi",
                                            icon: QrCode,
                                            color: "bg-gray-100",
                                        },
                                        {
                                            id: "visa",
                                            name: "Thanh toán quốc tế",
                                            icon: CreditCard,
                                            color: "bg-blue-50",
                                        },
                                        {
                                            id: "momo",
                                            name: "Momo",
                                            color: "bg-pink-50",
                                            logo: "💳",
                                        },
                                        {
                                            id: "paypal",
                                            name: "PayPal",
                                            color: "bg-blue-50",
                                            logo: "💳",
                                        },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() =>
                                                setSelectedPaymentMethod(method.id)
                                            }
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${
                                                selectedPaymentMethod === method.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            {method.icon ? (
                                                <method.icon className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <span className="text-xl">{method.logo}</span>
                                            )}
                                            <span className="text-sm font-medium text-gray-700">
                                                {method.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleDeposit}
                                disabled={
                                    (!selectedAmount && !customAmount) ||
                                    !selectedPaymentMethod ||
                                    depositing
                                }
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {depositing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Nạp ngay"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Transaction History */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {/* Header with Filters */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <select
                                        value={transactionLimit}
                                        onChange={(e) => setTransactionLimit(Number(e.target.value))}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={30}>30 lịch sử gần nhất</option>
                                        <option value={60}>60 lịch sử gần nhất</option>
                                        <option value={90}>90 lịch sử gần nhất</option>
                                    </select>
                                    <select
                                        value={transactionTypeFilter}
                                        onChange={(e) => setTransactionTypeFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Tất cả loại</option>
                                        <option value="deposit">Nạp tiền</option>
                                        <option value="withdraw">Rút tiền</option>
                                        <option value="payment">Thanh toán</option>
                                        <option value="refund">Hoàn tiền</option>
                                    </select>
                                </div>
                            </div>

                            {/* Transaction List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Chưa có giao dịch nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction._id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                    {getTransactionTypeLabel(transaction.type)} - {transaction.description || "Giao dịch"}
                                                </h4>
                                                <div className="flex items-center gap-4">
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${
                                                            transaction.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : transaction.status === "completed"
                                                                  ? "bg-green-100 text-green-800"
                                                                  : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {getTransactionStatusLabel(transaction.status)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(transaction.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-lg font-bold ${
                                                        transaction.type === "deposit" || transaction.type === "refund"
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </Layout>
    );
}
