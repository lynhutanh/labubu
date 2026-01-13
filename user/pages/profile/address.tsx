import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import { MapPin, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { userService, User } from "../../src/services/user.service";

interface Address {
    id: number;
    name: string;
    phone: string;
    address: string;
    ward?: string;
    district?: string;
    city: string;
    isDefault: boolean;
}

export default function ProfileAddressPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
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
        loadUserProfile();
    }, [router]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const userData = await userService.getProfile();
            setUser(userData);
            
            // Parse address from user data
            // Note: Backend chỉ có 1 field address, nên ta sẽ parse nó
            // Hoặc có thể lưu addresses dưới dạng JSON string trong address field
            if (userData.address) {
                try {
                    const parsedAddresses = JSON.parse(userData.address);
                    if (Array.isArray(parsedAddresses)) {
                        setAddresses(parsedAddresses);
                    } else {
                        // Nếu address là string đơn giản, tạo 1 address từ đó
                        setAddresses([{
                            id: 1,
                            name: userData.name || userData.username || "",
                            phone: userData.phone || "",
                            address: userData.address,
                            city: "",
                            isDefault: true,
                        }]);
                    }
                } catch {
                    // Nếu không parse được, coi như là string đơn giản
                    if (userData.address) {
                        setAddresses([{
                            id: 1,
                            name: userData.name || userData.username || "",
                            phone: userData.phone || "",
                            address: userData.address,
                            city: "",
                            isDefault: true,
                        }]);
                    }
                }
            }
        } catch (error: any) {
            console.error("Failed to load user profile:", error);
            toast.error("Không thể tải thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    const saveAddresses = async () => {
        try {
            setSaving(true);
            // Lưu addresses dưới dạng JSON string trong address field
            const addressString = JSON.stringify(addresses);
            await userService.updateProfile({
                address: addressString,
            });
            toast.success("Đã lưu địa chỉ");
            await loadUserProfile();
        } catch (error: any) {
            console.error("Failed to save addresses:", error);
            toast.error("Không thể lưu địa chỉ");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <Layout>
                <Head>
                    <title>Địa chỉ giao hàng - Labubu Store</title>
                </Head>
                <ProfileLayout>
                    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                    </div>
                </ProfileLayout>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Địa chỉ giao hàng - Labubu Store</title>
            </Head>
            <ProfileLayout>
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
                                                    onClick={async () => {
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
                                                            const updatedAddresses = addresses.map((addr) =>
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
                                                            );
                                                            setAddresses(updatedAddresses);
                                                            await saveAddresses();
                                                        } else {
                                                            const newAddress = {
                                                                ...addressForm,
                                                                id:
                                                                    addresses.length > 0
                                                                        ? Math.max(...addresses.map((a) => a.id)) + 1
                                                                        : 1,
                                                            };
                                                            const updatedAddresses = [
                                                                ...addresses.map((addr) =>
                                                                    addressForm.isDefault
                                                                        ? {
                                                                              ...addr,
                                                                              isDefault: false,
                                                                          }
                                                                        : addr,
                                                                ),
                                                                newAddress,
                                                            ];
                                                            setAddresses(updatedAddresses);
                                                            await saveAddresses();
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
                                                    disabled={saving}
                                                    className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {saving ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Đang lưu...
                                                        </>
                                                    ) : editingAddressId ? (
                                                        "Cập nhật"
                                                    ) : (
                                                        "Thêm địa chỉ"
                                                    )}
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
                                                            onClick={async () => {
                                                                if (
                                                                    confirm(
                                                                        "Bạn có chắc chắn muốn xóa địa chỉ này?",
                                                                    )
                                                                ) {
                                                                    const updatedAddresses = addresses.filter((a) => a.id !== addr.id);
                                                                    setAddresses(updatedAddresses);
                                                                    await saveAddresses();
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
                            <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
                            <button
                                onClick={() => setShowAddAddressForm(true)}
                                className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Thêm địa chỉ đầu tiên
                            </button>
                        </div>
                    )}
                </div>
            </ProfileLayout>
        </Layout>
    );
}
