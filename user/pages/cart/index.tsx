import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  Loader2,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../../src/components/layout/Layout";
import Image from "next/image";
import { cartService, Cart, CartItem } from "../../src/services/cart.service";
import { storage } from "../../src/utils/storage";
import toast from "react-hot-toast";
import { formatCurrency } from "../../src/lib/string";

export default function CartPage() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      const user = storage.getUser();
      if (!user) {
        toast.error(t("cart.loginRequired"));
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
      } catch (error: any) {
        console.error("Failed to load cart:", error);
        toast.error(t("cart.loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [router]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingId(productId);
    try {
      const updatedCart = await cartService.updateCartItem({
        productId,
        quantity: newQuantity,
      });
      setCart(updatedCart);
      toast.success(t("cart.updateQuantity"));
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      const message =
        error?.response?.data?.message || t("cart.updateQuantity");
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingId(productId);
    try {
      const updatedCart = await cartService.removeFromCart({ productId });
      setCart(updatedCart);
      toast.success(t("cart.removeSuccess"));
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      toast.error(t("cart.removeSuccess"));
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
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

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const total = subtotal;

  return (
    <Layout>
      <Head>
        <title>{t("cart.title")}</title>
        <meta name="description" content={t("cart.description")} />
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
            <ShoppingCart className="w-16 h-16 md:w-20 md:h-20 text-pink-400" />
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
            {t("cart.pageTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto"
          >
            {cartItems.length > 0
              ? `${cartItems.length} ${t("cart.itemsInCart")}`
              : t("cart.emptyCart")}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Cart Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="galaxy-card rounded-2xl p-6 backdrop-blur-sm"
                >
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {t("cart.cartItems")}
                  </h2>
                  <p className="text-purple-200">
                    {t("cart.totalItems")} {cartItems.length} {t("cart.items")}
                  </p>
                </motion.div>

                {/* Cart Items List */}
                {cartItems.map((item, index) => {
                  const product = item.product;
                  if (!product) return null;

                  const displayPrice =
                    product.salePrice && product.salePrice > 0
                      ? product.salePrice
                      : product.price;
                  const originalPrice =
                    product.salePrice && product.salePrice > 0
                      ? product.price
                      : undefined;
                  const imageUrl =
                    product.files?.[0]?.url ||
                    product.files?.[0]?.thumbnailUrl ||
                    product.coverImage ||
                    "";

                  return (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: removingId === item.productId ? 0 : 1,
                        y: removingId === item.productId ? -20 : 0,
                        scale: removingId === item.productId ? 0.9 : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                      className="galaxy-card rounded-2xl p-6 backdrop-blur-sm"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-purple-500/30">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-300">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                              <span
                                className="text-xl font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }}
                              >
                                {formatCurrency(displayPrice)}₫
                              </span>
                              {originalPrice && (
                                <span className="text-sm text-purple-300 line-through">
                                  {formatCurrency(originalPrice)}₫
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-purple-300">
                              {t("cart.remaining")} {product.stock || 0} {t("cart.remainingItems")}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                            <div className="flex items-center gap-3 border border-purple-500/30 rounded-lg bg-white/10 backdrop-blur-sm">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                disabled={
                                  item.quantity <= 1 || updatingId === item.productId
                                }
                                className="p-2 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-semibold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                disabled={
                                  (product.stock || 0) < item.quantity + 1 ||
                                  updatingId === item.productId
                                }
                                className="p-2 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right">
                              <p className="text-sm text-purple-300 mb-1">
                                {t("cart.subtotal")}
                              </p>
                              <p
                                className="text-lg font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }}
                              >
                                {formatCurrency(displayPrice * item.quantity)}₫
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title={t("cart.removeItem")}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="galaxy-card rounded-2xl p-6 backdrop-blur-sm sticky top-4"
                >
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {t("cart.orderSummary")}
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-purple-200">
                      <span>{t("cart.subtotalLabel")}</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(subtotal)}₫
                      </span>
                    </div>
                    <div className="border-t border-purple-500/30 pt-4">
                      <div className="flex justify-between text-lg font-bold text-white">
                        <span>{t("cart.total")}</span>
                        <span
                          className="text-2xl"
                          style={{
                            background:
                              "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {formatCurrency(total)}₫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-4 shadow-lg shadow-pink-500/50"
                  >
                    <CreditCard className="w-5 h-5" />
                    {t("cart.checkout")}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="space-y-3 pt-4 border-t border-purple-500/30">
                    <div className="flex items-center gap-3 text-sm text-purple-200">
                      <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{t("cart.securePayment")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-purple-200">
                      <Truck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>{t("cart.fastDelivery")}</span>
                    </div>
                  </div>
                </motion.div>
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
                <div className="w-32 h-32 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-purple-300" />
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
                  {t("cart.emptyTitle")}
                </h3>
                <p className="text-purple-200 mb-6">
                  {t("cart.emptyDesc")}
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-pink-500/50"
                >
                  <ArrowRight className="w-5 h-5" />
                  {t("cart.viewProducts")}
                </a>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
