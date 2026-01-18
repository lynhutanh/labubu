import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PackageSearch, Loader2, Search, X } from "lucide-react";
import Layout from "../src/components/layout/Layout";
import { orderService, TrackingInfo } from "../src/services/order.service";
import { storage } from "../src/utils/storage";
import toast from "react-hot-toast";
import TrackingModal from "../src/components/order/TrackingModal";

export default function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
  }, [mounted]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast.error("Vui lòng nhập mã đơn hàng");
      return;
    }

    try {
      setLoading(true);
      const user = storage.getUser();
      
      if (!user) {
        toast.error("Vui lòng đăng nhập để theo dõi đơn hàng");
        return;
      }

      const orders = await orderService.getOrders({ limit: 100 });
      const order = orders.data.find(
        (o) => o.orderNumber === orderNumber.trim()
      );

      if (!order) {
        toast.error("Không tìm thấy đơn hàng với mã này");
        return;
      }

      if (!order.ghnOrderCode) {
        toast.error("Đơn hàng chưa có mã vận đơn GHN");
        return;
      }

      setOrderId(order._id);
      setShowTrackingModal(true);
    } catch (error: any) {
      console.error("Failed to search order:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tìm đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Theo dõi đơn hàng - Labubu Store</title>
        <meta name="description" content="Theo dõi trạng thái đơn hàng của bạn" />
      </Head>

      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10 overflow-hidden">
        {mounted && stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.width}px`,
              height: `${star.height}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <section className="relative z-10 py-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Theo dõi đơn hàng
            </h1>
            <p className="text-purple-200 text-lg">
              Nhập mã đơn hàng để xem trạng thái vận chuyển
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="galaxy-card rounded-2xl p-8 backdrop-blur-sm"
          >
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-purple-200 mb-3 text-lg font-semibold">
                  Mã đơn hàng
                </label>
                <div className="relative">
                  <PackageSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-300" />
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Nhập mã đơn hàng (ví dụ: ORD-XXXXXX-XXXXXX)"
                    className="w-full pl-14 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
                    disabled={loading}
                  />
                </div>
                <p className="mt-2 text-sm text-purple-300">
                  Mã đơn hàng được gửi qua email hoặc có thể xem trong{" "}
                  <a
                    href="/profile/order"
                    className="text-yellow-400 hover:text-yellow-300 underline"
                  >
                    đơn hàng của tôi
                  </a>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Theo dõi đơn hàng
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 galaxy-card rounded-2xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Hướng dẫn sử dụng
            </h2>
            <ul className="space-y-3 text-purple-200">
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">1.</span>
                <span>
                  Nhập mã đơn hàng vào ô tìm kiếm phía trên. Mã đơn hàng có
                  dạng: <code className="bg-white/10 px-2 py-1 rounded">ORD-XXXXXX-XXXXXX</code>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">2.</span>
                <span>
                  Nhấn nút "Theo dõi đơn hàng" để xem thông tin chi tiết về
                  trạng thái vận chuyển
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">3.</span>
                <span>
                  Bạn sẽ thấy timeline chi tiết về hành trình của đơn hàng từ
                  khi được tạo đến khi giao hàng
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {showTrackingModal && orderId && (
        <TrackingModal
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setOrderId(null);
          }}
          orderId={orderId}
          orderNumber={orderNumber}
        />
      )}
    </Layout>
  );
}
