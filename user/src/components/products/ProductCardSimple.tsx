import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { cartService } from "../../services/cart.service";
import { wishlistService } from "../../services/wishlist.service";
import { storage } from "../../utils/storage";
import toast from "react-hot-toast";
import { useTrans } from "../../hooks/useTrans";

interface ProductCardSimpleProps {
    id: string | number; // For URL (slug or _id)
    productId?: string; // Actual product _id for API calls
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    image: string;
    badge?: "Best Seller" | "Hot" | "New";
    discount?: number;
    stock?: number;
}

export default function ProductCardSimple({
    id,
    productId,
    name,
    brand,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    badge,
    discount,
    stock,
}: ProductCardSimpleProps) {
    const router = useRouter();
    const t = useTrans();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const isInStock = stock === undefined || stock === null || stock > 0;

    // Check if product is in wishlist on mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            const user = storage.getUser();
            if (!user || !productId) return;

            try {
                const isInWishlist = await wishlistService.checkProduct(productId);
                setIsInWishlist(isInWishlist);
            } catch (error) {
                // Silently fail - user might not be logged in
                console.error("Failed to check wishlist status:", error);
            }
        };

        checkWishlistStatus();
    }, [productId]);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
            // Use productId if provided, otherwise use id (might be _id or slug)
            const actualProductId = productId || (typeof id === "string" ? id : String(id));
            await cartService.addToCart({
                productId: actualProductId,
                quantity: 1,
            });
            toast.success("Đã thêm vào giỏ hàng!");
        } catch (error: any) {
            console.error("Error adding to cart:", error);
            const message = error?.response?.data?.message || error?.message || t.productDetail.addToCartError;
            toast.error(message);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const user = storage.getUser();
        if (!user) {
            toast.error(t.wishlist.loginRequired);
            router.push("/login");
            return;
        }

        const actualProductId = productId || (typeof id === "string" ? id : String(id));
        
        if (!actualProductId) {
            toast.error(t.common.error);
            return;
        }

        setIsTogglingWishlist(true);
        try {
            if (isInWishlist) {
                await wishlistService.removeFromWishlist({ productId: actualProductId });
                setIsInWishlist(false);
                toast.success(t.wishlist.removeSuccess);
            } else {
                await wishlistService.addToWishlist({ productId: actualProductId });
                setIsInWishlist(true);
                toast.success(t.wishlist.addToCartSuccess);
            }
        } catch (error: any) {
            console.error("Error toggling wishlist:", error);
            const message = error?.response?.data?.message || error?.message || t.wishlist.removeError;
            toast.error(message);
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(79, 70, 229, 0.1) 50%, rgba(0, 0, 0, 0.2) 100%)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                boxShadow:
                    "0 4px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)",
            }}
            whileHover={{
                scale: 1.02,
                boxShadow:
                    "0 8px 12px rgba(0, 0, 0, 0.4), 0 0 30px rgba(168, 85, 247, 0.3), 0 0 50px rgba(236, 72, 153, 0.2)",
                borderColor: "rgba(168, 85, 247, 0.6)",
            }}
        >
            {/* Galaxy Glow Effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
                }}
            />

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Wishlist Button - Top Left */}
                <button
                    onClick={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                    className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isInWishlist
                            ? "bg-pink-500/80 border-2 border-pink-400 shadow-lg shadow-pink-500/50"
                            : "bg-white/10 border border-white/20 hover:bg-white/20"
                        }`}
                    title={isInWishlist ? t.wishlist.removeFromWishlist : t.header.favorites}
                >
                    <Heart
                        className={`w-5 h-5 transition-all ${isInWishlist
                                ? "text-pink-200 fill-pink-200"
                                : "text-white group-hover:text-pink-300"
                            }`}
                    />
                </button>

                {/* Badges - Top Right */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {badge && (
                        <span
                            className="px-3 py-1 text-white text-xs font-semibold rounded-full backdrop-blur-md border border-white/30"
                            style={{
                                background:
                                    badge === "Best Seller"
                                        ? "linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(168, 85, 247, 0.8))"
                                        : badge === "Hot"
                                            ? "linear-gradient(135deg, rgba(251, 146, 60, 0.8), rgba(236, 72, 153, 0.8))"
                                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(168, 85, 247, 0.8))",
                                boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)",
                            }}
                        >
                            {badge}
                        </span>
                    )}
                    {discount && (
                        <span
                            className="px-3 py-1 text-white text-xs font-semibold rounded-full backdrop-blur-md border border-red-400/30"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(251, 146, 60, 0.8))",
                                boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
                            }}
                        >
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Quick Actions - Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm">
                    <div className="flex flex-col gap-2">
                        <Link 
                            href={`/products/${id}`}
                            className="w-full block"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <button
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
                            >
                                <Eye className="w-4 h-4" />
                                {t.productDetail.viewQuick}
                            </button>
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            disabled={!isInStock || isAddingToCart}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 rounded-lg font-semibold text-sm hover:from-pink-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/50"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {isAddingToCart
                                ? t.productDetail.adding
                                : isInStock
                                    ? t.productDetail.addToCart
                                    : t.productDetail.outOfStockLabel}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 bg-gradient-to-b from-transparent to-black/20 backdrop-blur-sm">
                {/* Product Name */}
                <Link href={`/products/${id}`}>
                    <h3
                        className="font-semibold text-white line-clamp-2 mb-3 min-h-[2.5rem] hover:text-purple-300 transition-colors cursor-pointer"
                        style={{
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        {name}
                    </h3>
                </Link>

                {/* Stock Status */}
                <div className="mb-3">
                    {isInStock ? (
                        <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-200 backdrop-blur-md border border-green-400/30"
                            style={{
                                background: "rgba(34, 197, 94, 0.2)",
                                boxShadow: "0 0 8px rgba(34, 197, 94, 0.3)",
                            }}
                        >
                            {t.productDetail.inStock}
                        </span>
                    ) : (
                        <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-200 backdrop-blur-md border border-red-400/30"
                            style={{
                                background: "rgba(239, 68, 68, 0.2)",
                                boxShadow: "0 0 8px rgba(239, 68, 68, 0.3)",
                            }}
                        >
                            {t.productDetail.outOfStockLabel}
                        </span>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span
                        className="text-lg font-bold"
                        style={{
                            background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            textShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
                        }}
                    >
                        {price.toLocaleString("vi-VN")}₫
                    </span>
                    {originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            {originalPrice.toLocaleString("vi-VN")}₫
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
