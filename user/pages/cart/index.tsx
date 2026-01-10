import Head from "next/head";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
} from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import Image from "next/image";

// Fake cart data - 3 products
const initialCartItems = [
  {
    id: "1",
    name: "Sticker Labubu Premium - Bộ 10 mẫu độc đáo",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
    price: 250000,
    originalPrice: 300000,
    quantity: 2,
    stock: 50,
  },
  {
    id: "2",
    name: "Sticker Cute Animal Collection - Bộ 15 mẫu",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    price: 320000,
    originalPrice: 380000,
    quantity: 1,
    stock: 35,
  },
  {
    id: "3",
    name: "Sticker Kawaii Style - Bộ 12 mẫu siêu dễ thương",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
    price: 280000,
    originalPrice: 350000,
    quantity: 3,
    stock: 42,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  return (
    <Layout>
      <Head>
        <title>Giỏ Hàng - Labubu</title>
        <meta name="description" content="Xem và quản lý giỏ hàng của bạn" />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center"></div>
        </div>

        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <ShoppingCart className="w-16 h-16 md:w-20 md:h-20 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Giỏ Hàng
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
          >
            {cartItems.length > 0
              ? `${cartItems.length} sản phẩm trong giỏ hàng của bạn`
              : "Giỏ hàng của bạn đang trống"}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Cart Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Sản phẩm trong giỏ hàng
                  </h2>
                  <p className="text-gray-600">
                    Tổng cộng {cartItems.length} sản phẩm
                  </p>
                </div>

                {/* Cart Items List */}
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: removingId === item.id ? 0 : 1,
                      y: removingId === item.id ? -20 : 0,
                      scale: removingId === item.id ? 0.9 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xl font-bold text-pink-600">
                              {item.price.toLocaleString("vi-VN")}₫
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {item.originalPrice.toLocaleString("vi-VN")}₫
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Còn lại: {item.stock} sản phẩm
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                          <div className="flex items-center gap-3 border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">
                              Thành tiền
                            </p>
                            <p className="text-lg font-bold text-pink-600">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN",
                              )}
                              ₫
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Tóm tắt đơn hàng
                  </h2>

                  {/* Summary Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Tạm tính:</span>
                      <span className="font-semibold">
                        {subtotal.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Phí vận chuyển:</span>
                      <span className="font-semibold">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          `${shippingFee.toLocaleString("vi-VN")}₫`
                        )}
                      </span>
                    </div>
                    {subtotal < 500000 && (
                      <p className="text-sm text-pink-600">
                        Mua thêm {(500000 - subtotal).toLocaleString("vi-VN")}₫
                        để được miễn phí vận chuyển
                      </p>
                    )}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Tổng cộng:</span>
                        <span className="text-pink-600 text-2xl">
                          {total.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5" />
                    Thanh toán
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Security Badges */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Thanh toán an toàn và bảo mật</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span>Giao hàng nhanh trong 24-48h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Giỏ hàng trống
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm
                  sản phẩm vào giỏ hàng!
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                  Xem sản phẩm
                </a>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
