import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { categoryService } from '../../src/services';
import { CreateCategoryPayload, CreateSubcategoryPayload } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<CreateSubcategoryPayload[]>([]);
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    status: 'active',
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Remove empty optional fields
      const payload: any = { ...formData };

      if (!payload.slug || payload.slug.trim() === '') delete payload.slug;
      if (!payload.description || payload.description.trim() === '') delete payload.description;
      if (!payload.icon || payload.icon.trim() === '') delete payload.icon;

      // Add subcategories if any
      if (subcategories.length > 0) {
        payload.subcategories = subcategories.map(sub => {
          const subPayload: any = { ...sub };
          if (!subPayload.slug || subPayload.slug.trim() === '') delete subPayload.slug;
          if (!subPayload.description || subPayload.description.trim() === '') delete subPayload.description;
          if (!subPayload.status) subPayload.status = 'active';
          if (subPayload.sortOrder === undefined) subPayload.sortOrder = 0;
          return subPayload;
        });
      }

      await categoryService.create(payload);
      toast.success('Tạo danh mục thành công!');
      router.push('/categories');
    } catch (error: any) {
      let message = 'Tạo danh mục thất bại. Vui lòng thử lại.';

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
    }
  };

  // Auto generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };


  const addSubcategory = () => {
    setSubcategories([
      ...subcategories,
      {
        name: '',
        slug: '',
        description: '',
        status: 'active',
        sortOrder: 0,
      },
    ]);
  };

  const removeSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const updateSubcategory = (index: number, field: keyof CreateSubcategoryPayload, value: any) => {
    const updated = [...subcategories];
    updated[index] = { ...updated[index], [field]: value };

    // Auto generate slug from name
    if (field === 'name') {
      updated[index].slug = generateSlug(value);
    }

    setSubcategories(updated);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Tạo danh mục - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <a
                href="/categories"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo danh mục mới
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    placeholder="Ví dụ: Trang điểm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="trang-diem"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Slug sẽ được tự động tạo từ tên danh mục
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Mô tả về danh mục này..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="💄"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập emoji để hiển thị icon cho danh mục
                  </p>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Danh mục con (Tùy chọn)
                </h2>
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm danh mục con
                </button>
              </div>

              {subcategories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có danh mục con nào. Nhấn "Thêm danh mục con" để thêm.
                </p>
              ) : (
                <div className="space-y-4">
                  {subcategories.map((subcategory, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Danh mục con #{index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeSubcategory(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tên danh mục con <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={subcategory.name}
                            onChange={(e) => updateSubcategory(index, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Ví dụ: Son môi"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={subcategory.slug}
                            onChange={(e) => updateSubcategory(index, 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="son-moi"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Mô tả
                          </label>
                          <textarea
                            value={subcategory.description || ''}
                            onChange={(e) => updateSubcategory(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Mô tả về danh mục con..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Trạng thái
                          </label>
                          <select
                            value={subcategory.status}
                            onChange={(e) => updateSubcategory(index, 'status', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Thứ tự sắp xếp
                          </label>
                          <input
                            type="number"
                            value={subcategory.sortOrder}
                            onChange={(e) => updateSubcategory(index, 'sortOrder', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cài đặt bổ sung
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <a
                href="/categories"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </a>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Đang tạo...' : 'Tạo danh mục'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}

