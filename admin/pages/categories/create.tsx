import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { categoryService } from "../../src/services";
import { CreateCategoryPayload } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: "",
    status: "active",
    sortOrder: 0,
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Nhập tên danh mục"
                    required
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
                      Thứ tự
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
                disabled={loading}
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
