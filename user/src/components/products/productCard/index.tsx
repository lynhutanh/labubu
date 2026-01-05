import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { useWishlist } from "../../../hooks/useWishlist";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  id: string | number;
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

const ProductCard = ({
  id,
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
}: ProductCardProps) => {
  const { addToCart, loading: addingToCart } = useAddToCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isInStock = stock === undefined || stock === null || stock > 0;
  const inWishlist = typeof id === "string" ? isInWishlist(id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof id === "string") {
      addToCart(id, 1);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof id === "string") {
      await toggleWishlist(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {badge && (
            <span className="px-3 py-1 bg-pink-500 text-white text-xs font-semibold rounded-full">
              {badge}
            </span>
          )}
          {discount && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md ${
            inWishlist ? "opacity-100" : ""
          }`}
          title={inWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart
            className={`w-5 h-5 ${
              inWishlist ? "text-pink-600 fill-pink-600" : "text-pink-600"
            }`}
          />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || addingToCart}
            className="w-full bg-white text-gray-900 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang thêm...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {isInStock ? "Thêm vào giỏ" : "Hết hàng"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {brand}
        </p>
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] hover:text-pink-600 transition-colors cursor-pointer">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-pink-600">
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
};

export default ProductCard;
