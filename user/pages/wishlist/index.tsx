import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Eye, Loader2 } from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import ProductCardSimple from "../../src/components/products/ProductCardSimple";
import { wishlistService, Wishlist, WishlistItem } from "../../src/services/wishlist.service";
import { cartService } from "../../src/services/cart.service";
import { storage } from "../../src/utils/storage";
import { productService, Product } from "../../src/services/product.service";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadWishlist = async () => {
      const user = storage.getUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập để xem danh sách yêu thích");
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await wishlistService.getWishlist();
        setWishlist(data);
        
        // Load suggested products
        if (data.items.length > 0) {
          const suggested = await productService.getFeatured(4);
          setSuggestedProducts(suggested);
        }
      } catch (error: any) {
        console.error("Failed to load wishlist:", error);
        toast.error("Không thể tải danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [router]);

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingId(productId);
    try {
      const updatedWishlist = await wishlistService.removeFromWishlist({ productId });
      setWishlist(updatedWishlist);
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Không thể xóa khỏi danh sách yêu thích");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddAllToCart = async () => {
    if (!wishlist || wishlist.items.length === 0) return;

    try {
      for (const item of wishlist.items) {
        if (item.product && item.product._id) {
          await cartService.addToCart({
            productId: item.product._id,
            quantity: 1,
          });
        }
      }
      toast.success(`Đã thêm ${wishlist.items.length} sản phẩm vào giỏ hàng!`);
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleClearWishlist = async () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?",
      )
    ) {
      try {
        const updatedWishlist = await wishlistService.clearWishlist();
        setWishlist(updatedWishlist);
        toast.success("Đã xóa tất cả sản phẩm");
      } catch (error: any) {
        console.error("Failed to clear wishlist:", error);
        toast.error("Không thể xóa danh sách yêu thích");
      }
    }
  };

  const mapWishlistItemToCard = (item: WishlistItem) => {
    if (!item.product) return null;

    const product = item.product;
    const firstImage =
      product.files?.[0]?.url ||
      product.files?.[0]?.thumbnailUrl ||
      product.coverImage ||
      "";
    const displayPrice =
      product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const originalPrice =
      product.salePrice && product.salePrice > 0 ? product.price : undefined;
    const discount = originalPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : undefined;

    let badge: "Best Seller" | "Hot" | "New" | undefined = undefined;
    if (product.salePrice && product.salePrice > 0) {
      badge = "Hot";
    } else {
      badge = "New";
    }

    return {
      id: product.slug || product._id,
      productId: product._id,
      name: product.name,
      brand: product.brand?.name || "Labubu",
      price: displayPrice,
      originalPrice: originalPrice,
      rating: 0,
      reviewCount: 0,
      image: firstImage,
      badge: badge,
      discount: discount,
      stock: product.stock,
    };
  };

  const mapProductToCard = (product: Product) => {
    const firstImage =
      product.files?.[0]?.url ||
      product.files?.[0]?.thumbnailUrl ||
      (product as any).coverImage ||
      "";
    const displayPrice =
      product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const originalPrice =
      product.salePrice && product.salePrice > 0 ? product.price : undefined;
    const discount = originalPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : undefined;

    let badge: "Best Seller" | "Hot" | "New" | undefined = undefined;
    if (product.soldCount && product.soldCount > 50) {
      badge = "Best Seller";
    } else if (product.salePrice && product.salePrice > 0) {
      badge = "Hot";
    } else {
      badge = "New";
    }

    let categoryName = "Labubu";
    if (product.categoryId) {
      if (typeof product.categoryId === "object" && product.categoryId.name) {
        categoryName = product.categoryId.name;
      }
    }

    return {
      id: product.slug || product._id,
      productId: product._id,
      name: product.name,
      brand: categoryName,
      price: displayPrice,
      originalPrice: originalPrice,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      image: firstImage,
      badge: badge,
      discount: discount,
      stock: product.stock,
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        </div>
      </Layout>
    );
  }

  const wishlistItems = wishlist?.items || [];

  return (
    <Layout>
      <Head>
        <title>Danh Sách Yêu Thích - Labubu</title>
        <meta
          name="description"
          content="Xem lại các sản phẩm bạn đã yêu thích"
        />
      </Head>

      {/* Galaxy Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10 overflow-hidden">
        {/* Stars Effect */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}

        {/* Nebula Clouds */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <Heart className="w-16 h-16 md:w-20 md:h-20 text-pink-400 fill-pink-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{
              background:
                "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Danh Sách Yêu Thích
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto"
          >
            {wishlistItems.length > 0
              ? `${wishlistItems.length} sản phẩm trong danh sách yêu thích của bạn`
              : "Danh sách yêu thích của bạn đang trống"}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Action Bar */}
          {wishlistItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="galaxy-card rounded-2xl p-6 mb-8 backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-purple-200 font-medium">
                    Tổng cộng:{" "}
                    <span
                      className="font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {wishlistItems.length} sản phẩm
                    </span>
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddAllToCart}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-pink-500/50"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm tất cả vào giỏ hàng
                  </button>
                  <button
                    onClick={handleClearWishlist}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-red-500/30 text-red-300 rounded-lg font-semibold hover:bg-red-500/20 transition-all backdrop-blur-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa tất cả
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => {
                const cardData = mapWishlistItemToCard(item);
                if (!cardData) return null;

                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: removingId === item.productId ? 0 : 1,
                      y: removingId === item.productId ? -20 : 0,
                      scale: removingId === item.productId ? 0.8 : 1,
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
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <Trash2 className="w-5 h-5 text-red-300" />
                    </button>

                    {/* Product Card */}
                    <div className="relative">
                      <ProductCardSimple {...cardData} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center">
                  <Heart className="w-16 h-16 text-purple-300" />
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Danh sách yêu thích trống
                </h3>
                <p className="text-purple-200 mb-6">
                  Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám
                  phá và thêm sản phẩm bạn yêu thích!
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-pink-500/50"
                >
                  <Eye className="w-5 h-5" />
                  Xem sản phẩm
                </a>
              </motion.div>
            </div>
          )}

          {/* Suggested Products */}
          {wishlistItems.length > 0 && suggestedProducts.length > 0 && (
            <div className="mt-16">
              <h2
                className="text-3xl font-bold mb-8 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Có thể bạn cũng thích
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedProducts.map((product, index) => {
                  const cardData = mapProductToCard(product);
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                      }}
                    >
                      <ProductCardSimple {...cardData} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
