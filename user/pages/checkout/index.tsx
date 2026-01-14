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
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../../src/components/layout/Layout";
import { cartService, Cart } from "../../src/services/cart.service";
import { orderService, CreateOrderPayload } from "../../src/services/order.service";
import { ghnService } from "../../src/services/ghn.service";
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
    const { t } = useTranslation("common");
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
        wardCode: "",
        district: "",
        districtId: null as number | null,
        city: "",
        provinceId: null as number | null,
        note: "",
    });
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

    useEffect(() => {
        const loadCart = async () => {
            const user = storage.getUser();
            if (!user) {
                toast.error(t("checkout.loginRequired"));
                router.push("/login");
                return;
            }

            try {
                setLoading(true);
                const data = await cartService.getCart();
                setCart(data);

                if (user.name) setFormData((prev) => ({ ...prev, fullName: user.name }));
                if (user.phone) setFormData((prev) => ({ ...prev, phone: user.phone }));
                if (user.address) setFormData((prev) => ({ ...prev, address: user.address }));
            } catch (error: any) {
                console.error("Failed to load cart:", error);
                toast.error(t("checkout.loadError"));
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [router]);

    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const data = await ghnService.getProvinces();
                setProvinces(data || []);
            } catch (error) {
                console.error("Failed to load provinces:", error);
            }
        };

        loadProvinces();
    }, []);

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
                    toast.success(t("checkout.paymentSuccess"));

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
            toast.error(t("checkout.validation.fullName"));
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error(t("checkout.validation.phone"));
            return false;
        }
        if (!formData.address.trim()) {
            toast.error(t("checkout.validation.address"));
            return false;
        }
        if (!formData.city.trim() || !formData.provinceId) {
            toast.error(t("checkout.validation.province"));
            return false;
        }
        if (!formData.districtId) {
            toast.error(t("checkout.validation.district"));
            return false;
        }
        if (!formData.wardCode) {
            toast.error(t("checkout.validation.ward"));
            return false;
        }
        return true;
    };

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            setSelectedProvinceId(null);
            setDistricts([]);
            setWards([]);
            setFormData((prev) => ({
                ...prev,
                city: "",
                district: "",
                ward: "",
            }));
            return;
        }

        const provinceId = Number(value);
        const province = provinces.find((p) => p.ProvinceID === provinceId);
        setSelectedProvinceId(provinceId);
        setSelectedDistrictId(null);
        setWards([]);

        setFormData((prev) => ({
            ...prev,
            city: province?.ProvinceName || "",
            provinceId: provinceId,
            district: "",
            districtId: null,
            ward: "",
            wardCode: "",
        }));

        try {
            const data = await ghnService.getDistricts(provinceId);
            setDistricts(data || []);
        } catch (error) {
            console.error("Failed to load districts:", error);
        }
    };

    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            setSelectedDistrictId(null);
            setWards([]);
            setFormData((prev) => ({
                ...prev,
                district: "",
                ward: "",
            }));
            return;
        }

        const districtId = Number(value);
        const district = districts.find((d) => d.DistrictID === districtId);
        setSelectedDistrictId(districtId);

        setFormData((prev) => ({
            ...prev,
            district: district?.DistrictName || "",
            districtId: districtId,
            ward: "",
            wardCode: "",
        }));

        try {
            const data = await ghnService.getWards(districtId);
            setWards(data || []);
        } catch (error) {
            console.error("Failed to load wards:", error);
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const ward = wards.find((w: any) => w.WardCode === value);
        setFormData((prev) => ({
            ...prev,
            ward: ward?.WardName || "",
            wardCode: value || "",
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!cart || cart.items.length === 0) {
            toast.error(t("checkout.emptyCart"));
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
                    wardCode: formData.wardCode,
                    district: formData.district,
                    districtId: formData.districtId || undefined,
                    city: formData.city,
                    provinceId: formData.provinceId || undefined,
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
                    toast.error(t("checkout.paymentInfoError"));
                }
            } else {
                toast.success(t("checkout.orderCreated"));
                router.push(`/profile/order/${order._id}`);
            }
        } catch (error: any) {
            console.error("Failed to create order:", error);
            const message =
                error?.response?.data?.message || t("checkout.orderError");
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
                        <p className="text-purple-200 mb-4">{t("checkout.emptyCart")}</p>
                        <button
                            onClick={() => router.push("/cart")}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg"
                        >
                            {t("checkout.backToCart")}
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

    const paymentMethods = [
        {
            id: "sepay" as PaymentMethod,
            name: t("checkout.bankTransfer"),
            icon: Building2,
            description: t("checkout.bankTransferDesc"),
        },
        {
            id: "cod" as PaymentMethod,
            name: t("checkout.cod"),
            icon: CreditCard,
            description: t("checkout.codDesc"),
        },
        {
            id: "wallet" as PaymentMethod,
            name: t("checkout.wallet"),
            icon: Wallet,
            description: t("checkout.walletDesc"),
        },
    ];

    return (
        <Layout>
            <Head>
                <title>{t("checkout.title")}</title>
                <meta name="description" content={t("checkout.description")} />
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
                            {t("checkout.back")}
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
                            {t("checkout.pageTitle")}
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
                                    {t("checkout.qrTitle")}
                                </h2>
                                <p className="text-purple-200 mb-6">
                                    {t("checkout.qrDesc")}
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
                                        <span>{t("checkout.amount")}</span>
                                        <span className="font-bold text-white text-lg">
                                            {formatCurrency(paymentInfo.amount)}₫
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-purple-200">
                                        <span>{t("checkout.transferContent")}</span>
                                        <span className="font-mono text-white">
                                            {paymentInfo.paymentRef}
                                        </span>
                                    </div>
                                    {countdown !== null && countdown > 0 && (
                                        <div className="flex items-center justify-center gap-2 text-pink-300 mt-4">
                                            <Clock className="w-5 h-5" />
                                            <span>
                                                {t("checkout.timeRemaining")} {Math.floor(countdown / 60)}:
                                                {(countdown % 60).toString().padStart(2, "0")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {polling && (
                                    <div className="flex items-center justify-center gap-2 text-purple-200">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{t("checkout.checkingPayment")}</span>
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
                                        {t("checkout.shippingAddress")}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t("checkout.fullName")} <span className="text-red-400">{t("checkout.required")}</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t("checkout.fullNamePlaceholder")}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t("checkout.phone")} <span className="text-red-400">{t("checkout.required")}</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t("checkout.phonePlaceholder")}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t("checkout.address")} <span className="text-red-400">{t("checkout.required")}</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t("checkout.addressPlaceholder")}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-purple-200 mb-2">
                                                    {t("checkout.province")} <span className="text-red-400">{t("checkout.required")}</span>
                                                </label>
                                                <select
                                                    name="city"
                                                    value={selectedProvinceId ? String(selectedProvinceId) : ""}
                                                    onChange={handleProvinceChange}
                                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                >
                                                    <option value="" className="bg-gray-900 text-purple-200">
                                                        {t("checkout.selectProvince")}
                                                    </option>
                                                    {provinces.map((p: any) => (
                                                        <option
                                                            key={p.ProvinceID}
                                                            value={p.ProvinceID}
                                                            className="bg-gray-900 text-purple-200"
                                                        >
                                                            {p.ProvinceName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-purple-200 mb-2">
                                                    {t("checkout.district")}
                                                </label>
                                                <select
                                                    name="district"
                                                    value={selectedDistrictId ? String(selectedDistrictId) : ""}
                                                    onChange={handleDistrictChange}
                                                    disabled={!selectedProvinceId}
                                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                                >
                                                    <option value="" className="bg-gray-900 text-purple-200">
                                                        {t("checkout.selectDistrict")}
                                                    </option>
                                                    {districts.map((d: any) => (
                                                        <option
                                                            key={d.DistrictID}
                                                            value={d.DistrictID}
                                                            className="bg-gray-900 text-purple-200"
                                                        >
                                                            {d.DistrictName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t("checkout.ward")}
                                            </label>
                                            <select
                                                name="ward"
                                                value={wards.find((w: any) => w.WardName === formData.ward)?.WardCode || ""}
                                                onChange={handleWardChange}
                                                disabled={!selectedDistrictId}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                            >
                                                <option value="" className="bg-gray-900 text-purple-200">
                                                    {t("checkout.selectWard")}
                                                </option>
                                                {wards.map((w: any) => (
                                                    <option
                                                        key={w.WardCode}
                                                        value={w.WardCode}
                                                        className="bg-gray-900 text-purple-200"
                                                    >
                                                        {w.WardName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t("checkout.note")}
                                            </label>
                                            <textarea
                                                name="note"
                                                value={formData.note}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t("checkout.notePlaceholder")}
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
                                        {t("checkout.paymentMethod")}
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

export async function getServerSideProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}
