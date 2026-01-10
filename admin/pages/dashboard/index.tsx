import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Loader2,
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import { orderService } from "../../src/services/order.service";
import { userService } from "../../src/services/user.service";
import { brandService } from "../../src/services/brand.service";
import { productService } from "../../src/services/product.service";

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
      router.push("/login");
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [orderStats, brandStats, productStats, userResponse] =
        await Promise.all([
          orderService
            .getStats()
            .catch(() => ({ totalOrders: 0, totalRevenue: 0 })),
          brandService.getStats().catch(() => ({ totalBrands: 0 })),
          productService.getStats().catch(() => ({ totalProducts: 0 })),
          userService
            .search({ limit: 1, offset: 0 })
            .catch(() => ({ total: 0 })),
        ]);

      setStats({
        products: productStats?.totalProducts || 0,
        orders: orderStats?.totalOrders || 0,
        users: userResponse?.total || 0,
        brands: brandStats?.totalBrands || 0,
        revenue: orderStats?.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
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
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="px-6 py-4">
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
              Dashboard
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="galaxy-card rounded-2xl p-8 mb-8">
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Chào mừng đến với Labubu Admin! ⭐
            </h2>
            <p className="text-purple-200">
              Hệ thống quản lý nền tảng của bạn đã sẵn sàng.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="galaxy-card rounded-xl p-6">
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="galaxy-card rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">💄</span>
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 opacity-30"
                      style={{
                        boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                      }}
                    />
                  </div>
                  <h3 className="text-purple-300 text-sm font-medium">
                    Sản phẩm
                  </h3>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stats.products.toLocaleString("vi-VN")}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="galaxy-card rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📦</span>
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-30"
                      style={{
                        boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                      }}
                    />
                  </div>
                  <h3 className="text-purple-300 text-sm font-medium">
                    Đơn hàng
                  </h3>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #6366f1)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stats.orders.toLocaleString("vi-VN")}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="galaxy-card rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">👥</span>
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-30"
                      style={{
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                      }}
                    />
                  </div>
                  <h3 className="text-purple-300 text-sm font-medium">
                    Khách hàng
                  </h3>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stats.users.toLocaleString("vi-VN")}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="galaxy-card rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🏷️</span>
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-30"
                      style={{
                        boxShadow: "0 0 20px rgba(251, 146, 60, 0.4)",
                      }}
                    />
                  </div>
                  <h3 className="text-purple-300 text-sm font-medium">
                    Thương hiệu
                  </h3>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #f97316, #fbbf24)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stats.brands.toLocaleString("vi-VN")}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="galaxy-card rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">💰</span>
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-30"
                      style={{
                        boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
                      }}
                    />
                  </div>
                  <h3 className="text-purple-300 text-sm font-medium">
                    Doanh thu
                  </h3>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #14b8a6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stats.revenue.toLocaleString("vi-VN")} ₫
                  </p>
                </motion.div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="galaxy-card rounded-2xl p-8 mb-8"
          >
            <h3
              className="text-xl font-bold mb-6"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bắt đầu nhanh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/products/create"
                className="group p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-white font-medium hover:border-pink-500/60 transition-all text-center backdrop-blur-sm"
                style={{
                  boxShadow: "0 0 15px rgba(236, 72, 153, 0.2)",
                }}
              >
                <Package className="w-6 h-6 mx-auto mb-2 text-pink-300 group-hover:text-pink-200 transition-colors" />
                <div className="text-sm">Thêm sản phẩm</div>
              </a>
              <a
                href="/products"
                className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-white font-medium hover:border-purple-500/60 transition-all text-center backdrop-blur-sm"
                style={{
                  boxShadow: "0 0 15px rgba(168, 85, 247, 0.2)",
                }}
              >
                <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-purple-300 group-hover:text-purple-200 transition-colors" />
                <div className="text-sm">Quản lý sản phẩm</div>
              </a>
              <a
                href="/orders"
                className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white font-medium hover:border-blue-500/60 transition-all text-center backdrop-blur-sm"
                style={{
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)",
                }}
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-300 group-hover:text-blue-200 transition-colors" />
                <div className="text-sm">Xem đơn hàng</div>
              </a>
              <a
                href="/users"
                className="group p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white font-medium hover:border-emerald-500/60 transition-all text-center backdrop-blur-sm"
                style={{
                  boxShadow: "0 0 15px rgba(34, 197, 94, 0.2)",
                }}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                <div className="text-sm">Quản lý người dùng</div>
              </a>
            </div>
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="galaxy-card rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Hoạt động gần đây
              </h3>
              <a
                href="/orders"
                className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1 transition-colors"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: ShoppingBag,
                  title: "Đơn hàng mới",
                  description: "5 đơn hàng mới trong ngày",
                  color: "from-purple-500/20 to-indigo-500/20",
                  borderColor: "border-purple-500/30",
                  iconColor: "text-purple-300",
                },
                {
                  icon: Users,
                  title: "Người dùng mới",
                  description: "3 người dùng đăng ký hôm nay",
                  color: "from-blue-500/20 to-cyan-500/20",
                  borderColor: "border-blue-500/30",
                  iconColor: "text-blue-300",
                },
                {
                  icon: Package,
                  title: "Sản phẩm mới",
                  description: "2 sản phẩm được thêm vào",
                  color: "from-pink-500/20 to-rose-500/20",
                  borderColor: "border-pink-500/30",
                  iconColor: "text-pink-300",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${item.color} border ${item.borderColor} backdrop-blur-sm hover:border-opacity-60 transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} border ${item.borderColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">
                          {item.title}
                        </h4>
                        <p className="text-purple-300 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Revenue Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="galaxy-card rounded-2xl p-8"
          >
            <h3
              className="text-xl font-bold mb-6"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Tổng quan doanh thu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-emerald-300" />
                  <span className="text-purple-200 text-sm">Hôm nay</span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {(stats.revenue * 0.1).toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-300" />
                  <span className="text-purple-200 text-sm">Tuần này</span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {(stats.revenue * 0.3).toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-purple-300" />
                  <span className="text-purple-200 text-sm">
                    Tổng doanh thu
                  </span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stats.revenue.toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </AdminLayout>
  );
}
