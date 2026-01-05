import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';
import { productService, categoryService, brandService, fileService } from '../../../src/services';
import { UpdateProductPayload, ProductResponse } from '../../../src/interfaces';
import { storage } from '../../../src/utils/storage';
import AdminLayout from '../../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';

const PRODUCT_TYPES = [
  { value: 'skincare', label: 'Chăm sóc da' },
  { value: 'makeup', label: 'Trang điểm' },
  { value: 'haircare', label: 'Chăm sóc tóc' },
  { value: 'bodycare', label: 'Chăm sóc cơ thể' },
  { value: 'fragrance', label: 'Nước hoa' },
  { value: 'tools', label: 'Dụng cụ' },
  { value: 'other', label: 'Khác' },
];

const SKIN_TYPES = [
  { value: 'all', label: 'Mọi loại da' },
  { value: 'oily', label: 'Da dầu' },
  { value: 'dry', label: 'Da khô' },
  { value: 'combination', label: 'Da hỗn hợp' },
  { value: 'sensitive', label: 'Da nhạy cảm' },
  { value: 'normal', label: 'Da thường' },
];

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
  const [brands, setBrands] = useState<any[]>([]);
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
    subcategorySlug: '',
    brandId: '',
    productType: 'other',
    price: 0,
    salePrice: 0,
    discountPercentage: 0,
    stock: 0,
    volume: '',
    weight: 0,
    ingredients: '',
    howToUse: '',
    skinType: [],
    origin: '',
    madeIn: '',
    expiryMonths: 24,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    featured: false,
    isNewArrival: false,
    status: 'active',
  });

  // Auto-calculate discount percentage when price or salePrice changes
  const calculateDiscount = (price: number, salePrice: number): number => {
    if (price > 0 && salePrice > 0 && salePrice < price) {
      return Math.round(((price - salePrice) / price) * 100);
    }
    return 0;
  };

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

        // Load product, categories, and brands in parallel
        const [product, cats, brandsList] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
          brandService.getAll(),
        ]);

        setCategories(cats);
        setBrands(brandsList);

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
            subcategorySlug: product.subcategorySlug || '',
            brandId: product.brandId?._id || product.brandId || '',
            productType: product.productType || 'other',
            price: product.price || 0,
            salePrice: product.salePrice || 0,
            discountPercentage: product.discountPercentage || 0,
            stock: product.stock || 0,
            volume: product.volume || '',
            weight: product.weight || 0,
            ingredients: product.ingredients || '',
            howToUse: product.howToUse || '',
            skinType: product.skinType || [],
            origin: product.origin || '',
            madeIn: product.madeIn || '',
            expiryMonths: product.expiryMonths || 24,
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
            metaKeywords: product.metaKeywords || [],
            featured: product.featured || false,
            isNewArrival: product.isNewArrival || false,
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Chỉnh sửa sản phẩm - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/products')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa sản phẩm
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, name, slug });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {PRODUCT_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả ngắn
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Category & Brand */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Danh mục & Nhãn hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhãn hàng
                  </label>
                  <select
                    value={formData.brandId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Chọn nhãn hàng</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Media */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hình ảnh & Video sản phẩm
              </h2>

              <div className="space-y-4">
                {/* Existing Media (Images & Videos) */}
                {existingFiles.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
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
                                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
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
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingFile(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
                    <p className="text-sm text-gray-600 mb-2">
                      Media mới ({newFilePreviews.length})
                      {newFileIds.length > 0 && (
                        <span className="text-green-600 ml-2">
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
                                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
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
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
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
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Chọn ảnh hoặc video để upload cho sản phẩm</p>
                  <p className="text-xs text-gray-500 mb-3">Hỗ trợ: JPG, PNG, GIF, WebP, MP4, MOV, AVI</p>
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
                    className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
                  >
                    Chọn ảnh/video
                  </label>
                </div>

                {/* Info about pending uploads */}
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    Đã chọn {selectedFiles.length} file mới. Sẽ được upload tự động khi lưu thay đổi.
                  </p>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết sản phẩm
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại sản phẩm
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) =>
                      setFormData({ ...formData, productType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá gốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      const discount = calculateDiscount(price, formData.salePrice || 0);
                      setFormData({ ...formData, price, discountPercentage: discount });
                    }}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="VNĐ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá khuyến mãi
                  </label>
                  <input
                    type="number"
                    value={formData.salePrice || ''}
                    onChange={(e) => {
                      const salePrice = parseFloat(e.target.value) || 0;
                      const discount = calculateDiscount(formData.price || 0, salePrice);
                      setFormData({ ...formData, salePrice, discountPercentage: discount });
                    }}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="VNĐ (để trống nếu không KM)"
                  />
                  {formData.salePrice && formData.salePrice > 0 && formData.salePrice >= (formData.price || 0) && (
                    <p className="text-xs text-red-500 mt-1">
                      Giá khuyến mãi phải nhỏ hơn giá gốc
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giảm giá
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.discountPercentage ? `${formData.discountPercentage}%` : '0%'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    {formData.discountPercentage && formData.discountPercentage > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-medium">
                        Tiết kiệm {(((formData.price || 0) - (formData.salePrice || 0))).toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tự động tính từ giá gốc và giá khuyến mãi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dung tích
                  </label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                    placeholder="50ml"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khối lượng (gram)
                  </label>
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại da phù hợp
                  </label>
                  <select
                    multiple
                    value={formData.skinType}
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      setFormData({ ...formData, skinType: selected });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    size={3}
                  >
                    {SKIN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Giữ Ctrl/Cmd để chọn nhiều
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin bổ sung
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phần
                  </label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hướng dẫn sử dụng
                  </label>
                  <textarea
                    value={formData.howToUse}
                    onChange={(e) =>
                      setFormData({ ...formData, howToUse: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xuất xứ
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) =>
                        setFormData({ ...formData, origin: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nơi sản xuất
                    </label>
                    <input
                      type="text"
                      value={formData.madeIn}
                      onChange={(e) =>
                        setFormData({ ...formData, madeIn: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn sử dụng (tháng)
                    </label>
                    <input
                      type="number"
                      value={formData.expiryMonths}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiryMonths: parseInt(e.target.value) || 24,
                        })
                      }
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Sản phẩm nổi bật</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) =>
                        setFormData({ ...formData, isNewArrival: e.target.checked })
                      }
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Sản phẩm mới</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin SEO
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, metaDescription: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.metaKeywords?.join(', ') || ''}
                    onChange={(e) => {
                      const keywords = e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter((k) => k.length > 0);
                      setFormData({ ...formData, metaKeywords: keywords });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {uploading ? 'Đang upload media...' : loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}





