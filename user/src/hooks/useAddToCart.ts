import { useState } from "react";
import { cartService } from "../services/cart.service";
import { storage } from "../utils/storage";
import toast from "react-hot-toast";

export function useAddToCart() {
  const [loading, setLoading] = useState(false);

  const addToCart = async (productId: string, quantity: number = 1) => {
    const user = storage.getUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return false;
    }

    try {
      setLoading(true);
      await cartService.addToCart({ productId, quantity });
      toast.success("Đã thêm vào giỏ hàng");
      return true;
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      toast.error(
        error?.response?.data?.message || "Không thể thêm vào giỏ hàng"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading };
}
