import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus, Edit, Trash2, Search, FolderTree } from "lucide-react";
import { categoryService } from "../../src/services";
import { CategoryResponse } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    loadCategories();
  }, [router]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error: any) {
      toast.error(
        `Không thể tải danh sách danh mục: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      return;
    }

    try {
      await categoryService.delete(id);
      toast.success("Xóa danh mục thành công");
      await loadCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Xóa danh mục thất bại";
      toast.error(message);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/categories/update/${id}`);
  };

  const filteredCategories = categories.filter((category) => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Danh mục - Labubu Admin</title>
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
                Danh mục
              </h1>
              <a
                href="/categories/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all shadow-lg"
                style={{
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                }}
              >
                <Plus className="w-5 h-5" />
                Tạo danh mục
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="mt-4 text-purple-200">Đang tải...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <FolderTree className="w-16 h-16 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chưa có danh mục nào</p>
              <a
                href="/categories/create"
                className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
                style={{
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                }}
              >
                Tạo danh mục đầu tiên
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div key={category._id} className="galaxy-card rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
                        style={{
                          boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                        }}
                      >
                        <FolderTree className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-purple-300 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(category._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-2" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.name)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
