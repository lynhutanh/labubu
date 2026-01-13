import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    ArrowLeft,
    Package,
    User,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Truck,
    FileText,
    Copy,
} from "lucide-react";
import { orderService } from "../../src/services";
import { OrderResponse } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

const STATUSES = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "processing", label: "Người bán đang chuẩn bị hàng" },
    { value: "shipping", label: "Đang giao hàng" },
    { value: "delivered", label: "Đã giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "refunded", label: "Đã hoàn tiền" },
];

const PAYMENT_STATUSES = [
    { value: "pending", label: "Chờ thanh toán" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "failed", label: "Thanh toán thất bại" },
    { value: "refunded", label: "Đã hoàn tiền" },
];

export default function OrderDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

    useEffect(() => {
        const user = storage.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        if (id) {
            loadOrder();
        }
    }, [id, router]);

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.status);
            setSelectedPaymentStatus(order.paymentStatus);
        }
    }, [order]);

    const loadOrder = async () => {
        if (!id || typeof id !== "string") return;

        try {
            setLoading(true);
            const data = await orderService.getById(id);
            setOrder(data);
        } catch (error: any) {
            console.error("Failed to load order:", error);
            toast.error("Không thể tải thông tin đơn hàng");
            router.push("/orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!order || !id || typeof id !== "string") return;

        try {
            setUpdating(true);
            await orderService.updateStatus(id, selectedStatus);
            toast.success("Đã cập nhật trạng thái đơn hàng");
            await loadOrder();
        } catch (error: any) {
            console.error("Failed to update status:", error);
            toast.error("Không thể cập nhật trạng thái");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePaymentStatus = async () => {
        if (!order || !id || typeof id !== "string") return;

        try {
            setUpdating(true);
            await orderService.updatePaymentStatus(id, selectedPaymentStatus);
            toast.success("Đã cập nhật trạng thái thanh toán");
            await loadOrder();
        } catch (error: any) {
            console.error("Failed to update payment status:", error);
            toast.error("Không thể cập nhật trạng thái thanh toán");
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "confirmed":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "processing":
                return "bg-purple-500/20 text-purple-300 border-purple-500/30";
            case "shipping":
                return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
            case "delivered":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "completed":
                return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
            case "cancelled":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "refunded":
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "paid":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "failed":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "refunded":
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép!");
    };

    if (loading) {
        return (
            <AdminLayout>
                <Head>
                    <title>Chi tiết đơn hàng - Labubu Admin</title>
                </Head>
                <div className="flex-1 overflow-y-auto flex items-center justify-center">
                    <div className="text-center">
                        <Package className="w-16 h-16 mx-auto text-purple-400 animate-pulse mb-4" />
                        <p className="text-white text-lg">Đang tải thông tin đơn hàng...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!order) {
        return (
            <AdminLayout>
                <Head>
                    <title>Chi tiết đơn hàng - Labubu Admin</title>
                </Head>
                <div className="flex-1 overflow-y-auto flex items-center justify-center">
                    <div className="text-center">
                        <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                        <p className="text-white text-lg mb-4">Không tìm thấy đơn hàng</p>
                        <button
                            onClick={() => router.push("/orders")}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                        >
                            Quay lại danh sách đơn hàng
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const currentStatusLabel = STATUSES.find((s) => s.value === order.status)?.label || order.status;
    const currentPaymentStatusLabel = PAYMENT_STATUSES.find((s) => s.value === order.paymentStatus)?.label || order.paymentStatus;

    return (
        <AdminLayout>
            <Head>
                <title>Chi tiết đơn hàng {order.orderNumber} - Labubu Admin</title>
            </Head>

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <header
                    className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
                    style={{
                        background: "rgba(0, 0, 0, 0.3)",
                    }}
                >
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.push("/orders")}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-purple-300" />
                                </button>
                                <div>
                                    <h1
                                        className="text-2xl font-bold"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        Đơn hàng {order.orderNumber}
                                    </h1>
                                    <p className="text-purple-300 text-sm flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        Đặt ngày {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(
                                        order.status,
                                    )}`}
                                >
                                    {currentStatusLabel}
                                </span>
                                <span
                                    className={`px-4 py-2 text-sm font-medium rounded-full border ${getPaymentStatusColor(
                                        order.paymentStatus,
                                    )}`}
                                >
                                    {currentPaymentStatusLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="galaxy-card rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Package className="w-6 h-6" />
                                    Sản phẩm
                                </h2>
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 p-4 bg-white/5 rounded-lg border border-purple-500/20"
                                        >
                                            <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/10">
                                                {item.coverImage ? (
                                                    <img
                                                        src={item.coverImage}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                                        <Package className="w-10 h-10 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                                                <p className="text-purple-300 text-sm mb-2">
                                                    Số lượng: {item.quantity}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {item.salePrice ? (
                                                        <>
                                                            <span className="text-purple-300 line-through text-sm">
                                                                {formatPrice(item.price)}
                                                            </span>
                                                            <span className="text-pink-400 font-semibold">
                                                                {formatPrice(item.salePrice)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-white font-semibold">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold text-lg">
                                                    {formatPrice(item.subtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="galaxy-card rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-6 h-6" />
                                    Địa chỉ giao hàng
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-purple-300 mt-1" />
                                        <div>
                                            <p className="text-purple-300 text-sm">Họ và tên</p>
                                            <p className="text-white font-semibold">
                                                {order.shippingAddress.fullName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-purple-300 mt-1" />
                                        <div>
                                            <p className="text-purple-300 text-sm">Số điện thoại</p>
                                            <p className="text-white font-semibold">
                                                {order.shippingAddress.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-purple-300 mt-1" />
                                        <div>
                                            <p className="text-purple-300 text-sm">Địa chỉ</p>
                                            <p className="text-white">
                                                {order.shippingAddress.address}
                                                {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                                                {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                                                {`, ${order.shippingAddress.city}`}
                                            </p>
                                        </div>
                                    </div>
                                    {order.shippingAddress.note && (
                                        <div className="flex items-start gap-3">
                                            <FileText className="w-5 h-5 text-purple-300 mt-1" />
                                            <div>
                                                <p className="text-purple-300 text-sm">Ghi chú</p>
                                                <p className="text-white">{order.shippingAddress.note}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="galaxy-card rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Tóm tắt đơn hàng</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-purple-300">Tạm tính</span>
                                        <span className="text-white font-semibold">
                                            {formatPrice(order.subtotal)}
                                        </span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-purple-300">Giảm giá</span>
                                            <span className="text-pink-400 font-semibold">
                                                -{formatPrice(order.discount)}
                                            </span>
                                        </div>
                                    )}
                                    {order.shippingFee > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-purple-300">Phí vận chuyển</span>
                                            <span className="text-white font-semibold">
                                                {formatPrice(order.shippingFee)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-purple-500/30 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-bold text-lg">Tổng cộng</span>
                                            <span
                                                className="text-xl font-bold"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    backgroundClip: "text",
                                                }}
                                            >
                                                {formatPrice(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="galaxy-card rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Thanh toán
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-purple-300 text-sm mb-1">Phương thức</p>
                                        <p className="text-white font-semibold capitalize">
                                            {order.paymentMethod === "sepay"
                                                ? "Chuyển khoản ngân hàng"
                                                : order.paymentMethod === "cod"
                                                    ? "Thanh toán khi nhận hàng"
                                                    : order.paymentMethod}
                                        </p>
                                    </div>
                                    {order.paymentRef && (
                                        <div>
                                            <p className="text-purple-300 text-sm mb-2">Nội dung chuyển khoản</p>
                                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-purple-500/20">
                                                <code className="text-white font-mono text-sm flex-1">
                                                    {order.paymentRef}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(order.paymentRef!)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Sao chép"
                                                >
                                                    <Copy className="w-4 h-4 text-purple-300" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Management */}
                            <div className="galaxy-card rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Quản lý trạng thái</h2>
                                <div className="space-y-4">
                                    {/* Order Status */}
                                    <div>
                                        <label className="block text-purple-300 text-sm mb-2">
                                            Trạng thái đơn hàng
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white backdrop-blur-sm"
                                        >
                                            {STATUSES.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={updating || selectedStatus === order.status}
                                            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                                        </button>
                                    </div>

                                    {/* Payment Status */}
                                    <div>
                                        <label className="block text-purple-300 text-sm mb-2">
                                            Trạng thái thanh toán
                                        </label>
                                        <select
                                            value={selectedPaymentStatus}
                                            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white backdrop-blur-sm"
                                        >
                                            {PAYMENT_STATUSES.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleUpdatePaymentStatus}
                                            disabled={updating || selectedPaymentStatus === order.paymentStatus}
                                            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? "Đang cập nhật..." : "Cập nhật thanh toán"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
}
