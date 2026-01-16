import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import {
    RefreshCw,
    QrCode,
    Building2,
    Loader2,
    Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { walletService, WalletBalance, WalletTransaction } from "../../src/services/wallet.service";
import { walletDepositService } from "../../src/services/wallet-deposit.service";
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
    const [showQR, setShowQR] = useState(false);
    const [qrData, setQrData] = useState<{ qrUrl: string; paymentRef: string; amount: number; expiredAt: Date } | null>(null);
    const [polling, setPolling] = useState(false);
    const [initialBalance, setInitialBalance] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState<number | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        const currentUser = storage.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);
        loadWalletData();
    }, [router]);

    // Countdown timer for SePay QR
    useEffect(() => {
        if (!qrData || !countdown || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [qrData, countdown]);

    // Poll wallet balance after deposit
    useEffect(() => {
        if (!polling || !initialBalance || !depositAmount) return;

        let pollCount = 0;
        const maxPolls = 150; // 5 minutes (150 * 2 seconds)
        
        const pollInterval = setInterval(async () => {
            try {
                pollCount++;
                const balance = await walletService.getBalance();
                const newBalance = balance.balance;
                const expectedBalance = initialBalance + depositAmount;

                console.log(`[Wallet Polling] Attempt ${pollCount}: current=${newBalance}, expected=${expectedBalance}`);

                // Check if balance has increased by the deposit amount
                if (newBalance >= expectedBalance) {
                    setPolling(false);
                    clearInterval(pollInterval);
                    setWalletBalance(balance);
                    await loadWalletData(); // Reload transactions
                    toast.success(`Nạp tiền thành công! Số dư: ${formatCurrency(newBalance)}`);
                    setShowQR(false);
                    setQrData(null);
                    setInitialBalance(null);
                    setDepositAmount(null);
                    setSelectedAmount(null);
                    setCustomAmount("");
                    setSelectedPaymentMethod("");
                    return;
                }

                // Timeout after max polls
                if (pollCount >= maxPolls) {
                    setPolling(false);
                    clearInterval(pollInterval);
                    toast.error("Hết thời gian chờ. Vui lòng kiểm tra lại số dư hoặc liên hệ hỗ trợ.");
                    setShowQR(false);
                    setQrData(null);
                }
            } catch (error) {
                console.error("Failed to poll balance:", error);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [polling, initialBalance, depositAmount]);

    const loadWalletData = async () => {
        try {
            setLoading(true);
            const [balance, transactionsData] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions({
                    limit: 30,
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
        if (!amount || amount < 1000) {
            toast.error("Số tiền tối thiểu là 1,000₫");
            return;
        }
        if (!selectedPaymentMethod) {
            toast.error("Vui lòng chọn phương thức thanh toán");
            return;
        }

        try {
            setDepositing(true);

            // Save initial balance and deposit amount for polling
            const currentBalance = walletBalance?.balance || 0;
            setInitialBalance(currentBalance);
            setDepositAmount(amount);

            if (selectedPaymentMethod === "paypal") {
                const result = await walletDepositService.createPayPalDeposit({
                    amount,
                    description: "Nạp tiền vào ví",
                });
                if (result.approvalUrl) {
                    // Store deposit info in sessionStorage for callback page
                    sessionStorage.setItem("paypal_deposit", JSON.stringify({
                        amount,
                        initialBalance: currentBalance,
                    }));
                    window.location.href = result.approvalUrl;
                } else {
                    toast.error("Không thể tạo đơn nạp tiền PayPal");
                    setInitialBalance(null);
                    setDepositAmount(null);
                }
            } else if (selectedPaymentMethod === "sepay") {
                const result = await walletDepositService.createSePayDeposit({
                    amount,
                    description: "Nạp tiền vào ví",
                });
                setQrData({
                    qrUrl: result.qrUrl,
                    paymentRef: result.paymentRef,
                    amount: result.amount,
                    expiredAt: new Date(result.expiredAt),
                });
                setShowQR(true);
                
                // Calculate countdown
                const expiredAt = new Date(result.expiredAt).getTime();
                const now = Date.now();
                const diff = Math.floor((expiredAt - now) / 1000);
                setCountdown(diff > 0 ? diff : 0);
                
                // Start polling
                setPolling(true);
                toast.success("Vui lòng quét mã QR để thanh toán. Đang kiểm tra thanh toán...");
            }
        } catch (error: any) {
            console.error("Failed to deposit:", error);
            toast.error(error?.response?.data?.message || "Không thể nạp tiền. Vui lòng thử lại.");
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
                    <div className="lg:col-span-2 space-y-6">
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

                        {!showQR ? (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Nạp tiền vào ví
                                </h3>

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
                                            min="1000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            ₫
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        Phương thức thanh toán
                                    </h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setSelectedPaymentMethod("paypal")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${
                                                selectedPaymentMethod === "paypal"
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            <QrCode className="w-5 h-5 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-700">
                                                PayPal
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedPaymentMethod("sepay")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${
                                                selectedPaymentMethod === "sepay"
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            <Building2 className="w-5 h-5 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Chuyển khoản ngân hàng
                                            </span>
                                        </button>
                                    </div>
                                </div>

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
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Quét mã QR để thanh toán
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowQR(false);
                                            setQrData(null);
                                            setPolling(false);
                                            setInitialBalance(null);
                                            setDepositAmount(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {qrData && (
                                    <>
                                        {polling && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-blue-700">
                                                    Đang kiểm tra thanh toán...
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-center mb-4">
                                            <img
                                                src={qrData.qrUrl}
                                                alt="QR Code"
                                                className="w-64 h-64 border border-gray-200 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Số tiền:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(qrData.amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Nội dung CK:</span>
                                                <span className="text-sm font-mono text-gray-900">
                                                    {qrData.paymentRef}
                                                </span>
                                            </div>
                                            {countdown !== null && countdown > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Còn lại:</span>
                                                    <span className="text-sm font-semibold text-orange-600">
                                                        {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            Vui lòng quét mã QR và chuyển khoản đúng số tiền và nội dung
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">
                                Lịch sử giao dịch
                            </h3>

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
