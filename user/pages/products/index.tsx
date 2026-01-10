import Head from "next/head";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Grid3x3, List, SlidersHorizontal } from "lucide-react";
import Layout from "../../src/components/layout/Layout";
import ProductCardSimple from "../../src/components/products/ProductCardSimple";

// Fake data - 3 products
const fakeProducts = [
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
];

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("default");

    const filteredProducts = fakeProducts.filter((product) => {
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    return (
        <Layout>
            <Head>
                <title>Sản Phẩm - Labubu</title>
                <meta
                    name="description"
                    content="Khám phá bộ sưu tập Labubu đa dạng, chất lượng cao"
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
                        Sản Phẩm
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
                    >
                        Khám phá bộ sưu tập Labubu đa dạng, chất lượng cao
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <section className="relative py-12 min-h-screen">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    Lọc
                                </button>

                                {/* View Mode Toggle */}
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-3 transition-colors ${viewMode === "grid"
                                                ? "bg-pink-500 text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Grid3x3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-3 transition-colors ${viewMode === "list"
                                                ? "bg-pink-500 text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                            }`}
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
                                className="mt-6 pt-6 border-t border-gray-200"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Danh mục
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="premium">Premium</option>
                                            <option value="cute">Cute</option>
                                            <option value="kawaii">Kawaii</option>
                                        </select>
                                    </div>

                                    {/* Price Range Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Khoảng giá
                                        </label>
                                        <select
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="0-200000">0₫ - 200.000₫</option>
                                            <option value="200000-300000">200.000₫ - 300.000₫</option>
                                            <option value="300000+">Trên 300.000₫</option>
                                        </select>
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sắp xếp
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
                                            <option value="default">Mặc định</option>
                                            <option value="price-asc">Giá: Thấp đến cao</option>
                                            <option value="price-desc">Giá: Cao đến thấp</option>
                                            <option value="rating">Đánh giá cao nhất</option>
                                            <option value="newest">Mới nhất</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-white">
                            Tìm thấy{" "}
                            <span className="font-semibold text-pink-600">
                                {filteredProducts.length}
                            </span>{" "}
                            sản phẩm
                        </p>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-6"
                            }
                        >
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <ProductCardSimple {...product} />
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
