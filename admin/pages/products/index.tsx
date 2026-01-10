import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { productService } from "../../src/services";
import { ProductResponse } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
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

    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error: any) {
      toast.error(
        `Không thể tải danh sách sản phẩm: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      return;
    }

    try {
      await productService.delete(id);
      toast.success("Xóa sản phẩm thành công");
      await loadProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Xóa sản phẩm thất bại";
      toast.error(message);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/products/update/${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getBrandName = (brand: any): string => {
    if (!brand) return "";
    if (typeof brand === "string") return brand;
    if (typeof brand === "object" && brand.name) return brand.name;
    return "";
  };

  const getDisplayImage = (product: ProductResponse) => {
    if (product.coverImage) {
      return product.coverImage;
    }

    if (product.files && product.files.length > 0) {
      // Find first image file
      const firstImageFile = product.files.find(
        (f: any) =>
          f.mimeType?.startsWith("image/") || f.type?.startsWith("image/"),
      );
      if (firstImageFile?.url) {
        return firstImageFile.url;
      }

      // If first file is video, use its thumbnail
      const firstFile = product.files[0];
      if (firstFile) {
        const isVideo =
          firstFile.mimeType?.startsWith("video/") ||
          firstFile.type?.startsWith("video/");
        if (isVideo && firstFile.thumbnailUrl) {
          return firstFile.thumbnailUrl;
        }
      }
    }

    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  const filteredProducts = products.filter((product) => {
    const brandName = getBrandName(product.brand);
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Sản phẩm - Cosmetics Admin</title>
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
                Sản phẩm
              </h1>
              <a
                href="/products/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all shadow-lg"
                style={{
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                }}
              >
                <Plus className="w-5 h-5" />
                Tạo sản phẩm
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
                placeholder="Tìm kiếm sản phẩm theo tên, SKU hoặc thương hiệu..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="mt-4 text-purple-200">Đang tải...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <Package className="w-16 h-16 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chưa có sản phẩm nào</p>
              <a
                href="/products/create"
                className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
                style={{
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                }}
              >
                Tạo sản phẩm đầu tiên
              </a>
            </div>
          ) : (
            <div className="galaxy-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className="border-b border-purple-500/30"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hình ảnh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thương hiệu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tồn kho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/20">
                    {filteredProducts.map((product, index) => {
                      const displayImage = getDisplayImage(product);
                      return (
                        <tr
                          key={product._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white max-w-xs truncate">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-purple-200">
                              {getBrandName(product.brand) || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-purple-200">
                              {product.category?.name || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="text-sm font-medium"
                              style={{
                                background:
                                  "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                              }}
                            >
                              {formatPrice(product.price)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.salePrice ? (
                              <span
                                className="text-sm font-medium"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #ec4899, #f97316)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }}
                              >
                                {formatPrice(product.salePrice)}
                              </span>
                            ) : (
                              <span className="text-sm text-purple-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${(product.stock || 0) > 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {product.stock ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-purple-300 font-mono">
                              {product.sku || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(product._id)}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all border border-blue-500/30"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(product._id, product.name)
                                }
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/30"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
