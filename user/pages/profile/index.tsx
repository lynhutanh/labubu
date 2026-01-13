import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import { User, Lock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <Head>
                <title>Tài khoản - Labubu Store</title>
            </Head>
            <ProfileLayout>
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
                                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                        !isEditingEmail
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
            </ProfileLayout>
        </Layout>
    );
}
