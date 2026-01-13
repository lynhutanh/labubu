import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
    CreditCard,
    Wallet,
    Building2,
    QrCode,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    User,
    AlertCircle,
} from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import { cartService, Cart } from "../../src/services/cart.service";
import { orderService, CreateOrderPayload } from "../../src/services/order.service";
import { storage } from "../../src/utils/storage";
import toast from "react-hot-toast";
import { formatCurrency } from "../../src/lib/string";

type PaymentMethod = "cod" | "wallet" | "paypal" | "zalopay" | "sepay";

interface PaymentInfo {
    amount: number;
    paymentRef: string;
    qrUrl: string;
    expiredAt: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("sepay");
    const [orderCreated, setOrderCreated] = useState(false);
    const [orderCode, setOrderCode] = useState<string | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [polling, setPolling] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        city: "",
        note: "",
    });

    useEffect(() => {
        const loadCart = async () => {
            const user = storage.getUser();
            if (!user) {
                toast.error("Vui lòng đăng nhập để thanh toán");
                router.push("/login");
                return;
            }

            try {
                setLoading(true);
                const data = await cartService.getCart();
                setCart(data);

                // Pre-fill form with user data if available
                if (user.name) setFormData((prev) => ({ ...prev, fullName: user.name }));
                if (user.phone) setFormData((prev) => ({ ...prev, phone: user.phone }));
                if (user.address) setFormData((prev) => ({ ...prev, address: user.address }));
            } catch (error: any) {
                console.error("Failed to load cart:", error);
                toast.error("Không thể tải giỏ hàng");
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [router]);

    // Countdown timer
    useEffect(() => {
        if (!paymentInfo || !countdown) return;

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
    }, [paymentInfo, countdown]);

    // Poll order status for SePay
    useEffect(() => {
        if (!orderCode || !polling || selectedPayment !== "sepay") return;

        const pollInterval = setInterval(async () => {
            try {
                const status = await orderService.getOrderStatus(orderCode);

                // Check paymentStatus (case-insensitive)
                const paymentStatus = status?.paymentStatus?.toLowerCase();
                if (paymentStatus === "paid") {
                    setPolling(false);
                    clearInterval(pollInterval);
                    toast.success("🎉 Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");

                    // Wait a bit before redirecting to show the toast
                    setTimeout(() => {
                        router.push(`/profile/order`);
                    }, 1500);
                }
            } catch (error) {
                console.error("Failed to poll status:", error);
            }
        }, 2000); // Poll every 2 seconds (faster)

        return () => clearInterval(pollInterval);
    }, [orderCode, polling, selectedPayment, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            toast.error("Vui lòng nhập họ tên");
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error("Vui lòng nhập số điện thoại");
            return false;
        }
        if (!formData.address.trim()) {
            toast.error("Vui lòng nhập địa chỉ");
            return false;
        }
        if (!formData.city.trim()) {
            toast.error("Vui lòng nhập thành phố");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!cart || cart.items.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateOrderPayload = {
                items: cart.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    ward: formData.ward,
                    district: formData.district,
                    city: formData.city,
                    note: formData.note,
                },
                paymentMethod: selectedPayment,
            };

            const order = await orderService.createOrder(payload);
            setOrderCode(order.orderNumber);
            setOrderCreated(true);

            // If SePay, get payment info
            if (selectedPayment === "sepay") {
                try {
                    const info = await orderService.getPaymentInfo(order.orderNumber);
                    setPaymentInfo(info);
                    setPolling(true);

                    // Calculate countdown
                    const expiredAt = new Date(info.expiredAt).getTime();
                    const now = Date.now();
                    const diff = Math.floor((expiredAt - now) / 1000);
                    setCountdown(diff > 0 ? diff : 0);
                } catch (error: any) {
                    console.error("Failed to get payment info:", error);
                    toast.error("Không thể lấy thông tin thanh toán");
                }
            } else {
                // For other payment methods, redirect or show success
                toast.success("Đơn hàng đã được tạo thành công!");
                router.push(`/profile/order/${order._id}`);
            }
        } catch (error: any) {
            console.error("Failed to create order:", error);
            const message =
                error?.response?.data?.message || "Không thể tạo đơn hàng";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
                </div>
            </Layout>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <p className="text-purple-200 mb-4">Giỏ hàng trống</p>
                    <button
                        onClick={() => router.push("/cart")}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg"
                    >
                        Quay lại giỏ hàng
                    </button>
                </div>
            </Layout>
        );
    }

    const subtotal = cart.items.reduce((sum, item) => {
        const price = item.product?.salePrice || item.product?.price || 0;
        return sum + price * item.quantity;
    }, 0);
    const total = subtotal;

    // Payment method options
    const paymentMethods = [
        {
            id: "sepay" as PaymentMethod,
            name: "Chuyển khoản ngân hàng",
            icon: Building2,
            description: "Thanh toán qua QR chuyển khoản",
        },
        {
            id: "cod" as PaymentMethod,
            name: "Thanh toán khi nhận hàng",
            icon: CreditCard,
            description: "Thanh toán khi nhận được hàng",
        },
        {
            id: "wallet" as PaymentMethod,
            name: "Ví điện tử",
            icon: Wallet,
            description: "Thanh toán bằng ví của bạn",
        },
    ];

    return (
        <Layout>
            <Head>
                <title>Thanh Toán - Labubu</title>
                <meta name="description" content="Thanh toán đơn hàng của bạn" />
            </Head>

            {/* Galaxy Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            opacity: Math.random() * 0.8 + 0.2,
                        }}
                    />
                ))}
            </div>

            <section className="relative z-10 py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-purple-200 hover:text-white mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                        <h1
                            className="text-4xl font-bold mb-2"
                            style={{
                                background:
                                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Thanh Toán
                        </h1>
                    </motion.div>

                    {orderCreated && selectedPayment === "sepay" && paymentInfo ? (
                        // Payment QR Screen
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="galaxy-card rounded-2xl p-8 backdrop-blur-sm text-center">
                                <QrCode className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Quét mã QR để thanh toán
                                </h2>
                                <p className="text-purple-200 mb-6">
                                    Vui lòng quét mã QR bằng ứng dụng ngân hàng của bạn
                                </p>

                                {/* QR Code */}
                                <div className="bg-white p-4 rounded-lg inline-block mb-6">
                                    <img
                                        src={paymentInfo.qrUrl}
                                        alt="QR Code"
                                        className="w-64 h-64"
                                    />
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-3 mb-6 text-left max-w-md mx-auto">
                                    <div className="flex justify-between text-purple-200">
                                        <span>Số tiền:</span>
                                        <span className="font-bold text-white text-lg">
                                            {formatCurrency(paymentInfo.amount)}₫
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-purple-200">
                                        <span>Nội dung CK:</span>
                                        <span className="font-mono text-white">
                                            {paymentInfo.paymentRef}
                                        </span>
                                    </div>
                                    {countdown !== null && countdown > 0 && (
                                        <div className="flex items-center justify-center gap-2 text-pink-300 mt-4">
                                            <Clock className="w-5 h-5" />
                                            <span>
                                                Còn lại: {Math.floor(countdown / 60)}:
                                                {(countdown % 60).toString().padStart(2, "0")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {polling && (
                                    <div className="flex items-center justify-center gap-2 text-purple-200">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang kiểm tra thanh toán...</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        // Checkout Form
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Shipping Address */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="galaxy-card rounded-2xl p-6 backdrop-blur-sm"
                                >
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-pink-400" />
                                        Địa chỉ giao hàng
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                Họ và tên <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                Số điện thoại <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                Địa chỉ <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Số nhà, tên đường"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-purple-200 mb-2">
                                                    Phường/Xã
                                                </label>
                                                <input
                                                    type="text"
                                                    name="ward"
                                                    value={formData.ward}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                    placeholder="Phường/Xã"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-purple-200 mb-2">
                                                    Quận/Huyện
                                                </label>
                                                <input
                                                    type="text"
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                    placeholder="Quận/Huyện"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                Thành phố <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Thành phố"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                Ghi chú
                                            </label>
                                            <textarea
                                                name="note"
                                                value={formData.note}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Ghi chú thêm (tùy chọn)"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Payment Method */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="galaxy-card rounded-2xl p-6 backdrop-blur-sm"
                                >
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-pink-400" />
                                        Phương thức thanh toán
                                    </h2>
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            const isSelected = selectedPayment === method.id;
                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setSelectedPayment(method.id)}
                                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                                        ? "border-pink-500 bg-pink-500/20"
                                                        : "border-purple-500/30 bg-white/5 hover:border-purple-500/50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                ? "border-pink-500 bg-pink-500"
                                                                : "border-purple-400"
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <Icon
                                                            className={`w-6 h-6 ${isSelected ? "text-pink-400" : "text-purple-300"
                                                                }`}
                                                        />
                                                        <div className="flex-1">
                                                            <div
                                                                className={`font-semibold ${isSelected ? "text-white" : "text-purple-200"
                                                                    }`}
                                                            >
                                                                {method.name}
                                                            </div>
                                                            <div className="text-sm text-purple-300">
                                                                {method.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="galaxy-card rounded-2xl p-6 backdrop-blur-sm sticky top-4"
                                >
                                    <h2 className="text-xl font-bold text-white mb-4">
                                        Tóm tắt đơn hàng
                                    </h2>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-purple-200">
                                            <span>Tạm tính:</span>
                                            <span className="text-white">{formatCurrency(subtotal)}₫</span>
                                        </div>
                                        <div className="border-t border-purple-500/30 pt-3">
                                            <div className="flex justify-between text-lg font-bold text-white">
                                                <span>Tổng cộng:</span>
                                                <span className="text-2xl text-pink-400">
                                                    {formatCurrency(total)}₫
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Đặt hàng
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </Layout>
    );
}
