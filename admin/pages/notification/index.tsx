import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { Plus, Trash2, Save, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import AdminLayout from "../../src/components/layout/AdminLayout";
import { settingsService, fileService } from "../../src/services";
import toast from "react-hot-toast";

interface NotificationRow {
    image: string;
    text: string;
}

const COMMON_EMOJIS = [
    "🎉", "🎊", "🎁", "🔥", "🚀", "📢", "✨", "🌟",
    "💖", "❤️", "😍", "🤩", "😊", "🥳", "🤑", "💰",
    "🛍️", "🛒", "📦", "🚚", "⏰", "📅", "✅", "❌",
    "👋", "🤝", "💯", "🔥", "⚡", "🌈", "🎈", "🎫"
];

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-xl"
                title="Chọn Emoji"
            >
                😊
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 z-30 bg-[#1a1c2e] border border-purple-500/50 rounded-xl p-3 shadow-2xl w-64">
                        <div className="grid grid-cols-8 gap-1">
                            {COMMON_EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                        onSelect(emoji);
                                        setIsOpen(false);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded transition text-xl flex items-center justify-center"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default function NotificationAdminPage() {
    const [rows, setRows] = useState<NotificationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await settingsService.getEditableSettings();
            const popupSetting = settings.find((s) => s.key === "welcome_popup");

            if (popupSetting && Array.isArray(popupSetting.value)) {
                setRows(popupSetting.value);
                fileInputRefs.current = popupSetting.value.map(() => null);
            } else {
                setRows([]);
                fileInputRefs.current = [];
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            toast.error("Không thể tải cấu hình thông báo");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        setRows([...rows, { image: "", text: "" }]);
        fileInputRefs.current.push(null);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);

        const newRefs = [...fileInputRefs.current];
        newRefs.splice(index, 1);
        fileInputRefs.current = newRefs;
    };

    const handleChangeText = (index: number, text: string) => {
        const newRows = [...rows];
        newRows[index].text = text;
        setRows(newRows);
    };

    const handleImageUpload = async (index: number, file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file không được vượt quá 5MB");
            return;
        }

        try {
            toast.loading("Đang tải ảnh lên...", { id: "uploading" });
            const uploaded = await fileService.uploadAvatar(file);

            const newRows = [...rows];
            newRows[index].image = uploaded.url;
            setRows(newRows);

            toast.success("Tải ảnh thành công", { id: "uploading" });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error?.message || "Không thể tải ảnh", { id: "uploading" });
        }
    };

    const handleRemoveImage = (index: number) => {
        const newRows = [...rows];
        newRows[index].image = "";
        setRows(newRows);
    };

    const handleSave = async () => {
        try {
            console.log("Saving welcome_popup configurations:", rows);
            setSaving(true);
            const res = await settingsService.update("welcome_popup", rows);
            console.log("Save Response:", res);
            toast.success("Lưu cấu hình thông báo thành công");
        } catch (error) {
            console.error("Failed to save:", error);
            toast.error("Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Quản lý Thông báo - Labubu Admin</title>
            </Head>

            <div className="flex-1 overflow-y-auto">
                <header
                    className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30 px-6 py-4 flex items-center justify-between"
                    style={{ background: "rgba(0, 0, 0, 0.3)" }}
                >
                    <h1
                        className="text-2xl font-bold"
                        style={{
                            background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Thông báo
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg ${saving || loading
                            ? "bg-white/10 text-purple-400 cursor-not-allowed border border-purple-500/20"
                            : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                            }`}
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </button>
                </header>

                <main className="max-w-4xl mx-auto p-6">
                    <div className="galaxy-card rounded-xl p-8 shadow-2xl">
                        <h2 className="text-xl font-semibold text-white mb-2">Nội dung hiển thị trên Popup Trang chủ</h2>
                        <p className="text-purple-300 mb-8 max-w-2xl">
                            Thêm các dòng thông báo bao gồm biểu tượng (ảnh nhỏ) và nội dung văn bản. Bạn có thể chèn các biểu tượng cảm xúc (emoji) trực tiếp vào đoạn văn bản bằng bàn phím của thiết bị.
                        </p>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                                <p className="text-purple-200">Đang tải cấu hình...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {rows.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-purple-500/30 rounded-xl bg-black/20">
                                        <ImageIcon className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                                        <p className="text-purple-300">Chưa có thông báo nào được tạo.</p>
                                    </div>
                                ) : (
                                    rows.map((row, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-4 p-4 rounded-xl border border-purple-500/30 bg-black/20"
                                        >
                                            {/* Image Upload Column */}
                                            <div className="w-24 flex-shrink-0 flex flex-col items-center gap-2">
                                                {row.image ? (
                                                    <div className="relative group rounded-lg overflow-hidden border border-purple-500/30 bg-black/40 w-16 h-16 flex items-center justify-center">
                                                        <img src={row.image} alt="Icon" className="max-w-full max-h-full object-contain" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleRemoveImage(index)}
                                                                className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                                                                title="Xoá ảnh"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => fileInputRefs.current[index]?.click()}
                                                        className="rounded-lg border border-dashed border-purple-500/50 bg-white/5 hover:bg-white/10 transition cursor-pointer w-16 h-16 flex flex-col items-center justify-center text-purple-300 hover:text-white"
                                                    >
                                                        <Upload className="w-5 h-5 mb-1 text-purple-400" />
                                                        <span className="text-[10px] text-center px-1">Tải ảnh</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={(el) => {
                                                        if (fileInputRefs.current) {
                                                            fileInputRefs.current[index] = el;
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            handleImageUpload(index, e.target.files[0]);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Text Output Column */}
                                            <div className="flex-1 relative">
                                                <textarea
                                                    placeholder="Nhập nội dung thông báo, ví dụ: 🎉 Tặng 500 xu cho người mới..."
                                                    value={row.text}
                                                    onChange={(e) => handleChangeText(index, e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50 pr-12"
                                                />
                                                <div className="absolute right-2 bottom-3">
                                                    <EmojiPicker
                                                        onSelect={(emoji) => {
                                                            handleChangeText(index, row.text + emoji);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Remove Row Button */}
                                            <button
                                                onClick={() => handleRemoveRow(index)}
                                                className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition self-center"
                                                title="Xóa dòng này"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}

                                <button
                                    onClick={handleAddRow}
                                    className="w-full py-4 border-2 border-dashed border-purple-400/50 text-purple-300 font-medium rounded-xl hover:bg-purple-500/10 hover:border-purple-400 hover:text-white transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Thêm dòng mới
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
}
