import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Edit, Trash2, Search, Folder } from 'lucide-react';
import { categoryService } from '../../src/services/category.service';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import DataTable, { Column } from '../../src/components/common/DataTable';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  status?: string;
  sortOrder?: number;
  [key: string]: any;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      router.push('/login');
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
      toast.error(`Không thể tải danh sách danh mục: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`);
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
      toast.success('Xóa danh mục thành công');
      await loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.message || error.message || 'Xóa danh mục thất bại';
      toast.error(message);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Head>
        <title>Danh mục - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
              <a
                href="/categories/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Categories Table */}
          <DataTable
            columns={[
              {
                key: 'icon',
                label: 'Icon',
                render: (category) => (
                  <div className="flex items-center gap-2">
                    {category.icon ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <Folder className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                ),
              },
              {
                key: 'name',
                label: 'Tên danh mục',
                render: (category) => (
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.slug}
                    </div>
                  </div>
                ),
              },
              {
                key: 'description',
                label: 'Mô tả',
                render: (category) => (
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {category.description || '-'}
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Trạng thái',
                render: (category) => (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      category.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                ),
              },
              {
                key: 'sortOrder',
                label: 'Thứ tự',
                render: (category) => (
                  <span className="text-sm text-gray-600">
                    {category.sortOrder}
                  </span>
                ),
              },
              {
                key: 'subcategories',
                label: 'Danh mục con',
                render: (category) => (
                  <span className="text-sm text-gray-600">
                    {category.subcategories?.length || 0}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Thao tác',
                align: 'right',
                render: (category) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/categories/update/${category._id}`);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category._id, category.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredCategories}
            loading={loading}
            emptyMessage="Chưa có danh mục nào"
            emptyIcon={<Folder className="w-16 h-16 text-gray-300 mx-auto" />}
            emptyAction={
              <a
                href="/categories/create"
                className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Tạo danh mục đầu tiên
              </a>
            }
            keyExtractor={(category) => category._id}
          />
        </main>
      </div>
    </AdminLayout>
  );
}

