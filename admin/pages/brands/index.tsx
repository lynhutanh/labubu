import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Edit, Trash2, Search, Tag, X, Image as ImageIcon } from 'lucide-react';
import { brandService, fileService } from '../../src/services';
import { Brand, UpdateBrandPayload } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';

const BRAND_STATUS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
];

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit form data
  const [editForm, setEditForm] = useState<UpdateBrandPayload>({
    name: '',
    description: '',
    website: '',
    origin: '',
    status: 'active',
    sortOrder: 0,
  });
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    loadBrands();
  }, [router]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Không thể tải danh sách nhãn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhãn hàng "${name}"?`)) {
      return;
    }

    try {
      await brandService.delete(id);
      toast.success('Xóa nhãn hàng thành công');
      await loadBrands();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      const message = error.response?.data?.message || error.message || 'Xóa nhãn hàng thất bại';
      toast.error(message);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setEditForm({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      origin: brand.origin || '',
      status: brand.status || 'active',
      sortOrder: brand.sortOrder || 0,
    });
    setEditLogoPreview(brand.logo?.url || null);
    setEditLogoFile(null);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingBrand(null);
    setEditForm({
      name: '',
      description: '',
      website: '',
      origin: '',
      status: 'active',
      sortOrder: 0,
    });
    setEditLogoPreview(null);
    setEditLogoFile(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditLogoFile(file);
      setEditLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingBrand || !editForm.name?.trim()) {
      toast.error('Vui lòng nhập tên nhãn hàng');
      return;
    }

    setSaving(true);
    try {
      let fileId = editingBrand.fileId;

      // Upload new logo if selected
      if (editLogoFile) {
        setUploading(true);
        const uploadedFile = await fileService.uploadBrandLogo(editLogoFile);
        fileId = uploadedFile._id;
        setUploading(false);
      }

      const payload: UpdateBrandPayload = {
        ...editForm,
        fileId,
      };

      await brandService.update(editingBrand._id, payload);
      toast.success('Cập nhật nhãn hàng thành công');
      await loadBrands();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error updating brand:', error);
      const message = error.response?.data?.message || error.message || 'Cập nhật nhãn hàng thất bại';
      toast.error(message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Nhãn hàng - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Nhãn hàng</h1>
              <a
                href="/brands/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Tạo nhãn hàng
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
                placeholder="Tìm kiếm nhãn hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Brands Table */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Chưa có nhãn hàng nào</p>
              <a
                href="/brands/create"
                className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Tạo nhãn hàng đầu tiên
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên nhãn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Xuất xứ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBrands.map((brand, index) => (
                      <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {brand.logo?.url ? (
                            <img
                              src={brand.logo.url}
                              alt={brand.name}
                              className="w-10 h-10 object-contain rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Tag className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {brand.name}
                            </span>
                            {brand.website && (
                              <a
                                href={brand.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-500 hover:underline"
                              >
                                {brand.website}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.origin || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              brand.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {brand.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(brand)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(brand._id, brand.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Chỉnh sửa nhãn hàng
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {editLogoPreview ? (
                        <img
                          src={editLogoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="edit-logo-upload"
                      />
                      <label
                        htmlFor="edit-logo-upload"
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        Chọn logo
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên nhãn hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Nhập tên nhãn hàng"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Mô tả ngắn về nhãn hàng"
                    />
                  </div>

                  {/* Website & Origin */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xuất xứ
                      </label>
                      <input
                        type="text"
                        value={editForm.origin}
                        onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Ví dụ: Hàn Quốc"
                      />
                    </div>
                  </div>

                  {/* Status & Sort Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                        Thứ tự
                      </label>
                      <input
                        type="number"
                        value={editForm.sortOrder}
                        onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving || uploading || !editForm.name?.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Đang upload...' : saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
