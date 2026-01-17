import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Truck,
  Gift,
  Award,
  Headphones,
} from "lucide-react";
import Layout from "../src/components/layout/Layout";
import ProductCardSimple from "../src/components/products/ProductCardSimple";
import { productService, Product } from "../src/services/product.service";
import { useTrans } from "../src/hooks/useTrans";

// Helper function to map Product from API to ProductCardSimple format
const mapProductToCard = (product: Product) => {
  const firstImage =
    product.files?.[0]?.url || product.files?.[0]?.thumbnailUrl || "";
  const displayPrice =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price;
  const originalPrice =
    product.salePrice && product.salePrice > 0 ? product.price : undefined;
  const discount = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : undefined;

  // Determine badge based on product data
  let badge: "Best Seller" | "Hot" | "New" | undefined = undefined;
  if (product.soldCount && product.soldCount > 50) {
    badge = "Best Seller";
  } else if (product.salePrice && product.salePrice > 0) {
    badge = "Hot";
  } else {
    badge = "New";
  }

  return {
    id: product.slug || product._id, // Use slug for URL, fallback to _id
    productId: product._id, // Actual product _id for API calls
    name: product.name,
    brand: product.categoryId?.name || "Labubu",
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

export default function HomePage() {
  const t = useTrans();
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const [newProds, bestSellProds] = await Promise.all([
          productService.getNew(5),
          productService.getBestSellers(5),
        ]);
        setNewProducts(newProds);
        setBestSellers(bestSellProds);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);
  return (
    <Layout>
      <Head>
        <title>{t.home.title}</title>
        <meta name="description" content={t.home.description} />
      </Head>

      {/* Page Background - Common for all sections */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed -z-10"
        style={{
          backgroundImage: "url('/bg.png')",
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Animation */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/bg_hero_Section.jpg')",
          }}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -80, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.2,
              }}
              className="text-center lg:text-left"
            >
              {/* Headline */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                style={{
                  textShadow:
                    "3px 3px 6px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.8)",
                  WebkitTextStroke: "2px rgba(0,0,0,0.5)",
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.4,
                }}
              >
                {t.home.storeName}
              </motion.h1>
              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8"
                style={{
                  textShadow:
                    "3px 3px 8px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9), 1px 1px 3px rgba(0,0,0,0.9)",
                  WebkitTextStroke: "1.5px rgba(0,0,0,0.6)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.6,
                }}
              >
                {t.home.slogan}
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-white mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(236, 233, 16, 0.8), -1px -1px 2px rgba(206, 61, 61, 0.8)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.8,
                }}
              >
                {t.home.descriptionText}
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 1,
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-center lg:justify-start"
              >
                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl"
                >
                  {t.home.exploreNow}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.span>
                </Link>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                className="grid grid-cols-2 gap-4 mt-12 max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 1.2,
                }}
              >
                {[
                  {
                    icon: Sparkles,
                    text: t.home.features.uniqueDesign,
                  },
                  {
                    icon: Zap,
                    text: t.home.features.fastDelivery,
                  },
                  {
                    icon: Shield,
                    text: t.home.features.highQuality,
                  },
                  {
                    icon: Sparkles,
                    text: t.home.features.bestPrice,
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border-2 border-yellow-400"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: 1.3 + index * 0.1,
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-yellow-600 mb-2" />
                    <p
                      className="text-sm font-bold text-black"
                      style={{
                        textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                      }}
                    >
                      {feature.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Image/Banner */}
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.4,
              }}
              className="relative"
            >
              <motion.div
                className="relative w-full h-full flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/section_right.png"
                  alt="Sticker showcase"
                  width={1200}
                  height={1200}
                  className="w-full h-auto object-contain rounded-3xl"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Service Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-black text-white py-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 1.5,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm md:text-base font-bold">
              {[
                t.home.serviceBar.limitedStock,
                t.home.serviceBar.freeDesign,
                t.home.serviceBar.nationwideDelivery,
              ].map((item, index, array) => (
                <div key={index} className="flex items-center gap-4 md:gap-6">
                  <motion.span
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: 1.6 + index * 0.15,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.span
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                        ease: "easeInOut",
                      }}
                    />
                    {item}
                  </motion.span>
                  {index < array.length - 1 && (
                    <motion.span
                      className="text-white/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 1.7 + index * 0.15,
                      }}
                    >
                      |
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Banner Section */}
      <section className="py-12 relative">
        {/* SVG Filter for electric effect */}
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="turbulent-displace">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="3"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.9;1.1;0.9"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="3"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {[
                {
                  icon: Truck,
                  title: t.home.bannerFeatures.nationwideDelivery,
                  description: t.home.bannerFeatures.nationwideDeliveryDesc,
                },
                {
                  icon: Gift,
                  title: t.home.bannerFeatures.gift,
                  description: t.home.bannerFeatures.giftDesc,
                },
                {
                  icon: Award,
                  title: t.home.bannerFeatures.premiumMaterial,
                  description: t.home.bannerFeatures.premiumMaterialDesc,
                },
                {
                  icon: Headphones,
                  title: t.home.bannerFeatures.support247,
                  description: t.home.bannerFeatures.support247Desc,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-container h-full cursor-pointer"
                  style={{
                    padding: "2px",
                    borderRadius: "24px",
                    position: "relative",
                    background:
                      "linear-gradient(-30deg, #fbbf24, transparent, #fbbf24), linear-gradient(to bottom, #1f2937, #1f2937)",
                    backgroundSize: "200% 200%",
                    animation: "electric-border 3s ease infinite",
                  }}
                >
                  <div
                    className="main-card bg-white rounded-[22px] p-6 text-center h-full flex flex-col"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "22px",
                      border: "1px solid #f97316",
                      marginTop: "-2px",
                      marginLeft: "-2px",
                      position: "relative",
                      filter: "url(#turbulent-displace)",
                      boxShadow: "0 0 2px rgba(249, 115, 22, 0.3)",
                      animation: "electric-pulse 2s ease-in-out infinite",
                    }}
                  >
                    {/* Electric sparks */}
                    <span
                      className="electric-spark"
                      style={{
                        top: "10%",
                        left: "0",
                        animation: "electric-spark 1.5s ease-in-out infinite",
                        animationDelay: "0s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        top: "30%",
                        right: "0",
                        animation: "electric-spark-2 1.8s ease-in-out infinite",
                        animationDelay: "0.5s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        bottom: "20%",
                        left: "0",
                        animation: "electric-spark-3 1.6s ease-in-out infinite",
                        animationDelay: "1s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        bottom: "10%",
                        right: "0",
                        animation: "electric-spark 1.7s ease-in-out infinite",
                        animationDelay: "0.3s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        top: "50%",
                        left: "0",
                        animation: "electric-spark-2 1.9s ease-in-out infinite",
                        animationDelay: "0.8s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        top: "0",
                        left: "50%",
                        transform: "translateX(-50%)",
                        animation: "electric-spark-3 1.5s ease-in-out infinite",
                        animationDelay: "0.2s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        bottom: "0",
                        left: "50%",
                        transform: "translateX(-50%)",
                        animation: "electric-spark 1.6s ease-in-out infinite",
                        animationDelay: "0.6s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        top: "20%",
                        right: "0",
                        animation: "electric-spark-3 1.4s ease-in-out infinite",
                        animationDelay: "0.4s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        bottom: "30%",
                        right: "0",
                        animation: "electric-spark 1.8s ease-in-out infinite",
                        animationDelay: "0.7s",
                      }}
                    />
                    <span
                      className="electric-spark"
                      style={{
                        top: "70%",
                        left: "0",
                        animation: "electric-spark-2 1.5s ease-in-out infinite",
                        animationDelay: "0.9s",
                      }}
                    />
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center mb-4 bg-transparent">
                        <feature.icon className="w-8 h-8 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-bold text-black mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl galaxy-glow-text mb-4">
                {t.home.newProducts.title}
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.2,
              }}
            >
              <p className="text-lg md:text-xl galaxy-glow-subtitle max-w-2xl mx-auto">
                {t.home.newProducts.subtitle}
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="mt-4 text-white">{t.home.newProducts.loading}</p>
            </div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {newProducts.map((product) => (
                <ProductCardSimple
                  key={product._id}
                  {...mapProductToCard(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white">
              <p>{t.home.newProducts.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Selling Products Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -100, rotateY: -45 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl galaxy-glow-text mb-4">
                {t.home.bestSellers.title}
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: 45 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.2,
              }}
            >
              <p className="text-lg md:text-xl galaxy-glow-subtitle max-w-2xl mx-auto">
                {t.home.bestSellers.subtitle}
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="mt-4 text-white">{t.home.newProducts.loading}</p>
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {bestSellers.map((product) => (
                <ProductCardSimple
                  key={product._id}
                  {...mapProductToCard(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white">
              <p>{t.home.bestSellers.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* Diecut Sticker Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/background_login.webp')",
          }}
        />
        {/* Overlay nhẹ để text dễ đọc */}
        <div className="absolute inset-0 bg-white/10"></div>

        {/* Top Black Header */}
        <div className="relative z-10 bg-black text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm md:text-base font-medium">
              {t.home.diecutSection.notice}
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-600" />
              {t.home.diecutSection.title}
              <Sparkles className="w-8 h-8 text-yellow-600" />
            </h2>
            <p className="text-lg md:text-xl text-black max-w-4xl mx-auto mt-4">
              {t.home.diecutSection.description}
            </p>
          </div>

          {/* Wavy Divider */}
          <div className="my-8">
            <svg
              className="w-full h-8"
              viewBox="0 0 1200 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 Q300,0 600,20 T1200,20 L1200,40 L0,40 Z"
                fill="black"
              />
            </svg>
          </div>

          {/* Three Content Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: t.home.diecutSection.blocks.freeDesign.title,
                description: t.home.diecutSection.blocks.freeDesign.description,
                image:
                  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
              },
              {
                title: t.home.diecutSection.blocks.noMinimum.title,
                description: t.home.diecutSection.blocks.noMinimum.description,
                image:
                  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
              },
              {
                title: t.home.diecutSection.blocks.fastPrint.title,
                description: t.home.diecutSection.blocks.fastPrint.description,
                image:
                  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
              },
            ].map((block, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={block.image}
                    alt={block.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black flex items-center justify-center">
                    {block.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
