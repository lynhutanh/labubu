import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { walletService } from "../../src/services/wallet.service";
import { formatCurrency } from "../../src/lib/string";

export default function WalletCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
    const [polling, setPolling] = useState(true);
    const [initialBalance, setInitialBalance] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState<number | null>(null);

    useEffect(() => {
        // Get deposit info from sessionStorage
        const depositInfoStr = sessionStorage.getItem("paypal_deposit");
        if (depositInfoStr) {
            try {
                const depositInfo = JSON.parse(depositInfoStr);
                setInitialBalance(depositInfo.initialBalance || 0);
                setDepositAmount(depositInfo.amount || 0);
            } catch (e) {
                console.error("Failed to parse deposit info:", e);
            }
        }

        // Start polling immediately
        setPolling(true);
    }, []);

    useEffect(() => {
        if (!polling || !initialBalance || !depositAmount) return;

        const pollInterval = setInterval(async () => {
            try {
                const balance = await walletService.getBalance();
                const newBalance = balance.balance;
                const expectedBalance = initialBalance + depositAmount;

                // Check if balance has increased by the deposit amount
                if (newBalance >= expectedBalance) {
                    setPolling(false);
                    clearInterval(pollInterval);
                    setStatus("success");
                    toast.success(`Nạp tiền thành công! Số dư: ${formatCurrency(newBalance)}`);
                    
                    // Clear sessionStorage
                    sessionStorage.removeItem("paypal_deposit");
                    
                    // Redirect to wallet page after 2 seconds
                    setTimeout(() => {
                        router.push("/profile/wallet");
                    }, 2000);
                }
            } catch (error) {
                console.error("Failed to poll balance:", error);
            }
        }, 2000); // Poll every 2 seconds

        // Timeout after 60 seconds
        const timeout = setTimeout(() => {
            if (polling) {
                setPolling(false);
                clearInterval(pollInterval);
                setStatus("failed");
                toast.error("Không thể xác nhận thanh toán. Vui lòng kiểm tra lại sau.");
                sessionStorage.removeItem("paypal_deposit");
            }
        }, 60000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [polling, initialBalance, depositAmount, router]);

    return (
        <Layout>
            <Head>
                <title>Xác nhận nạp tiền - Labubu Store</title>
            </Head>
            <ProfileLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md w-full">
                        {status === "checking" && (
                            <>
                                <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Đang xác nhận thanh toán...
                                </h2>
                                <p className="text-gray-600">
                                    Vui lòng đợi trong giây lát. Chúng tôi đang kiểm tra giao dịch của bạn.
                                </p>
                            </>
                        )}
                        {status === "success" && (
                            <>
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Nạp tiền thành công!
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Số tiền đã được nạp vào ví của bạn.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Đang chuyển hướng...
                                </p>
                            </>
                        )}
                        {status === "failed" && (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Không thể xác nhận thanh toán
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ nếu đã thanh toán.
                                </p>
                                <button
                                    onClick={() => router.push("/profile/wallet")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Quay lại ví
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </ProfileLayout>
        </Layout>
    );
}
