import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { storage } from '../../src/utils/storage';
import AdminLayout from '../../src/components/layout/AdminLayout';
import { orderService } from '../../src/services/order.service';
import { userService } from '../../src/services/user.service';
import { brandService } from '../../src/services/brand.service';
import { productService } from '../../src/services/product.service';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    brands: 0,
    revenue: 0,
  });

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [orderStats, brandStats, productStats, userResponse] = await Promise.all([
        orderService.getStats().catch(() => ({ totalOrders: 0, totalRevenue: 0 })),
        brandService.getStats().catch(() => ({ totalBrands: 0 })),
        productService.getStats().catch(() => ({ totalProducts: 0 })),
        userService.search({ limit: 1, offset: 0 }).catch(() => ({ total: 0 })),
      ]);

      setStats({
        products: productStats?.totalProducts || 0,
        orders: orderStats?.totalOrders || 0,
        users: userResponse?.total || 0,
        brands: brandStats?.totalBrands || 0,
        revenue: orderStats?.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Dashboard | Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-pink-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Chào mừng đến với Cosmetics Admin! 🎉
            </h2>
            <p className="text-gray-600">
              Hệ thống quản lý nền tảng mỹ phẩm của bạn đã sẵn sàng.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">💄</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 opacity-20" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Sản phẩm</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.products.toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📦</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-20" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Đơn hàng</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.orders.toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">👥</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Khách hàng</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.users.toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🏷️</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-20" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Thương hiệu</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.brands.toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">💰</span>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-20" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Doanh thu</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.revenue.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Bắt đầu nhanh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/products/create"
                className="p-4 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white font-medium hover:opacity-90 transition-opacity text-center"
              >
                ➕ Thêm sản phẩm
              </a>
              <a
                href="/settings"
                className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity text-center"
              >
                ⚙️ Cài đặt
              </a>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}

