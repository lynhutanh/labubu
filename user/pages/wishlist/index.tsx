import Head from "next/head";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Eye } from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import ProductCardSimple from "../../src/components/products/ProductCardSimple";

// Fake wishlist data - 5 products
const fakeWishlistProducts = [
  {
    id: "1",
    name: "Sticker Labubu Premium - Bộ 10 mẫu độc đáo",
    brand: "Labubu",
    price: 250000,
    originalPrice: 300000,
    rating: 4.8,
    reviewCount: 156,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
    badge: "Best Seller" as const,
    discount: 17,
    stock: 50,
  },
  {
    id: "2",
    name: "Sticker Cute Animal Collection - Bộ 15 mẫu",
    brand: "Labubu",
    price: 320000,
    originalPrice: 380000,
    rating: 4.9,
    reviewCount: 203,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    badge: "Hot" as const,
    discount: 16,
    stock: 35,
  },
  {
    id: "3",
    name: "Sticker Kawaii Style - Bộ 12 mẫu siêu dễ thương",
    brand: "Labubu",
    price: 280000,
    originalPrice: 350000,
    rating: 4.7,
    reviewCount: 128,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
    badge: "New" as const,
    discount: 20,
    stock: 42,
  },
  {
    id: "4",
    name: "Sticker Vintage Retro - Bộ 8 mẫu cổ điển",
    brand: "Labubu",
    price: 220000,
    originalPrice: 280000,
    rating: 4.6,
    reviewCount: 89,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    badge: "Hot" as const,
    discount: 21,
    stock: 28,
  },
  {
    id: "5",
    name: "Sticker Minimalist Design - Bộ 6 mẫu tối giản",
    brand: "Labubu",
    price: 190000,
    originalPrice: 240000,
    rating: 4.5,
    reviewCount: 67,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
    badge: "New" as const,
    discount: 21,
    stock: 55,
  },
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(fakeWishlistProducts);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFromWishlist = (productId: string) => {
    setRemovingId(productId);
    setTimeout(() => {
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
      setRemovingId(null);
    }, 300);
  };

  const handleAddAllToCart = () => {
    // TODO: Implement add all to cart
    console.log("Add all to cart");
  };

  const handleClearWishlist = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?",
      )
    ) {
      setWishlistItems([]);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Danh Sách Yêu Thích - Labubu</title>
        <meta
          name="description"
          content="Xem lại các sản phẩm bạn đã yêu thích"
        />
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
            <Heart className="w-16 h-16 md:w-20 md:h-20 text-white fill-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Danh Sách Yêu Thích
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
          >
            {wishlistItems.length > 0
              ? `${wishlistItems.length} sản phẩm trong danh sách yêu thích của bạn`
              : "Danh sách yêu thích của bạn đang trống"}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Action Bar */}
          {wishlistItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">
                    Tổng cộng:{" "}
                    <span className="text-pink-600 font-bold">
                      {wishlistItems.length} sản phẩm
                    </span>
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddAllToCart}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm tất cả vào giỏ hàng
                  </button>
                  <button
                    onClick={handleClearWishlist}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa tất cả
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: removingId === product.id ? 0 : 1,
                    y: removingId === product.id ? -20 : 0,
                    scale: removingId === product.id ? 0.8 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  className="relative group"
                >
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <Trash2 className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Product Card */}
                  <div className="relative">
                    <ProductCardSimple {...product} />
                  </div>
                </motion.div>
              ))}
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
                  <Heart className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Danh sách yêu thích trống
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám
                  phá và thêm sản phẩm bạn yêu thích!
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  Xem sản phẩm
                </a>
              </motion.div>
            </div>
          )}

          {/* Suggested Products (if wishlist is not empty) */}
          {wishlistItems.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Có thể bạn cũng thích
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    id: "6",
                    name: "Sticker Nature - Bộ 10 mẫu thiên nhiên",
                    brand: "Labubu",
                    price: 240000,
                    originalPrice: 300000,
                    rating: 4.7,
                    reviewCount: 112,
                    image:
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
                    badge: "New" as const,
                    discount: 20,
                    stock: 38,
                  },
                  {
                    id: "7",
                    name: "Sticker Space Theme - Bộ 8 mẫu không gian",
                    brand: "Labubu",
                    price: 260000,
                    originalPrice: 320000,
                    rating: 4.8,
                    reviewCount: 145,
                    image:
                      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
                    badge: "Hot" as const,
                    discount: 19,
                    stock: 30,
                  },
                  {
                    id: "8",
                    name: "Sticker Ocean Life - Bộ 12 mẫu đại dương",
                    brand: "Labubu",
                    price: 290000,
                    originalPrice: 360000,
                    rating: 4.6,
                    reviewCount: 98,
                    image:
                      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
                    badge: "Best Seller" as const,
                    discount: 19,
                    stock: 45,
                  },
                  {
                    id: "9",
                    name: "Sticker Foodie - Bộ 10 mẫu đồ ăn",
                    brand: "Labubu",
                    price: 230000,
                    originalPrice: 290000,
                    rating: 4.5,
                    reviewCount: 76,
                    image:
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
                    badge: "New" as const,
                    discount: 21,
                    stock: 52,
                  },
                ].map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                    }}
                  >
                    <ProductCardSimple {...product} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
