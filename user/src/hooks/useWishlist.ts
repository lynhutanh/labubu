import { useState, useEffect } from "react";
import { wishlistService } from "../services/wishlist.service";
import { storage } from "../utils/storage";
import toast from "react-hot-toast";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    const user = storage.getUser();
    if (!user) return;

    try {
      const wishlist = await wishlistService.getWishlist();
      setWishlistItems(wishlist.items?.map((item) => item.productId) || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    const user = storage.getUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
      return false;
    }

    try {
      setLoading(true);
      const isInWishlist = wishlistItems.includes(productId);
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist({ productId });
        setWishlistItems((prev) => prev.filter((id) => id !== productId));
        toast.success("Đã xóa khỏi yêu thích");
      } else {
        await wishlistService.addToWishlist({ productId });
        setWishlistItems((prev) => [...prev, productId]);
        toast.success("Đã thêm vào yêu thích");
      }
      return !isInWishlist;
    } catch (error: any) {
      console.error("Failed to toggle wishlist:", error);
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật yêu thích"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  return { toggleWishlist, isInWishlist, loading };
}
