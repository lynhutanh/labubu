import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "../../src/components/layout/Layout";
import { storage } from "../../src/utils/storage";
import {
    User,
    LayoutDashboard,
    Package,
    MapPin,
    CreditCard,
    Lock,
    RefreshCw,
    QrCode,
    Filter,
    Eye,
    Plus,
    Edit,
    Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

type TabType =
    | "dashboard"
    | "orders"
    | "address"
    | "account"
    | "coupons"
    | "wallet";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>("account");
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [walletBalance] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<string>("");
    const [transactions] = useState([
        {
            id: 1,
            title: "tiền từ Paypal",
            status: "Đang xử lý",
            amount: 50000,
            date: "08-01-2026 02:50:23",
        },
        {
            id: 2,
            title: "Nạp tiền từ Visa",
            status: "Đang xử lý",
            amount: 50000,
            date: "05-01-2026 01:36:59",
        },
    ]);
    const [orders] = useState([
        {
            id: "ORD-2026-001",
            date: "10-01-2026",
            status: "Đang giao hàng",
            statusColor: "blue",
            total: 250000,
            items: [
                {
                    name: "Sticker D20 - Màu đỏ",
                    quantity: 2,
                    price: 50000,
                    image: "/placeholder-sticker.jpg",
                },
                {
                    name: "Sticker Controller - Màu xanh",
                    quantity: 3,
                    price: 50000,
                    image: "/placeholder-sticker.jpg",
                },
            ],
            shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
            paymentMethod: "Thanh toán khi nhận hàng",
        },
        {
            id: "ORD-2026-002",
            date: "08-01-2026",
            status: "Đã hoàn thành",
            statusColor: "green",
            total: 150000,
            items: [
                {
                    name: "Sticker Kettlebell - Màu đen",
                    quantity: 1,
                    price: 150000,
                    image: "/placeholder-sticker.jpg",
                },
            ],
            shippingAddress: "456 Đường XYZ, Quận 2, TP.HCM",
            paymentMethod: "Chuyển khoản",
        },
        {
            id: "ORD-2026-003",
            date: "05-01-2026",
            status: "Đã hủy",
            statusColor: "red",
            total: 100000,
            items: [
                {
                    name: "Sticker Custom - Thiết kế riêng",
                    quantity: 1,
                    price: 100000,
                    image: "/placeholder-sticker.jpg",
                },
            ],
            shippingAddress: "789 Đường DEF, Quận 3, TP.HCM",
            paymentMethod: "Ví điện tử",
        },
        {
            id: "ORD-2026-004",
            date: "03-01-2026",
            status: "Chờ xử lý",
            statusColor: "yellow",
            total: 300000,
            items: [
                {
                    name: "Sticker Sheet - Bộ 10 mẫu",
                    quantity: 2,
                    price: 150000,
                    image: "/placeholder-sticker.jpg",
                },
            ],
            shippingAddress: "321 Đường GHI, Quận 4, TP.HCM",
            paymentMethod: "Thẻ tín dụng",
        },
    ]);
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: "Nguyễn Văn A",
            phone: "0901234567",
            address: "123 Đường ABC",
            ward: "Phường 1",
            district: "Quận 1",
            city: "TP.HCM",
            isDefault: true,
        },
        {
            id: 2,
            name: "Trần Thị B",
            phone: "0987654321",
            address: "456 Đường XYZ",
            ward: "Phường 2",
            district: "Quận 2",
            city: "TP.HCM",
            isDefault: false,
        },
    ]);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [addressForm, setAddressForm] = useState({
        name: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
    });

    useEffect(() => {
        const currentUser = storage.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);
        setFormData({
            nickname: currentUser.username || currentUser.name || "",
            email: currentUser.email || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    }, [router]);

    const handleSavePersonalInfo = async () => {
        try {
            // TODO: Call API to update user info
            toast.success("Đã lưu thông tin cá nhân");
        } catch {
            toast.error("Có lỗi xảy ra khi lưu thông tin");
        }
    };

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu mới không khớp");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        try {
            // TODO: Call API to change password
            toast.success("Đã thay đổi mật khẩu thành công");
            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch {
            toast.error("Có lỗi xảy ra khi thay đổi mật khẩu");
        }
    };

    const menuItems = [
        {
            id: "account" as TabType,
            label: "Chi tiết tài khoản",
            icon: User,
        },
        {
            id: "wallet" as TabType,
            label: "Ví",
            icon: LayoutDashboard,
        },
        {
            id: "orders" as TabType,
            label: "Đơn hàng",
            icon: Package,
        },
        {
            id: "address" as TabType,
            label: "Địa chỉ",
            icon: MapPin,
        },
        {
            id: "coupons" as TabType,
            label: "Phiếu giảm giá",
            icon: CreditCard,
        },
    ];

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <Head>
                <title>Tài khoản - Labubu Store</title>
            </Head>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 rounded-lg p-6 text-white">
                                {/* User Info Section */}
                                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700">
                                    <div className="w-16 h-16 rounded-full border-2 border-orange-500 flex items-center justify-center flex-shrink-0 bg-transparent">
                                        <User className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-gray-200 mb-1 truncate">
                                            {user.username || user.name || "User"}
                                        </h3>
                                        <p className="text-xs text-gray-400 break-all">
                                            {user.email || ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Navigation Menu */}
                                <nav className="space-y-2">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                        ? "bg-gray-700 text-white"
                                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="lg:col-span-3">
                            {activeTab === "account" && (
                                <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
                                    {/* Personal Information Section */}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                                            Thông tin cá nhân
                                        </h2>

                                        {/* Nickname Field */}
                                        <div className="mb-6">
                                            <label
                                                htmlFor="nickname"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Biệt danh *
                                            </label>
                                            <input
                                                type="text"
                                                id="nickname"
                                                value={formData.nickname}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        nickname: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                                placeholder="Nhập biệt danh"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Đây là tên sẽ được hiển thị cho người dùng khác
                                            </p>
                                        </div>

                                        {/* Email Field */}
                                        <div className="mb-6">
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Địa chỉ email *
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            email: e.target.value,
                                                        })
                                                    }
                                                    disabled={!isEditingEmail}
                                                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditingEmail
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : ""
                                                        }`}
                                                    placeholder="Nhập email"
                                                />
                                                <button
                                                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                                >
                                                    {isEditingEmail ? "Hủy" : "Chỉnh sửa"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSavePersonalInfo}
                                            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>

                                    {/* Change Password Section */}
                                    <div className="border-t border-gray-200 pt-8">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                                            Thay đổi mật khẩu
                                        </h2>

                                        {/* Current Password */}
                                        <div className="mb-4">
                                            <label
                                                htmlFor="currentPassword"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        currentPassword: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                                placeholder="Nhập mật khẩu hiện tại"
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div className="mb-4">
                                            <label
                                                htmlFor="newPassword"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                value={formData.newPassword}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        newPassword: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                                placeholder="Nhập mật khẩu mới"
                                            />
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="mb-6">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        confirmPassword: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                                placeholder="Nhập lại mật khẩu mới"
                                            />
                                        </div>

                                        {/* Change Password Button */}
                                        <button
                                            onClick={handleChangePassword}
                                            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                                        >
                                            <Lock className="w-5 h-5" />
                                            Thay đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Other Tabs Content */}
                            {activeTab === "dashboard" && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Bảng điều khiển
                                    </h2>
                                    <p className="text-gray-600">
                                        Nội dung bảng điều khiển sẽ được hiển thị ở đây
                                    </p>
                                </div>
                            )}

                            {activeTab === "orders" && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                                        Đơn hàng của tôi
                                    </h2>

                                    {/* Orders List */}
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                            >
                                                {/* Order Header */}
                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                Mã đơn hàng: {order.id}
                                                            </span>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor === "blue"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : order.statusColor === "green"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : order.statusColor === "red"
                                                                                ? "bg-red-100 text-red-800"
                                                                                : "bg-yellow-100 text-yellow-800"
                                                                    }`}
                                                            >
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            Ngày đặt: {order.date}
                                                        </span>
                                                    </div>
                                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        Xem chi tiết
                                                    </button>
                                                </div>

                                                {/* Order Items */}
                                                <div className="mb-4">
                                                    {order.items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
                                                        >
                                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <Package className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                                    {item.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">
                                                                    Số lượng: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {(item.price * item.quantity).toLocaleString(
                                                                        "vi-VN",
                                                                    )}
                                                                    ₫
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Order Footer */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                    <div className="text-sm text-gray-600">
                                                        <p className="mb-1">
                                                            <span className="font-medium">
                                                                Địa chỉ giao hàng:
                                                            </span>{" "}
                                                            {order.shippingAddress}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">
                                                                Phương thức thanh toán:
                                                            </span>{" "}
                                                            {order.paymentMethod}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Tổng tiền
                                                        </p>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {order.total.toLocaleString("vi-VN")}₫
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Empty State (if no orders) */}
                                    {orders.length === 0 && (
                                        <div className="text-center py-12">
                                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "address" && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Địa chỉ giao hàng
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowAddAddressForm(true);
                                                setEditingAddressId(null);
                                                setAddressForm({
                                                    name: "",
                                                    phone: "",
                                                    address: "",
                                                    ward: "",
                                                    district: "",
                                                    city: "",
                                                    isDefault: false,
                                                });
                                            }}
                                            className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Thêm địa chỉ mới
                                        </button>
                                    </div>

                                    {/* Add/Edit Address Form */}
                                    {showAddAddressForm && (
                                        <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                {editingAddressId
                                                    ? "Chỉnh sửa địa chỉ"
                                                    : "Thêm địa chỉ mới"}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Họ và tên *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.name}
                                                        onChange={(e) =>
                                                            setAddressForm({
                                                                ...addressForm,
                                                                name: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nhập họ và tên"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Số điện thoại *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={addressForm.phone}
                                                        onChange={(e) =>
                                                            setAddressForm({
                                                                ...addressForm,
                                                                phone: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nhập số điện thoại"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Địa chỉ cụ thể *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.address}
                                                        onChange={(e) =>
                                                            setAddressForm({
                                                                ...addressForm,
                                                                address: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Số nhà, tên đường"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Phường/Xã *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.ward}
                                                        onChange={(e) =>
                                                            setAddressForm({
                                                                ...addressForm,
                                                                ward: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nhập phường/xã"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Quận/Huyện *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.district}
                                                        onChange={(e) =>
                                                            setAddressForm({
                                                                ...addressForm,
                                                                district: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nhập quận/huyện"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tỉnh/Thành phố *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.city}
                                                        onChange={(e) =>
                                                            setAddressForm({
                                                                ...addressForm,
                                                                city: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Nhập tỉnh/thành phố"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={addressForm.isDefault}
                                                            onChange={(e) =>
                                                                setAddressForm({
                                                                    ...addressForm,
                                                                    isDefault: e.target.checked,
                                                                })
                                                            }
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">
                                                            Đặt làm địa chỉ mặc định
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-6">
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            !addressForm.name ||
                                                            !addressForm.phone ||
                                                            !addressForm.address ||
                                                            !addressForm.ward ||
                                                            !addressForm.district ||
                                                            !addressForm.city
                                                        ) {
                                                            toast.error("Vui lòng điền đầy đủ thông tin");
                                                            return;
                                                        }

                                                        if (editingAddressId) {
                                                            setAddresses(
                                                                addresses.map((addr) =>
                                                                    addr.id === editingAddressId
                                                                        ? {
                                                                            ...addressForm,
                                                                            id: editingAddressId,
                                                                        }
                                                                        : addressForm.isDefault
                                                                            ? {
                                                                                ...addr,
                                                                                isDefault: false,
                                                                            }
                                                                            : addr,
                                                                ),
                                                            );
                                                            toast.success("Đã cập nhật địa chỉ");
                                                        } else {
                                                            const newAddress = {
                                                                ...addressForm,
                                                                id: Math.max(...addresses.map((a) => a.id)) + 1,
                                                            };
                                                            setAddresses([
                                                                ...addresses.map((addr) =>
                                                                    addressForm.isDefault
                                                                        ? {
                                                                            ...addr,
                                                                            isDefault: false,
                                                                        }
                                                                        : addr,
                                                                ),
                                                                newAddress,
                                                            ]);
                                                            toast.success("Đã thêm địa chỉ mới");
                                                        }
                                                        setShowAddAddressForm(false);
                                                        setEditingAddressId(null);
                                                        setAddressForm({
                                                            name: "",
                                                            phone: "",
                                                            address: "",
                                                            ward: "",
                                                            district: "",
                                                            city: "",
                                                            isDefault: false,
                                                        });
                                                    }}
                                                    className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                                >
                                                    {editingAddressId ? "Cập nhật" : "Thêm địa chỉ"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddAddressForm(false);
                                                        setEditingAddressId(null);
                                                        setAddressForm({
                                                            name: "",
                                                            phone: "",
                                                            address: "",
                                                            ward: "",
                                                            district: "",
                                                            city: "",
                                                            isDefault: false,
                                                        });
                                                    }}
                                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Addresses List */}
                                    <div className="space-y-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {addr.name}
                                                            </h3>
                                                            {addr.isDefault && (
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                                    Mặc định
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            📞 {addr.phone}
                                                        </p>
                                                        <p className="text-sm text-gray-700">
                                                            {addr.address}, {addr.ward}, {addr.district},{" "}
                                                            {addr.city}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingAddressId(addr.id);
                                                                setAddressForm({
                                                                    name: addr.name,
                                                                    phone: addr.phone,
                                                                    address: addr.address,
                                                                    ward: addr.ward,
                                                                    district: addr.district,
                                                                    city: addr.city,
                                                                    isDefault: addr.isDefault,
                                                                });
                                                                setShowAddAddressForm(true);
                                                            }}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Bạn có chắc chắn muốn xóa địa chỉ này?",
                                                                    )
                                                                ) {
                                                                    setAddresses(
                                                                        addresses.filter((a) => a.id !== addr.id),
                                                                    );
                                                                    toast.success("Đã xóa địa chỉ");
                                                                }
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Empty State */}
                                    {addresses.length === 0 && (
                                        <div className="text-center py-12">
                                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-4">
                                                Bạn chưa có địa chỉ nào
                                            </p>
                                            <button
                                                onClick={() => setShowAddAddressForm(true)}
                                                className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                            >
                                                Thêm địa chỉ đầu tiên
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "coupons" && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Phiếu giảm giá
                                    </h2>
                                    <p className="text-gray-600">
                                        Danh sách phiếu giảm giá sẽ được hiển thị ở đây
                                    </p>
                                </div>
                            )}

                            {activeTab === "wallet" && (
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
                                                    onClick={() => {
                                                        // Refresh balance
                                                        toast.success("Đã làm mới số dư");
                                                    }}
                                                    className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-3xl font-bold">
                                                {walletBalance.toLocaleString("vi-VN")}₫
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
                                                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedAmount === amount
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
                                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${selectedPaymentMethod === method.id
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
                                                onClick={() => {
                                                    const amount =
                                                        selectedAmount || parseInt(customAmount);
                                                    if (!amount || amount <= 0) {
                                                        toast.error("Vui lòng chọn số tiền");
                                                        return;
                                                    }
                                                    if (!selectedPaymentMethod) {
                                                        toast.error("Vui lòng chọn phương thức thanh toán");
                                                        return;
                                                    }
                                                    toast.success("Đang xử lý nạp tiền...");
                                                }}
                                                disabled={
                                                    (!selectedAmount && !customAmount) ||
                                                    !selectedPaymentMethod
                                                }
                                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            >
                                                Nạp ngay
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Content - Transaction History */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white rounded-lg shadow-sm p-6">
                                            {/* Header with Filters */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-600">
                                                        giao hàng
                                                    </span>
                                                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <option>30 lịch sử gần nhất</option>
                                                        <option>60 lịch sử gần nhất</option>
                                                        <option>90 lịch sử gần nhất</option>
                                                    </select>
                                                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <option>cả loại</option>
                                                        <option>Nạp tiền</option>
                                                        <option>Rút tiền</option>
                                                        <option>Thanh toán</option>
                                                    </select>
                                                </div>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Filter className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>

                                            {/* Transaction List */}
                                            <div className="space-y-4">
                                                {transactions.map((transaction) => (
                                                    <div
                                                        key={transaction.id}
                                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                                {transaction.title}
                                                            </h4>
                                                            <div className="flex items-center gap-4">
                                                                <span
                                                                    className={`text-xs px-2 py-1 rounded ${transaction.status === "Đang xử lý"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-green-100 text-green-800"
                                                                        }`}
                                                                >
                                                                    {transaction.status}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {transaction.date}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600">
                                                                +{transaction.amount.toLocaleString("vi-VN")}₫
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
