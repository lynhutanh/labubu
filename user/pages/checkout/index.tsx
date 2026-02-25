import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, useReducedMotion } from "framer-motion";
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
    Ticket,
    Tag,
    X,
} from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import { useTrans } from "../../src/hooks/useTrans";
import { cartService, Cart } from "../../src/services/cart.service";
import { orderService, CreateOrderPayload } from "../../src/services/order.service";
import { ghnService } from "../../src/services/ghn.service";
import { addressService, Address } from "../../src/services";
import { voucherService, Voucher } from "../../src/services/voucher.service";
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

interface VoucherWithStatus extends Voucher {
    isValid: boolean;
    discountAmount: number;
    message?: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const t = useTrans();
    const shouldReduceMotion = useReducedMotion();
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
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Voucher state
    const [vouchers, setVouchers] = useState<VoucherWithStatus[]>([]);
    const [vouchersLoading, setVouchersLoading] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherWithStatus | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [voucherDiscount, setVoucherDiscount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const stars = useMemo(() => {
        if (!mounted) return [];
        return Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            opacity: Math.random() * 0.6 + 0.3,
            delay: Math.random() * 3,
        }));
    }, [mounted]);

    useEffect(() => {
        const loadCart = async () => {
            const user = storage.getUser();
            if (!user) {
                toast.error(t.checkout.loginRequired);
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
                toast.error(t.checkout.loadError);
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [router]);

    const subtotal = useMemo(() => {
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => {
            const price = item.product?.salePrice || item.product?.price || 0;
            return sum + price * item.quantity;
        }, 0);
    }, [cart]);

    const total = useMemo(() => Math.max(0, subtotal - voucherDiscount), [subtotal, voucherDiscount]);

    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const data = await ghnService.getProvinces();
                setProvinces(data || []);
            } catch (error) {
                console.error("Failed to load provinces:", error);
            }
        };

        const loadSavedAddresses = async () => {
            try {
                const addresses = await addressService.getAddresses();
                setSavedAddresses(addresses || []);
                const defaultAddress = addresses.find((addr) => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress._id);
                    fillFormFromAddress(defaultAddress);
                }
            } catch (error) {
                console.error("Failed to load saved addresses:", error);
            }
        };

        loadProvinces();
        loadSavedAddresses();
    }, []);

    const loadVouchers = async (amount: number) => {
        try {
            setVouchersLoading(true);
            const response = await voucherService.getActiveVouchers();
            const list = response.vouchers || [];

            const vouchersWithStatus = await Promise.all(
                list.map(async (v) => {
                    const validation = await voucherService.validateVoucher(v.code, amount);
                    return {
                        ...v,
                        isValid: validation.valid,
                        discountAmount: validation.discount,
                        message: validation.message,
                    };
                })
            );

            // Sắp xếp: voucher hợp lệ lên đầu
            const sorted = vouchersWithStatus.sort((a, b) => {
                if (a.isValid && !b.isValid) return -1;
                if (!a.isValid && b.isValid) return 1;
                return 0;
            });

            setVouchers(sorted);
        } catch (error) {
            console.error("Failed to load vouchers:", error);
        } finally {
            setVouchersLoading(false);
        }
    };

    useEffect(() => {
        if (subtotal > 0) {
            loadVouchers(subtotal);
        }
    }, [subtotal]);

    const handleSelectVoucher = (v: VoucherWithStatus) => {
        if (!v.isValid) {
            toast.error(v.message || "Voucher không đủ điều kiện");
            return;
        }
        setSelectedVoucher(v);
        setVoucherDiscount(v.discountAmount);
        setShowVoucherModal(false);
        toast.success(`Đã áp dụng mã ${v.code}`);
    };

    const removeVoucher = () => {
        setSelectedVoucher(null);
        setVoucherDiscount(0);
    };

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
                    toast.success(t.checkout.paymentSuccess);

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

    const fillFormFromAddress = async (addr: Address) => {
        setFormData({
            fullName: addr.fullName,
            phone: addr.phone,
            address: addr.address,
            ward: addr.ward || "",
            wardCode: addr.wardCode || "",
            district: addr.district || "",
            districtId: addr.districtId || null,
            city: addr.city,
            provinceId: addr.provinceId || null,
            note: addr.note || "",
        });

        if (addr.provinceId) {
            setSelectedProvinceId(addr.provinceId);
            try {
                const districtData = await ghnService.getDistricts(addr.provinceId);
                setDistricts(districtData || []);
                if (addr.districtId) {
                    setSelectedDistrictId(addr.districtId);
                    try {
                        const wardData = await ghnService.getWards(addr.districtId);
                        setWards(wardData || []);
                    } catch (error) {
                        console.error("Failed to load wards:", error);
                    }
                }
            } catch (error) {
                console.error("Failed to load districts:", error);
            }
        }
    };

    const handleAddressSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            setSelectedAddressId(null);
            return;
        }

        const address = savedAddresses.find((addr) => addr._id === value);
        if (address) {
            setSelectedAddressId(value);
            await fillFormFromAddress(address);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (selectedAddressId) {
            setSelectedAddressId(null);
        }
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            toast.error(t.checkout.validation.fullName);
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error(t.checkout.validation.phone);
            return false;
        }
        if (!formData.address.trim()) {
            toast.error(t.checkout.validation.address);
            return false;
        }
        if (!formData.city.trim() || !formData.provinceId) {
            toast.error(t.checkout.validation.province);
            return false;
        }
        if (!formData.districtId) {
            toast.error(t.checkout.validation.district);
            return false;
        }
        if (!formData.wardCode) {
            toast.error(t.checkout.validation.ward);
            return false;
        }
        return true;
    };

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedAddressId(null);
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
        setSelectedAddressId(null);
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
        setSelectedAddressId(null);
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
            toast.error(t.checkout.emptyCart);
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
                    districtId: formData.districtId ? Number(formData.districtId) : undefined,
                    city: formData.city,
                    provinceId: formData.provinceId ? Number(formData.provinceId) : undefined,
                    note: formData.note,
                },
                paymentMethod: selectedPayment,
                voucherCode: selectedVoucher?.code,
            };

            const order = await orderService.createOrder(payload);
            setOrderCode(order.orderNumber);
            setOrderCreated(true);

            if (selectedPayment === "sepay") {
                // SePay: hiển thị QR + poll webhook giống tài liệu SePay
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
                    toast.error(t.checkout.paymentInfoError);
                }
            } else if (selectedPayment === "paypal" && order.paymentUrl) {
                // PayPal: backend trả về paymentUrl (approvalUrl) -> redirect người dùng sang PayPal
                window.location.href = order.paymentUrl;
            } else {
                toast.success(t.checkout.orderCreated);
                router.push(`/profile/order/${order._id}`);
            }
        } catch (error: any) {
            console.error("Failed to create order:", error);
            const message =
                error?.response?.data?.message || t.checkout.orderError;
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
                    <p className="text-purple-200 mb-4">{t.checkout.emptyCart}</p>
                    <button
                        onClick={() => router.push("/cart")}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg"
                    >
                        {t.checkout.backToCart}
                    </button>
                </div>
            </Layout>
        );
    }


    const paymentMethods = [
        {
            id: "sepay" as PaymentMethod,
            name: t.checkout.bankTransfer,
            icon: Building2,
            description: t.checkout.bankTransferDesc,
            disabled: false,
        },
        {
            id: "wallet" as PaymentMethod,
            name: t.checkout.wallet,
            icon: Wallet,
            description: t.checkout.walletDesc,
            disabled: false,
        },
        {
            id: "paypal" as PaymentMethod,
            name: t.checkout.paypal,
            icon: QrCode,
            description: t.checkout.paypalUpdating,
            disabled: true,
        },
        {
            id: "cod" as PaymentMethod,
            name: t.checkout.cod,
            icon: CreditCard,
            description: t.checkout.codUpdating,
            disabled: true,
        },
    ];

    return (
        <Layout>
            <Head>
                <title>{t.checkout.title}</title>
                <meta name="description" content="Thanh toán đơn hàng của bạn" />
            </Head>

            {/* Galaxy Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10 overflow-hidden">
                {mounted && stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.width}px`,
                            height: `${star.height}px`,
                            opacity: star.opacity,
                            animation: shouldReduceMotion ? "none" : `twinkle ${star.delay + 2}s infinite`,
                        }}
                    />
                ))}
            </div>

            <section className="relative z-10 py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
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
                            initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="galaxy-card rounded-2xl p-8 backdrop-blur-sm text-center">
                                <QrCode className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {t.checkout.qrTitle}
                                </h2>
                                <p className="text-purple-200 mb-6">
                                    {t.checkout.qrDesc}
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
                                        <span>{t.checkout.amount}</span>
                                        <span className="font-bold text-white text-lg">
                                            {formatCurrency(paymentInfo.amount)}₫
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-purple-200">
                                        <span>{t.checkout.transferContent}</span>
                                        <span className="font-mono text-white">
                                            {paymentInfo.paymentRef}
                                        </span>
                                    </div>
                                    {countdown !== null && countdown > 0 && (
                                        <div className="flex items-center justify-center gap-2 text-pink-300 mt-4">
                                            <Clock className="w-5 h-5" />
                                            <span>
                                                {t.checkout.timeRemaining} {Math.floor(countdown / 60)}:
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
                                    initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
                                    className="galaxy-card rounded-2xl p-6 backdrop-blur-sm"
                                >
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-pink-400" />
                                        {t.checkout.shippingAddress}
                                    </h2>
                                    {savedAddresses.length > 0 && (
                                        <div className="mb-4">
                                            <label className="block text-purple-200 mb-2">
                                                Chọn địa chỉ đã lưu
                                            </label>
                                            <select
                                                value={selectedAddressId || ""}
                                                onChange={handleAddressSelect}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            >
                                                <option value="" className="bg-gray-900 text-purple-200">
                                                    Chọn địa chỉ đã lưu (tùy chọn)
                                                </option>
                                                {savedAddresses.map((addr) => (
                                                    <option
                                                        key={addr._id}
                                                        value={addr._id}
                                                        className="bg-gray-900 text-purple-200"
                                                    >
                                                        {addr.fullName} - {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                                                        {addr.isDefault ? " (Mặc định)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t.checkout.fullName} <span className="text-red-400">{t.checkout.required}</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t.checkout.fullNamePlaceholder}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t.checkout.phone} <span className="text-red-400">{t.checkout.required}</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t.checkout.phonePlaceholder}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 mb-2">
                                                {t.checkout.address} <span className="text-red-400">{t.checkout.required}</span>
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
                                                    {t.checkout.province} <span className="text-red-400">{t.checkout.required}</span>
                                                </label>
                                                <select
                                                    name="city"
                                                    value={selectedProvinceId ? String(selectedProvinceId) : ""}
                                                    onChange={handleProvinceChange}
                                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                >
                                                    <option value="" className="bg-gray-900 text-purple-200">
                                                        {t.checkout.selectProvince}
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
                                                    {t.checkout.district}
                                                </label>
                                                <select
                                                    name="district"
                                                    value={selectedDistrictId ? String(selectedDistrictId) : ""}
                                                    onChange={handleDistrictChange}
                                                    disabled={!selectedProvinceId}
                                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                                >
                                                    <option value="" className="bg-gray-900 text-purple-200">
                                                        {t.checkout.selectDistrict}
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
                                                {t.checkout.ward}
                                            </label>
                                            <select
                                                name="ward"
                                                value={wards.find((w: any) => w.WardName === formData.ward)?.WardCode || ""}
                                                onChange={handleWardChange}
                                                disabled={!selectedDistrictId}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                            >
                                                <option value="" className="bg-gray-900 text-purple-200">
                                                    {t.checkout.selectWard}
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
                                                {t.checkout.note}
                                            </label>
                                            <textarea
                                                name="note"
                                                value={formData.note}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder={t.checkout.notePlaceholder}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Payment Method */}
                                <motion.div
                                    initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.1 }}
                                    className="galaxy-card rounded-2xl p-6 backdrop-blur-sm"
                                >
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-pink-400" />
                                        {t.checkout.paymentMethod}
                                    </h2>
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            const isSelected = selectedPayment === method.id;
                                            const isDisabled = method.disabled || false;
                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => !isDisabled && setSelectedPayment(method.id)}
                                                    disabled={isDisabled}
                                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${isDisabled
                                                        ? "border-gray-500/30 bg-white/5 opacity-50 cursor-not-allowed"
                                                        : isSelected
                                                            ? "border-pink-500 bg-pink-500/20"
                                                            : "border-purple-500/30 bg-white/5 hover:border-purple-500/50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isDisabled
                                                                ? "border-gray-500"
                                                                : isSelected
                                                                    ? "border-pink-500 bg-pink-500"
                                                                    : "border-purple-400"
                                                                }`}
                                                        >
                                                            {isSelected && !isDisabled && (
                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <Icon
                                                            className={`w-6 h-6 ${isDisabled
                                                                ? "text-gray-500"
                                                                : isSelected
                                                                    ? "text-pink-400"
                                                                    : "text-purple-300"
                                                                }`}
                                                        />
                                                        <div className="flex-1">
                                                            <div
                                                                className={`font-semibold ${isDisabled
                                                                    ? "text-gray-400"
                                                                    : isSelected
                                                                        ? "text-white"
                                                                        : "text-purple-200"
                                                                    }`}
                                                            >
                                                                {method.name}
                                                            </div>
                                                            <div
                                                                className={`text-sm ${isDisabled
                                                                    ? "text-gray-500 italic"
                                                                    : "text-purple-300"
                                                                    }`}
                                                            >
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
                                    initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.2 }}
                                    className="galaxy-card rounded-2xl p-6 backdrop-blur-sm sticky top-4"
                                >
                                    <h2 className="text-xl font-bold text-white mb-4">
                                        {t.checkout.orderSummary}
                                    </h2>
                                    <div className="flex justify-between text-purple-200">
                                        <span>{t.checkout.subtotal}</span>
                                        <span className="text-white">{formatCurrency(subtotal)}₫</span>
                                    </div>

                                    {/* Voucher Section */}
                                    <div className="py-3 border-t border-purple-500/30">
                                        {!selectedVoucher ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowVoucherModal(true)}
                                                className="w-full flex items-center justify-between p-3 bg-white/5 border border-dashed border-purple-500/50 rounded-lg hover:bg-white/10 transition-all text-purple-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Ticket className="w-5 h-5 text-pink-400" />
                                                    <span>Chọn hoặc nhập mã</span>
                                                </div>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-5 h-5 text-pink-400" />
                                                    <div>
                                                        <div className="text-white font-bold">{selectedVoucher.code}</div>
                                                        <div className="text-xs text-pink-300">Giảm {formatCurrency(voucherDiscount)}₫</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={removeVoucher}
                                                    className="p-1 hover:bg-white/10 rounded-full text-purple-300 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-purple-500/30 pt-3">
                                        <div className="flex justify-between text-lg font-bold text-white">
                                            <span>{t.checkout.total}</span>
                                            <span className="text-2xl text-pink-400">
                                                {formatCurrency(total)}₫
                                            </span>
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
                                                {t.checkout.processing}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                {t.checkout.placeOrder}
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.5);
                }
            `}</style>

            {/* Voucher Selection Modal */}
            {
                showVoucherModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVoucherModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="relative w-full max-w-lg bg-indigo-950 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20"
                        >
                            <div className="p-4 border-b border-purple-500/30 flex items-center justify-between bg-indigo-900/50">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Ticket className="w-6 h-6 text-pink-400" />
                                    Chọn Voucher
                                </h3>
                                <button
                                    onClick={() => setShowVoucherModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-full text-purple-300 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                                {vouchersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
                                        <p className="text-purple-300">Đang tải danh sách voucher...</p>
                                    </div>
                                ) : vouchers.length > 0 ? (
                                    vouchers.map((v) => (
                                        <div
                                            key={v._id}
                                            onClick={() => handleSelectVoucher(v)}
                                            className={`relative group cursor-pointer transition-all duration-300 ${v.isValid
                                                ? "opacity-100 hover:scale-[1.02]"
                                                : "opacity-60 grayscale-[0.5]"
                                                }`}
                                        >
                                            <div
                                                className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r transition-all duration-300 ${v.isValid
                                                    ? "from-pink-500 to-purple-600 opacity-30 group-hover:opacity-100 blur"
                                                    : "from-gray-500 to-gray-700 opacity-0"
                                                    }`}
                                            />
                                            <div className={`relative flex items-stretch rounded-xl overflow-hidden bg-indigo-900/80 border ${v.isValid ? "border-pink-500/50" : "border-white/10"
                                                }`}>
                                                {/* Left color bar */}
                                                <div className={`w-2 ${v.isValid ? "bg-gradient-to-b from-pink-500 to-purple-600" : "bg-gray-600"}`} />

                                                <div className="p-4 flex-1 flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${v.isValid ? "bg-pink-500/20 text-pink-400" : "bg-white/5 text-gray-500"
                                                        }`}>
                                                        <Tag className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className={`font-bold truncate ${v.isValid ? "text-white" : "text-gray-400"}`}>
                                                                {v.name}
                                                            </h4>
                                                            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${v.isValid
                                                                ? "border-pink-500/50 text-pink-300 bg-pink-500/10"
                                                                : "border-gray-500/30 text-gray-500 bg-white/5"
                                                                }`}>
                                                                {v.code}
                                                            </span>
                                                        </div>
                                                        <div className={`mt-1 space-y-1 ${v.isValid ? "text-purple-200" : "text-gray-500"}`}>
                                                            <div className="text-sm font-bold flex items-center gap-2">
                                                                <span className="text-pink-400">
                                                                    {v.type === 'percentage' ? `Giảm ${v.value}%` : `Giảm ${formatCurrency(v.value)}đ`}
                                                                </span>
                                                                {v.type === 'percentage' && v.maxDiscountAmount > 0 && (
                                                                    <span className="text-xs font-normal opacity-80">
                                                                        (Tối đa {formatCurrency(v.maxDiscountAmount)}đ)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs flex flex-wrap gap-x-3 gap-y-1 opacity-90">
                                                                <span className="flex items-center gap-1">
                                                                    • Đơn tối thiểu: {formatCurrency(v.minOrderAmount)}đ
                                                                </span>
                                                                {v.description && (
                                                                    <span className="italic flex-1 min-w-full italic mt-0.5 opacity-70">
                                                                        {v.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!v.isValid && v.message && (
                                                            <div className="flex items-center gap-1 mt-2 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                                                                <AlertCircle className="w-3 h-3" />
                                                                {v.message}
                                                            </div>
                                                        )}
                                                        {v.isValid && (
                                                            <div className="mt-2 text-xs text-green-400 font-medium">
                                                                Sẵn sàng sử dụng
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 space-y-2">
                                        <Ticket className="w-12 h-12 text-purple-500/30 mx-auto" />
                                        <p className="text-purple-300">Hiện không có voucher nào khả dụng.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-indigo-900/30 text-center text-xs text-purple-400 border-t border-purple-500/10">
                                Áp dụng voucher để hưởng thêm ưu đãi cho đơn hàng.
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </Layout>
    );
}

