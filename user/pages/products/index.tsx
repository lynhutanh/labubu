import Head from "next/head";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../../src/components/layout/Layout";
import ProductCardSimple from "../../src/components/products/ProductCardSimple";
import { productService, Product } from "../../src/services/product.service";
import { categoryService, Category } from "../../src/services/category.service";

// Helper function to map Product from API to ProductCardSimple format
const mapProductToCard = (product: Product) => {
    // Get image from files array or coverImage
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
    
    // Determine badge based on product data
    let badge: "Best Seller" | "Hot" | "New" | undefined = undefined;
    if (product.soldCount && product.soldCount > 50) {
        badge = "Best Seller";
    } else if (product.salePrice && product.salePrice > 0) {
        badge = "Hot";
    } else {
        badge = "New";
    }

    // Get category name - categoryId might be string ID or object
    let categoryName = "Labubu";
    if (product.categoryId) {
        if (typeof product.categoryId === "object" && product.categoryId.name) {
            categoryName = product.categoryId.name;
        } else if ((product as any).category && typeof (product as any).category === "object") {
            categoryName = (product as any).category.name || "Labubu";
        }
    }

    return {
        id: product.slug || product._id, // Use slug for URL, fallback to _id
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

export default function ProductsPage() {
    const { t } = useTranslation("common");
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

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load categories on mount
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

    // Load products with filters whenever filters change
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                
                // Build search params
                const searchParams: any = {
                    limit: 100,
                };

                // Add keyword if search query exists
                if (debouncedSearchQuery) {
                    searchParams.keyword = debouncedSearchQuery;
                }

                // Add category filter
                if (selectedCategory !== "all") {
                    searchParams.categoryId = selectedCategory;
                }

                // Add price range filter
                if (priceRange !== "all") {
                    const [min, max] = priceRange.split("-").map(Number);
                    searchParams.minPrice = min;
                    if (max) {
                        searchParams.maxPrice = max;
                    }
                }

                // Add sort
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
                    // default
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

    // Use products directly (already filtered by API)
    const filteredProducts = products;

    return (
        <Layout>
            <Head>
                <title>{t("products.title")}</title>
                <meta
                    name="description"
                    content={t("products.description")}
                />
            </Head>

            {/* Galaxy Background - Common for entire page */}
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
                    <motion.div
                        className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-500 rounded-full opacity-15 blur-3xl"
                        animate={{
                            x: [0, 60, 0],
                            y: [0, -40, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative py-20">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                    >
                        {t("products.pageTitle")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
                    >
                        {t("products.subtitle")}
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <section className="relative py-12 min-h-screen">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search and Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="galaxy-card rounded-2xl p-6 mb-8 backdrop-blur-sm"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5 z-10" />
                                <input
                                    type="text"
                                    placeholder={t("products.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm transition-all"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-purple-500/30 rounded-lg font-medium text-purple-200 transition-all backdrop-blur-sm"
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    {t("products.filter")}
                                </button>

                                {/* View Mode Toggle */}
                                <div className="flex border border-purple-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-3 transition-colors ${viewMode === "grid"
                                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                                : "bg-white/10 text-purple-200 hover:bg-white/20"
                                            }`}
                                        style={viewMode === "grid" ? {
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
                                        style={viewMode === "list" ? {
                                            boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                                        } : {}}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 pt-6 border-t border-purple-500/30"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-purple-200 mb-2">
                                            {t("products.category")}
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                                        >
                                            <option value="all" className="bg-gray-900">{t("products.allCategories")}</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id} className="bg-gray-900">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price Range Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-purple-200 mb-2">
                                            {t("products.priceRange")}
                                        </label>
                                        <select
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                                        >
                                            <option value="all" className="bg-gray-900">{t("products.allPrices")}</option>
                                            <option value="0-200000" className="bg-gray-900">{t("products.priceRange1")}</option>
                                            <option value="200000-300000" className="bg-gray-900">{t("products.priceRange2")}</option>
                                            <option value="300000+" className="bg-gray-900">{t("products.priceRange3")}</option>
                                        </select>
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <label className="block text-sm font-medium text-purple-200 mb-2">
                                            {t("products.sort")}
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
                                        >
                                            <option value="default" className="bg-gray-900">{t("products.sortDefault")}</option>
                                            <option value="price-asc" className="bg-gray-900">{t("products.sortPriceAsc")}</option>
                                            <option value="price-desc" className="bg-gray-900">{t("products.sortPriceDesc")}</option>
                                            <option value="rating" className="bg-gray-900">{t("products.sortRating")}</option>
                                            <option value="newest" className="bg-gray-900">{t("products.sortNewest")}</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Results Count */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-white">
                            {loading ? (
                                t("products.loading")
                            ) : (
                                <>
                                    {t("products.found")}{" "}
                                    <span className="font-semibold text-pink-600">
                                        {filteredProducts.length}
                                    </span>{" "}
                                    {t("products.products")}
                                </>
                            )}
                        </p>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                            <p className="mt-4 text-white">{t("products.loadingProducts")}</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-6"
                            }
                        >
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <ProductCardSimple {...mapProductToCard(product)} />
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
                                    <Search className="w-16 h-16 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t("products.noProducts")}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t("products.noProductsDesc")}
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("all");
                                        setPriceRange("all");
                                    }}
                                    className="px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                                >
                                    {t("products.clearFilters")}
                                </button>
                            </motion.div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}
