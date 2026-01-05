import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Edit, Trash2, Search, Package, Image as ImageIcon } from 'lucide-react';
import { productService } from '../../src/services';
import { ProductResponse } from '../../src/interfaces';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import toast from 'react-hot-toast';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const user = storage.getUser();
        if (!user) {
            router.push('/login');
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
            toast.error(`Không thể tải danh sách sản phẩm: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`);
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
            toast.success('Xóa sản phẩm thành công');
            await loadProducts();
        } catch (error: any) {
            console.error('Error deleting product:', error);
            const message = error.response?.data?.message || error.message || 'Xóa sản phẩm thất bại';
            toast.error(message);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/products/update/${id}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getBrandName = (brand: any): string => {
        if (!brand) return '';
        if (typeof brand === 'string') return brand;
        if (typeof brand === 'object' && brand.name) return brand.name;
        return '';
    };

    const getDisplayImage = (product: ProductResponse) => {
        if (product.coverImage) {
            return product.coverImage;
        }

        if (product.files && product.files.length > 0) {
            // Find first image file
            const firstImageFile = product.files.find(
                (f: any) => f.mimeType?.startsWith('image/') || f.type?.startsWith('image/')
            );
            if (firstImageFile?.url) {
                return firstImageFile.url;
            }

            // If first file is video, use its thumbnail
            const firstFile = product.files[0];
            if (firstFile) {
                const isVideo = firstFile.mimeType?.startsWith('video/') || firstFile.type?.startsWith('video/');
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
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                            <a
                                href="/products/create"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm theo tên, SKU hoặc thương hiệu..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {/* Products Table */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Đang tải...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto" />
                            <p className="mt-4 text-gray-500">Chưa có sản phẩm nào</p>
                            <a
                                href="/products/create"
                                className="inline-block mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                            >
                                Tạo sản phẩm đầu tiên
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
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProducts.map((product, index) => {
                                            const displayImage = getDisplayImage(product);
                                            return (
                                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                            {product.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {getBrandName(product.brand) || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {product.category?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {product.salePrice ? (
                                                            <span className="text-sm font-medium text-pink-600">
                                                                {formatPrice(product.salePrice)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-sm font-medium ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {product.stock ?? 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 font-mono">
                                                            {product.sku || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(product._id)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product._id, product.name)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
