import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { brandService, fileService } from '../../src/services';
import { CreateBrandPayload } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';

const BRAND_STATUS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
];

export default function CreateBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<CreateBrandPayload>({
    name: '',
    slug: '',
    description: '',
    website: '',
    origin: '',
    status: 'active',
    sortOrder: 0,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('Vui lòng nhập tên nhãn hàng');
      return;
    }

    setLoading(true);

    try {
      // Upload logo trước nếu có chọn file
      let uploadedFileId: string | undefined;
      if (logoFile) {
        setUploading(true);
        toast.loading('Đang upload logo...', { id: 'upload-logo' });
        const uploadedFile = await fileService.uploadBrandLogo(logoFile);
        uploadedFileId = uploadedFile._id;
        toast.success('Upload logo thành công!', { id: 'upload-logo' });
        setUploading(false);
      }

      // Tạo brand với fileId đã upload
      const payload: CreateBrandPayload = {
        ...formData,
        name: formData.name.trim(),
      };

      if (uploadedFileId) {
        payload.fileId = uploadedFileId;
      }

      // Remove empty fields
      Object.keys(payload).forEach((key) => {
        const value = (payload as any)[key];
        if (value === '' || value === undefined || value === null) {
          delete (payload as any)[key];
        }
      });

      await brandService.create(payload);
      toast.success('Tạo nhãn hàng thành công!');
      router.push('/brands');
    } catch (error: any) {
      console.error('Error creating brand:', error);
      const message = error.response?.data?.message || error.message || 'Tạo nhãn hàng thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Tạo nhãn hàng - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <a
                href="/brands"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo nhãn hàng mới
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Logo nhãn hàng
              </h2>

              <div className="space-y-4">
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Logo đã chọn</p>
                      <p className="text-xs text-gray-400">Sẽ được upload khi tạo nhãn hàng</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">Chọn logo cho nhãn hàng</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="brand-logo-upload"
                    />
                    <label
                      htmlFor="brand-logo-upload"
                      className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
                    >
                      Chọn ảnh
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin nhãn hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên nhãn hàng <span className="text-red-500">*</span>
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
                    placeholder="Ví dụ: L'Oreal, Maybelline, The Ordinary..."
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="slug-tu-dong-tao"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Slug sẽ được tự động tạo từ tên nhãn hàng
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Mô tả ngắn về nhãn hàng..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xuất xứ
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Ví dụ: Pháp, Hàn Quốc..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      {BRAND_STATUS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <a
                href="/brands"
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
                {uploading ? 'Đang upload logo...' : loading ? 'Đang tạo...' : 'Tạo nhãn hàng'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}
