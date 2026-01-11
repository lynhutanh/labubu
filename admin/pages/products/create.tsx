import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import {
  productService,
  categoryService,
  fileService,
} from "../../src/services";
import { CreateProductPayload } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";


export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<
    { url: string; type: "image" | "video" }[]
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    price: 0,
    stock: 0,
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

    // Load categories
    const loadData = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch {
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      }
    };

    loadData();
  }, [router, mounted]);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    setLoading(true);

    try {
      // Upload media trước nếu có chọn file
      let uploadedFileIds: string[] = [];
      if (selectedFiles.length > 0) {
        setUploading(true);
        toast.loading(`Đang upload ${selectedFiles.length} media...`, {
          id: "upload-media",
        });

        const uploadPromises = selectedFiles.map(async (file) => {
          const uploaded = await fileService.uploadProductMedia(file);
          return uploaded._id;
        });

        uploadedFileIds = await Promise.all(uploadPromises);
        toast.success(`Upload ${uploadedFileIds.length} media thành công!`, {
          id: "upload-media",
        });
        setUploading(false);
      }

      // Tạo product với fileIds đã upload
      const payload: any = { ...formData };

      if (uploadedFileIds.length > 0) {
        payload.fileIds = uploadedFileIds;
      }

      // Remove empty fields (SKU and Barcode are auto-generated on backend)
      if (!payload.slug) delete payload.slug;
      if (!payload.description) delete payload.description;
      if (!payload.shortDescription) delete payload.shortDescription;
      if (!payload.fileIds || payload.fileIds.length === 0)
        delete payload.fileIds;

      await productService.create(payload);
      toast.success("Tạo sản phẩm thành công!");
      router.push("/products");
    } catch (error: any) {
      let message = "Tạo sản phẩm thất bại. Vui lòng thử lại.";

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        message = Array.isArray(errorData) ? errorData.join(", ") : errorData;
      }

      toast.error(message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Store files for later upload
    const newFiles = Array.from(files);
    setSelectedFiles([...selectedFiles, ...newFiles]);

    // Create previews with type detection
    const newPreviews = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/")
        ? ("video" as const)
        : ("image" as const),
    }));
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    // Revoke URL to free memory
    if (mediaPreviews[index]) {
      URL.revokeObjectURL(mediaPreviews[index].url);
    }
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setMediaPreviews(newPreviews);
    setSelectedFiles(newFiles);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Tạo sản phẩm - Labubu Admin</title>
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
                href="/products"
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
                Tạo sản phẩm mới
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-8">
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
                    Tên sản phẩm <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      // Auto generate slug from name
                      const slug = name
                        .toLowerCase()
                        .replace(/đ/g, "d") // Handle Vietnamese đ character
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setFormData({ ...formData, name, slug });
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Nhập tên sản phẩm"
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
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-purple-400 cursor-not-allowed"
                    placeholder="slug-tu-dong-tao"
                  />
                  <p className="text-xs text-purple-300 mt-1">
                    Slug sẽ được tự động tạo từ tên sản phẩm
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Mô tả ngắn
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Mô tả ngắn gọn về sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Mô tả chi tiết về sản phẩm"
                  />
                </div>
              </div>
            </motion.div>

            {/* Category */}
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
                Danh mục
              </h2>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Danh mục <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                  required
                >
                  <option value="" className="bg-gray-900">
                    Chọn danh mục
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="bg-gray-900"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Product Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                Hình ảnh & Video sản phẩm
              </h2>
              <div className="space-y-4">
                {mediaPreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      {mediaPreviews.map((media, index) => (
                        <div key={index} className="relative">
                          {media.type === "video" ? (
                            <video
                              src={media.url}
                              className="w-full h-24 object-cover rounded-lg border border-purple-500/30"
                              muted
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-purple-500/30"
                            />
                          )}
                          {media.type === "video" && (
                            <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 text-white text-[10px] rounded">
                              VIDEO
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors border border-red-400/50 backdrop-blur-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {/* Add more button */}
                      <label
                        htmlFor="product-media-upload"
                        className="w-full h-24 border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400/60 transition-colors bg-white/5 backdrop-blur-sm"
                      >
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-purple-300 mx-auto" />
                          <span className="text-xs text-purple-300">
                            Thêm media
                          </span>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-purple-300">
                      Đã chọn {selectedFiles.length} file (
                      {mediaPreviews.filter((m) => m.type === "image").length}{" "}
                      ảnh,{" "}
                      {mediaPreviews.filter((m) => m.type === "video").length}{" "}
                      video). Sẽ được upload khi tạo sản phẩm.
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center bg-white/5 backdrop-blur-sm">
                    <Upload className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                    <p className="text-purple-200 mb-2">
                      Chọn ảnh hoặc video cho sản phẩm
                    </p>
                    <p className="text-xs text-purple-300 mb-4">
                      Hỗ trợ: JPG, PNG, GIF, WebP, MP4, MOV, AVI (Tối đa 500MB)
                    </p>
                    <label
                      htmlFor="product-media-upload"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-lg"
                      style={{
                        boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                      }}
                    >
                      Chọn media
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="product-media-upload"
                />
              </div>
            </motion.div>

            {/* Price & Stock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                Giá & Tồn kho
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Giá <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="VNĐ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-end gap-4"
            >
              <a
                href="/products"
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
                {loading || uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {uploading
                  ? "Đang upload media..."
                  : loading
                    ? "Đang tạo..."
                    : "Tạo sản phẩm"}
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}
