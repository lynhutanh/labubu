import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { productService, categoryService, brandService, fileService } from '../../src/services';
import { CreateProductPayload } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
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

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<CreateProductPayload>({
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
    isNewArrival: true,
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

  // Load brands whenever component mounts or when window gets focus
  useEffect(() => {
    if (!mounted) return;

    const loadBrands = async () => {
      try {
        const brandsList = await brandService.getAll();
        setBrands(brandsList);
      } catch (error) {
        console.error('Error loading brands:', error);
      }
    };

    loadBrands();

    // Reload brands when window gets focus (user might have added brands in another tab)
    const handleFocus = () => {
      loadBrands();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const user = storage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Load categories
    const loadData = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch (error) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại.');
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
    if (!formData.brandId) {
      toast.error('Vui lòng chọn nhãn hàng');
      return;
    }

    setLoading(true);

    try {
      // Upload media trước nếu có chọn file
      let uploadedFileIds: string[] = [];
      if (selectedFiles.length > 0) {
        setUploading(true);
        toast.loading(`Đang upload ${selectedFiles.length} media...`, { id: 'upload-media' });
        
        const uploadPromises = selectedFiles.map(async (file) => {
          const uploaded = await fileService.uploadProductMedia(file);
          return uploaded._id;
        });

        uploadedFileIds = await Promise.all(uploadPromises);
        toast.success(`Upload ${uploadedFileIds.length} media thành công!`, { id: 'upload-media' });
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
      if (!payload.subcategorySlug) delete payload.subcategorySlug;
      if (!payload.brandId) delete payload.brandId;
      if (!payload.salePrice || payload.salePrice === 0) {
        delete payload.salePrice;
        delete payload.discountPercentage;
      }
      if (!payload.fileIds || payload.fileIds.length === 0) delete payload.fileIds;
      if (!payload.ingredients) delete payload.ingredients;
      if (!payload.howToUse) delete payload.howToUse;
      if (!payload.volume) delete payload.volume;
      if (!payload.weight) delete payload.weight;
      if (!payload.skinType || payload.skinType.length === 0) delete payload.skinType;
      if (!payload.origin) delete payload.origin;
      if (!payload.madeIn) delete payload.madeIn;
      if (!payload.metaTitle) delete payload.metaTitle;
      if (!payload.metaDescription) delete payload.metaDescription;
      if (!payload.metaKeywords || payload.metaKeywords.length === 0) delete payload.metaKeywords;

      await productService.create(payload);
      toast.success('Tạo sản phẩm thành công!');
      router.push('/products');
    } catch (error: any) {
      let message = 'Tạo sản phẩm thất bại. Vui lòng thử lại.';

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        message = Array.isArray(errorData)
          ? errorData.join(', ')
          : errorData;
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
    const newPreviews = newFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
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
        <title>Tạo sản phẩm - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo sản phẩm mới
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
                      // Auto generate slug from name
                      const slug = name
                        .toLowerCase()
                        .replace(/đ/g, 'd') // Handle Vietnamese đ character
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
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="slug-tu-dong-tao"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Slug sẽ được tự động tạo từ tên sản phẩm
                  </p>
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
                    Nhãn hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.brandId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, brandId: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      <option value="">Chọn nhãn hàng</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const brandsList = await brandService.getAll();
                          setBrands(brandsList);
                          toast.success('Đã tải lại danh sách nhãn hàng');
                        } catch (error) {
                          toast.error('Không thể tải lại danh sách nhãn hàng');
                        }
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Tải lại danh sách"
                    >
                      🔄
                    </button>
                  </div>
                  {brands.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Chưa có nhãn hàng. <a href="/brands/create" className="text-pink-600 hover:underline">Tạo nhãn hàng mới</a>
                    </p>
                  )}
                  {brands.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Có {brands.length} nhãn hàng. <a href="/brands/create" className="text-pink-600 hover:underline">Thêm mới</a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Media */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hình ảnh & Video sản phẩm
              </h2>
              <div className="space-y-4">
                {mediaPreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      {mediaPreviews.map((media, index) => (
                        <div key={index} className="relative">
                          {media.type === 'video' ? (
                            <video
                              src={media.url}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              muted
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                          {media.type === 'video' && (
                            <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 text-white text-[10px] rounded">
                              VIDEO
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {/* Add more button */}
                      <label
                        htmlFor="product-media-upload"
                        className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                          <span className="text-xs text-gray-500">Thêm media</span>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-400">
                      Đã chọn {selectedFiles.length} file ({mediaPreviews.filter(m => m.type === 'image').length} ảnh, {mediaPreviews.filter(m => m.type === 'video').length} video). Sẽ được upload khi tạo sản phẩm.
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Chọn ảnh hoặc video cho sản phẩm
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Hỗ trợ: JPG, PNG, GIF, WebP, MP4, MOV, AVI (Tối đa 500MB)
                    </p>
                    <label
                      htmlFor="product-media-upload"
                      className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
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
                  {formData.salePrice > 0 && formData.salePrice >= formData.price && (
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
                    {formData.discountPercentage > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-medium">
                        Tiết kiệm {((formData.price - formData.salePrice)).toLocaleString('vi-VN')}₫
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
                      setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
                    }
                    min="0"
                    placeholder="100"
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
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
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
                        setFormData({ ...formData, expiryMonths: parseInt(e.target.value) || 24 })
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
                    placeholder="Tiêu đề SEO"
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
                    placeholder="Mô tả SEO"
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
                        .map(k => k.trim())
                        .filter(k => k.length > 0);
                      setFormData({ ...formData, metaKeywords: keywords });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <a
                href="/products"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </a>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {uploading ? 'Đang upload media...' : loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}

