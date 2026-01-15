import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
    ShoppingCart,
    Heart,
    Star,
    Share2,
    ChevronLeft,
    Plus,
    Minus,
    Check,
    Truck,
    Shield,
    RotateCcw,
} from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import { productService, Product } from "../../src/services/product.service";
import { cartService } from "../../src/services/cart.service";
import { storage } from "../../src/utils/storage";
import ProductCardSimple from "../../src/components/products/ProductCardSimple";
import toast from "react-hot-toast";
import { useTrans } from "../../src/hooks/useTrans";

export default function ProductDetailPage() {
    const router = useRouter();
    const t = useTrans();
    const { slug } = router.query;
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        if (!slug || typeof slug !== "string") return;

        const loadProduct = async () => {
            try {
                setLoading(true);
                const prod = await productService.getBySlug(slug);
                setProduct(prod);
                
                // Load related products
                if (prod.categoryId) {
                    const categoryId = typeof prod.categoryId === "object" 
                        ? prod.categoryId._id 
                        : prod.categoryId;
                    const related = await productService.search({
                        categoryId: categoryId,
                        limit: 4,
                    });
                    // Filter out current product
                    const filtered = related.data.filter((p: Product) => p._id !== prod._id);
                    setRelatedProducts(filtered.slice(0, 4));
                }
            } catch (error) {
                console.error("Error loading product:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                        <p className="mt-4 text-white">{t.productDetail.loading}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">{t.productDetail.notFound}</h2>
                        <button
                            onClick={() => router.push("/products")}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all"
                        >
                            {t.productDetail.backToList}
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Get images
    const images = product.files || [];
    const mainImage = images[selectedImageIndex]?.url || images[0]?.url || (product as any).coverImage || "";
    const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const originalPrice = product.salePrice && product.salePrice > 0 ? product.price : undefined;
    const discount = originalPrice 
        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
        : undefined;
    const isInStock = product.stock === undefined || product.stock === null || product.stock > 0;

    // Get category name
    let categoryName = "Labubu";
    if (product.categoryId) {
        if (typeof product.categoryId === "object" && product.categoryId.name) {
            categoryName = product.categoryId.name;
        }
    }

    const handleAddToCart = async () => {
        if (!product) return;

        const user = storage.getUser();
        if (!user) {
            toast.error(t.productDetail.loginRequired);
            router.push("/login");
            return;
        }

        if (!isInStock) {
            toast.error(t.productDetail.outOfStock);
            return;
        }

        setIsAddingToCart(true);
        try {
            await cartService.addToCart({
                productId: product._id,
                quantity: quantity,
            });
            toast.success(t.productDetail.addToCartSuccess);
        } catch (error: any) {
            console.error("Error adding to cart:", error);
            const message = error?.response?.data?.message || error?.message || t.productDetail.addToCartError;
            toast.error(message);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleToggleWishlist = () => {
        setIsInWishlist(!isInWishlist);
        // TODO: Implement wishlist
    };

    const mapProductToCard = (product: Product) => {
        const firstImage = product.files?.[0]?.url || product.files?.[0]?.thumbnailUrl || (product as any).coverImage || "";
        const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
        const originalPrice = product.salePrice && product.salePrice > 0 ? product.price : undefined;
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
            id: product.slug || product._id, // Use slug for URL
            productId: product._id, // Actual product _id for API calls
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

    return (
        <Layout>
            <Head>
                <title>{product.name} - Labubu Store</title>
                <meta name="description" content={product.shortDescription || product.description || ""} />
            </Head>

            {/* Galaxy Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10 overflow-hidden">
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
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-purple-200 hover:text-white mb-6 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>{t.common.back}</span>
                </motion.button>

                {/* Product Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left: Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        {/* Main Image */}
                        <div className="galaxy-card rounded-2xl overflow-hidden backdrop-blur-sm">
                            <div className="relative aspect-square">
                                {mainImage ? (
                                    <Image
                                        src={mainImage}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        priority
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <span className="text-purple-300">{t.common.error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`galaxy-card rounded-lg overflow-hidden backdrop-blur-sm aspect-square ${
                                            selectedImageIndex === index
                                                ? "ring-2 ring-purple-500"
                                                : "opacity-70 hover:opacity-100"
                                        } transition-all`}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={img.url || img.thumbnailUrl || ""}
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right: Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Category & Badge */}
                        <div className="flex items-center gap-3">
                            <span className="text-purple-300 text-sm">{categoryName}</span>
                            {discount && (
                                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-400/30">
                                    -{discount}%
                                </span>
                            )}
                            {!isInStock && (
                                <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm border border-gray-400/30">
                                    {t.productDetail.outOfStockLabel}
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.rating && product.rating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(product.rating || 0)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-400"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-purple-200">
                                    {product.rating?.toFixed(1)} ({product.reviewCount || 0} {t.common.reviews})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-white">
                                    {displayPrice.toLocaleString("vi-VN")}₫
                                </span>
                                {originalPrice && (
                                    <span className="text-xl text-purple-300 line-through">
                                        {originalPrice.toLocaleString("vi-VN")}₫
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <p className="text-purple-200 leading-relaxed">
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Stock Info */}
                        {isInStock && product.stock !== undefined && (
                            <div className="flex items-center gap-2 text-green-300">
                                <Check className="w-5 h-5" />
                                <span>{t.productDetail.inStock} {product.stock} {t.products.products}</span>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {isInStock && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-purple-200">
                                    {t.productDetail.quantity}
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="galaxy-card p-2 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <Minus className="w-5 h-5 text-white" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setQuantity(Math.max(1, Math.min(val, product.stock || 999)));
                                        }}
                                        className="w-20 px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-center backdrop-blur-sm"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                                        className="galaxy-card p-2 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={!isInStock || isAddingToCart}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                style={{
                                    boxShadow: "0 0 25px rgba(236, 72, 153, 0.5)",
                                }}
                            >
                                {isAddingToCart ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>{t.productDetail.adding}</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>{t.productDetail.addToCart}</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleToggleWishlist}
                                className={`p-4 rounded-lg border transition-all ${
                                    isInWishlist
                                        ? "bg-red-500/20 border-red-400/30 text-red-300"
                                        : "bg-white/10 border-purple-500/30 text-purple-200 hover:bg-white/20"
                                } backdrop-blur-sm`}
                            >
                                <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
                            </button>
                            <button className="p-4 rounded-lg bg-white/10 border border-purple-500/30 text-purple-200 hover:bg-white/20 transition-all backdrop-blur-sm">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="galaxy-card rounded-xl p-6 backdrop-blur-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-6 h-6 text-purple-300" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{t.home.features.fastDelivery}</p>
                                        <p className="text-xs text-purple-300">{t.home.serviceBar.nationwideDelivery}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-purple-300" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{t.home.features.highQuality}</p>
                                        <p className="text-xs text-purple-300">{t.home.bannerFeatures.premiumMaterial}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RotateCcw className="w-6 h-6 text-purple-300" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{t.common.back}</p>
                                        <p className="text-xs text-purple-300">7 {t.common.days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Description Section */}
                {product.description && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="galaxy-card rounded-2xl p-8 mb-12 backdrop-blur-sm"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">{t.productDetail.description}</h2>
                        <div
                            className="text-purple-200 leading-relaxed prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </motion.div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">{t.productDetail.relatedProducts}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((prod) => (
                                <ProductCardSimple key={prod._id} {...mapProductToCard(prod)} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
}

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: "blocking",
    };
}

