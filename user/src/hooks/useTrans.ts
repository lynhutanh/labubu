import { useRouter } from "next/router";

import enHome from "../../public/lang/en/home";
import viHome from "../../public/lang/vi/home";
import enCommon from "../../public/lang/en/common";
import viCommon from "../../public/lang/vi/common";
import enHeader from "../../public/lang/en/header";
import viHeader from "../../public/lang/vi/header";
import enProducts from "../../public/lang/en/products";
import viProducts from "../../public/lang/vi/products";
import enProductDetail from "../../public/lang/en/productDetail";
import viProductDetail from "../../public/lang/vi/productDetail";
import enCart from "../../public/lang/en/cart";
import viCart from "../../public/lang/vi/cart";
import enCheckout from "../../public/lang/en/checkout";
import viCheckout from "../../public/lang/vi/checkout";
import enOrder from "../../public/lang/en/order";
import viOrder from "../../public/lang/vi/order";
import enWishlist from "../../public/lang/en/wishlist";
import viWishlist from "../../public/lang/vi/wishlist";
import enProfile from "../../public/lang/en/profile";
import viProfile from "../../public/lang/vi/profile";
import enContact from "../../public/lang/en/contact";
import viContact from "../../public/lang/vi/contact";
import enLogin from "../../public/lang/en/login";
import viLogin from "../../public/lang/vi/login";

export const useTrans = () => {
  const { locale } = useRouter();

  const isVi = locale === "vi";

  return {
    home: isVi ? viHome : enHome,
    common: isVi ? viCommon : enCommon,
    header: isVi ? viHeader : enHeader,
    products: isVi ? viProducts : enProducts,
    productDetail: isVi ? viProductDetail : enProductDetail,
    cart: isVi ? viCart : enCart,
    checkout: isVi ? viCheckout : enCheckout,
    order: isVi ? viOrder : enOrder,
    wishlist: isVi ? viWishlist : enWishlist,
    profile: isVi ? viProfile : enProfile,
    contact: isVi ? viContact : enContact,
    login: isVi ? viLogin : enLogin,
  };
};
