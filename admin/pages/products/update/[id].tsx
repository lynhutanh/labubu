import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';
import { productService, categoryService, fileService } from '../../../src/services';
import { UpdateProductPayload, ProductResponse } from '../../../src/interfaces';
import { storage } from '../../../src/utils/storage';
import AdminLayout from '../../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';


const PRODUCT_STATUS = [
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'out_of_stock', label: 'Hết hàng' },
];

interface ExistingFile {
  _id: string;
  url: string;
  path?: string;
  mimeType?: string;
  type?: string;
  thumbnailUrl?: string;
  name?: string;
}

export default function UpdateProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Existing uploaded files (from server)
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  // New files pending upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  // New file IDs after upload
  const [newFileIds, setNewFileIds] = useState<string[]>([]);

  const [formData, setFormData] = useState<UpdateProductPayload>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    status: 'active',
  });


  useEffect(() => {
    setMounted(true);
  }, []);

  // Load product data
  useEffect(() => {
    if (!mounted || !id || typeof id !== 'string') return;

    const user = storage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setPageLoading(true);

        // Load product and categories in parallel
        const [product, cats] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
        ]);

        setCategories(cats);

        if (product) {
          // Extract existing files
          const files: ExistingFile[] = [];
          if (product.files && Array.isArray(product.files)) {
            product.files.forEach((file: any) => {
              if (file._id && file.url) {
                files.push({
                  _id: file._id,
                  url: file.url,
                  path: file.path,
                  mimeType: file.mimeType,
                  type: file.type,
                  thumbnailUrl: file.thumbnailUrl,
                  name: file.name,
                });
              }
            });
          }
          setExistingFiles(files);

          // Populate form data
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            categoryId: product.categoryId?._id || product.categoryId || '',
            price: product.price || 0,
            salePrice: product.salePrice || 0,
            stock: product.stock || 0,
            status: product.status || 'active',
          });
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
        router.push('/products');
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [id, mounted, router]);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || typeof id !== 'string') return;

    setLoading(true);

    try {
      // Upload new files first if any selected files haven't been uploaded yet
      let uploadedFileIds: string[] = [...newFileIds];
      const filesToUpload = selectedFiles.filter((_, index) => !newFileIds[index]);
      
      if (filesToUpload.length > 0) {
        setUploading(true);
        toast.loading(`Đang upload ${filesToUpload.length} media...`, { id: 'upload-media' });
        
        const uploadPromises = filesToUpload.map(async (file) => {
          const uploaded = await fileService.uploadProductMedia(file);
          return uploaded._id;
        });

        const newUploadedIds = await Promise.all(uploadPromises);
        uploadedFileIds = [...uploadedFileIds, ...newUploadedIds];
        toast.success(`Upload ${newUploadedIds.length} media thành công!`, { id: 'upload-media' });
        setUploading(false);
      }

      // Combine existing file IDs with newly uploaded file IDs
      const allFileIds = [
        ...existingFiles.map((f) => f._id),
        ...uploadedFileIds,
      ];

      const payload: UpdateProductPayload = {
        ...formData,
        fileIds: allFileIds.length > 0 ? allFileIds : undefined,
      };

      // Clean up empty/undefined fields
      Object.keys(payload).forEach((key) => {
        const value = (payload as any)[key];
        if (value === '' || value === undefined || value === null) {
          delete (payload as any)[key];
        }
        if (Array.isArray(value) && value.length === 0) {
          delete (payload as any)[key];
        }
        if (typeof value === 'number' && value === 0 && !['price', 'stock'].includes(key)) {
          delete (payload as any)[key];
        }
      });

      await productService.update(id, payload);
      toast.success('Cập nhật sản phẩm thành công!');
      router.push('/products');
    } catch (error: any) {
      let message = 'Cập nhật sản phẩm thất bại. Vui lòng thử lại.';

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        message = Array.isArray(errorData) ? errorData.join(', ') : errorData;
      }

      toast.error(message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles([...selectedFiles, ...newFiles]);

    // Create previews for new files
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setNewFilePreviews([...newFilePreviews, ...newPreviews]);
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(newFilePreviews[index]);

    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setNewFilePreviews(newFilePreviews.filter((_, i) => i !== index));
    setNewFileIds(newFileIds.filter((_, i) => i !== index));
  };

  if (pageLoading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
            <p className="mt-4 text-purple-200">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Cập nhật sản phẩm - Labubu Admin</title>
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
                Cập nhật sản phẩm
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
                    value={formData.shortDescription || ""}
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
                    value={formData.description || ""}
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
                Hình ảnh & Video sản phẩm
              </h2>

              <div className="space-y-4">
                {/* Existing Media (Images & Videos) */}
                {existingFiles.length > 0 && (
                  <div>
                    <p className="text-sm text-purple-200 mb-2">
                      Media hiện tại ({existingFiles.length})
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {existingFiles.map((file, index) => {
                        const isVideo = file.mimeType?.startsWith('video/') || file.type?.startsWith('video/');
                        const displayUrl = isVideo ? (file.thumbnailUrl || file.url) : file.url;

                        return (
                          <div key={file._id} className="relative">
                            {isVideo ? (
                              <>
                                <img
                                  src={displayUrl}
                                  alt={file.name || `Video ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-purple-500/30"
                                />
                                {/* Video indicator */}
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                  Video
                                </div>
                              </>
                            ) : (
                              <img
                                src={displayUrl}
                                alt={`Image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-purple-500/30"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingFile(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors border border-red-400/50 backdrop-blur-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Media Preview */}
                {newFilePreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-purple-200 mb-2">
                      Media mới ({newFilePreviews.length})
                      {newFileIds.length > 0 && (
                        <span className="text-green-400 ml-2">
                          - Đã upload {newFileIds.length} file
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {newFilePreviews.map((preview, index) => {
                        const file = selectedFiles[index];
                        const isVideo = file?.type?.startsWith('video/');

                        return (
                          <div key={index} className="relative">
                            {isVideo ? (
                              <>
                                <video
                                  src={preview}
                                  className="w-full h-24 object-cover rounded-lg border border-purple-500/30"
                                  muted
                                />
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                  Video
                                </div>
                              </>
                            ) : (
                              <img
                                src={preview}
                                alt={`New ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-purple-500/30"
                              />
                            )}
                            {newFileIds[index] && (
                              <div className="absolute top-1 left-1 p-1 bg-green-500 text-white rounded-full">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNewFile(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors border border-red-400/50 backdrop-blur-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center bg-white/5 backdrop-blur-sm">
                  <Upload className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <p className="text-purple-200 mb-3">Chọn ảnh hoặc video để upload cho sản phẩm</p>
                  <p className="text-xs text-purple-300 mb-3">Hỗ trợ: JPG, PNG, GIF, WebP, MP4, MOV, AVI (Tối đa 500MB)</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="product-media-upload"
                  />
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

                {/* Info about pending uploads */}
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-purple-300 text-center">
                    Đã chọn {selectedFiles.length} file mới. Sẽ được upload tự động khi lưu thay đổi.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Price & Stock */}
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
                    Giá khuyến mãi
                  </label>
                  <input
                    type="number"
                    value={formData.salePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="VNĐ (để trống nếu không KM)"
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
                    ? "Đang cập nhật..."
                    : "Cập nhật sản phẩm"}
              </button>
            </motion.div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}





