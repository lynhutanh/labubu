import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload, Loader2, X } from "lucide-react";
import { categoryService, fileService } from "../../src/services";
import { CreateCategoryPayload } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    image: "",
    status: "active",
    sortOrder: 0,
    subcategories: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const user = storage.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
  }, [router, mounted]);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);

    try {
      await categoryService.create(formData);
      toast.success("Tạo danh mục thành công!");
      router.push("/categories");
    } catch (error: any) {
      let message = "Tạo danh mục thất bại. Vui lòng thử lại.";

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        message = Array.isArray(errorData)
          ? errorData.join(", ")
          : errorData;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setUploading(true);
    try {
      const url = await categoryService.uploadCategoryImage(file);
      setFormData({ ...formData, image: url });
      setImagePreview(url);
      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Tạo danh mục - Labubu Admin</title>
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
            <div className="flex items-center gap-4">
              <a
                href="/categories"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
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
                Tạo danh mục mới
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="galaxy-card rounded-xl p-6"
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Thông tin cơ bản
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Tên danh mục <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .replace(/đ/g, "d")
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setFormData({ ...formData, name, slug });
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Nhập tên danh mục"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-purple-400 cursor-not-allowed"
                    placeholder="slug-tu-dong-tao"
                    disabled
                  />
                  <p className="text-xs text-purple-300 mt-1">
                    Slug sẽ được tự động tạo từ tên danh mục
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Mô tả về danh mục"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="💄"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status || "active"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "active" | "inactive",
                        })
                      }
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                    >
                      <option value="active" className="bg-gray-900">
                        Hoạt động
                      </option>
                      <option value="inactive" className="bg-gray-900">
                        Không hoạt động
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Thứ tự sắp xếp
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="galaxy-card rounded-xl p-6"
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Hình ảnh danh mục
              </h2>

              <div className="space-y-4">
                {imagePreview || formData.image ? (
                  <div className="relative">
                    <img
                      src={imagePreview || formData.image}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-purple-500/30"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors border border-red-400/50 backdrop-blur-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center bg-white/5 backdrop-blur-sm">
                    <Upload className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                    <p className="text-purple-200 mb-2">
                      Chọn ảnh cho danh mục
                    </p>
                    <label
                      htmlFor="category-image-upload"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-lg"
                      style={{
                        boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                      }}
                    >
                      {uploading ? "Đang upload..." : "Chọn ảnh"}
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="category-image-upload"
                  disabled={uploading}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-end gap-4"
            >
              <a
                href="/categories"
                className="px-6 py-2 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Hủy
              </a>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                style={{
                  boxShadow: "0 0 25px rgba(236, 72, 153, 0.5)",
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Đang tạo..." : "Tạo danh mục"}
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}
