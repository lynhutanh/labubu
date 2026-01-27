import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Grid3x3, List, SlidersHorizontal } from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import ProductCardSimple from "../../src/components/products/ProductCardSimple";
import { productService, Product } from "../../src/services/product.service";
import { categoryService, Category } from "../../src/services/category.service";

const mapProductToCard = (product: Product) => {
    const firstImage = 
        product.files?.[0]?.url || 
        product.files?.[0]?.thumbnailUrl || 
        (product as any).coverImage || 
        "";
    
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
        } else if ((product as any).category && typeof (product as any).category === "object") {
            categoryName = (product as any).category.name || "Labubu";
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

export default function ProductsPage() {
    const shouldReduceMotion = useReducedMotion();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("default");

    const stars = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            opacity: Math.random() * 0.6 + 0.3,
            delay: Math.random() * 3,
        }));
    }, []);

    const nebulaClouds = useMemo(() => [
        {
            className: "absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full opacity-15 blur-3xl",
            animate: {
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
            },
            transition: {
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse" as const,
            },
        },
        {
            className: "absolute top-40 right-20 w-80 h-80 bg-pink-500 rounded-full opacity-15 blur-3xl",
            animate: {
                x: [0, -40, 0],
                y: [0, 50, 0],
                scale: [1, 1.3, 1],
            },
            transition: {
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse" as const,
            },
        },
    ], []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await categoryService.getAll();
                setCategories(cats);
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                
                const searchParams: any = {
                    limit: 100,
                };

                if (debouncedSearchQuery) {
                    searchParams.keyword = debouncedSearchQuery;
                }

                if (selectedCategory !== "all") {
                    searchParams.categoryId = selectedCategory;
                }

                if (priceRange !== "all") {
                    const [min, max] = priceRange.split("-").map(Number);
                    searchParams.minPrice = min;
                    if (max) {
                        searchParams.maxPrice = max;
                    }
                }

                if (sortBy === "price-asc") {
                    searchParams.sortBy = "price";
                    searchParams.sortOrder = "asc";
                } else if (sortBy === "price-desc") {
                    searchParams.sortBy = "price";
                    searchParams.sortOrder = "desc";
                } else if (sortBy === "rating") {
                    searchParams.sortBy = "rating";
                    searchParams.sortOrder = "desc";
                } else if (sortBy === "newest") {
                    searchParams.sortBy = "createdAt";
                    searchParams.sortOrder = "desc";
                } else {
                    searchParams.sortBy = "createdAt";
                    searchParams.sortOrder = "desc";
                }

                const prodsResponse = await productService.search(searchParams);
                setProducts(prodsResponse.data || []);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadProducts();
    }, [debouncedSearchQuery, selectedCategory, priceRange, sortBy]);

    const filteredProducts = products;

    const animationVariants = {
        fadeIn: {
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 20,
        },
    };

    const animationTransition = {
        duration: shouldReduceMotion ? 0 : 0.4,
    };

    return (
        <Layout>
            <Head>
                <title>Sản Phẩm - Labubu</title>
                <meta
                    name="description"
                    content="Khám phá bộ sưu tập Labubu đa dạng, chất lượng cao"
                />
            </Head>

            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10 overflow-hidden">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.width}px`,
                            height: `${star.height}px`,
                            opacity: star.opacity,
                            animation: shouldReduceMotion ? "none" : `twinkle ${star.delay + 2}s infinite`,
                        }}
                    />
                ))}

                {!shouldReduceMotion && (
                    <div className="absolute top-0 left-0 w-full h-full">
                        {nebulaClouds.map((cloud, index) => (
                            <motion.div
                                key={index}
                                className={cloud.className}
                                animate={cloud.animate}
                                transition={cloud.transition}
                            />
                        ))}
                    </div>
                )}
            </div>

            <section className="relative py-20">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={animationVariants.fadeIn}
                        animate={{ opacity: 1, y: 0 }}
                        transition={animationTransition}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                    >
                        Sản Phẩm
                    </motion.h1>
                    <motion.p
                        initial={animationVariants.fadeIn}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            ...animationTransition,
                            delay: shouldReduceMotion ? 0 : 0.2,
                        }}
                        className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
                    >
                        Khám phá bộ sưu tập Labubu đa dạng, chất lượng cao
                    </motion.p>
                </div>
            </section>

            <section className="relative py-12 min-h-screen">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={animationVariants.fadeIn}
                        animate={{ opacity: 1, y: 0 }}
                        className="galaxy-card rounded-2xl p-6 mb-8 backdrop-blur-sm"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5 z-10" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-purple-500/30 rounded-lg font-medium text-purple-200 transition-all backdrop-blur-sm"
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    Lọc
                                </button>

                                <div className="flex border border-purple-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-3 transition-colors ${viewMode === "grid"
                                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                                : "bg-white/10 text-purple-200 hover:bg-white/20"
                                            }`}
                                        style={viewMode === "grid" && !shouldReduceMotion ? {
                                            boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                                        } : {}}
                                    >
                                        <Grid3x3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-3 transition-colors ${viewMode === "list"
                                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                                : "bg-white/10 text-purple-200 hover:bg-white/20"
                                            }`}
                                        style={viewMode === "list" && !shouldReduceMotion ? {
                                            boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                                        } : {}}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 pt-6 border-t border-purple-500/30"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-purple-200 mb-2">
                                            Danh mục
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                                        >
                                            <option value="all" className="bg-gray-900">Tất cả</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id} className="bg-gray-900">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-purple-200 mb-2">
                                            Khoảng giá
                                        </label>
                                        <select
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                                        >
                                            <option value="all" className="bg-gray-900">Tất cả</option>
                                            <option value="0-200000" className="bg-gray-900">0₫ - 200.000₫</option>
                                            <option value="200000-300000" className="bg-gray-900">200.000₫ - 300.000₫</option>
                                            <option value="300000+" className="bg-gray-900">Trên 300.000₫</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-purple-200 mb-2">
                                            Sắp xếp
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                                        >
                                            <option value="default" className="bg-gray-900">Mặc định</option>
                                            <option value="price-asc" className="bg-gray-900">Giá: Thấp đến cao</option>
                                            <option value="price-desc" className="bg-gray-900">Giá: Cao đến thấp</option>
                                            <option value="rating" className="bg-gray-900">Đánh giá cao nhất</option>
                                            <option value="newest" className="bg-gray-900">Mới nhất</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-white">
                            {loading ? (
                                "Đang tải..."
                            ) : (
                                <>
                                    Tìm thấy{" "}
                                    <span className="font-semibold text-pink-600">
                                        {filteredProducts.length}
                                    </span>{" "}
                                    sản phẩm
                                </>
                            )}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                            <p className="mt-4 text-white">Đang tải sản phẩm...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-6"
                            }
                        >
                            {filteredProducts.map((product) => (
                                <ProductCardSimple
                                    key={product._id}
                                    {...mapProductToCard(product)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <motion.div
                                initial={animationVariants.fadeIn}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={animationTransition}
                                className="max-w-md mx-auto"
                            >
                                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Search className="w-16 h-16 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Không tìm thấy sản phẩm
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("all");
                                        setPriceRange("all");
                                    }}
                                    className="px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </motion.div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}
