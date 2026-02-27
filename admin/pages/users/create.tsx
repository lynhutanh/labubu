import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import { userService } from "../../src/services/user.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";
import { CreateUserPayload } from "../../src/interfaces";

export default function CreateUserPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<CreateUserPayload>({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        role: "user",
    });

    useEffect(() => {
        setMounted(true);
        const user = storage.getUser();
        if (!user) router.push("/login");
    }, [router]);

    const handleChange = (field: keyof CreateUserPayload, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username.trim()) return toast.error("Vui lòng nhập username");
        if (!form.email.trim()) return toast.error("Vui lòng nhập email");
        if (!form.password.trim()) return toast.error("Vui lòng nhập mật khẩu");
        if (form.password.length < 6) return toast.error("Mật khẩu phải ít nhất 6 ký tự");

        try {
            setLoading(true);
            await userService.create(form);
            toast.success("Tạo người dùng thành công!");
            router.push("/users");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Tạo người dùng thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <AdminLayout>
            <Head>
                <title>Tạo Người dùng - Labubu Admin</title>
            </Head>
            <div className="flex-1 overflow-y-auto">
                <header
                    className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
                    style={{ background: "rgba(0,0,0,0.3)" }}
                >
                    <div className="px-6 py-4 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-300 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1
                            className="text-2xl font-bold"
                            style={{
                                background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Tạo Người dùng mới
                        </h1>
                    </div>
                </header>

                <main className="p-6 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="galaxy-card rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-pink-400" /> Thông tin tài khoản
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Họ tên</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="VD: Nguyễn Văn A"
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Username *</label>
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={(e) => handleChange("username", e.target.value)}
                                        placeholder="VD: nguyenvana"
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-purple-300 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="VD: anghuyen@gmail.com"
                                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        placeholder="VD: 0912345678"
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Mật khẩu *</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="Ít nhất 6 ký tự"
                                        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-purple-300 mb-2">Vai trò</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "user", label: "Người dùng" },
                                        { value: "seller", label: "Người bán" },
                                        { value: "admin", label: "Admin" },
                                    ].map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => handleChange("role", r.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${form.role === r.value
                                                    ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400/50 text-white"
                                                    : "bg-white/5 border-purple-500/30 text-purple-300 hover:bg-white/10"
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 bg-white/10 border border-purple-500/30 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}
                            >
                                {loading ? "Đang tạo..." : <><Save className="w-4 h-4" /> Tạo Người dùng</>}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
