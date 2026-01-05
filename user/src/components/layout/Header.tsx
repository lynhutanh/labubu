import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { User, LogOut, ShoppingCart, Heart, Menu, X } from "lucide-react";
import { storage } from "../../utils/storage";
import { cartService } from "../../services/cart.service";
import { TOKEN } from "../../services/api-request";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Load user from storage
    const loadUser = () => {
      const currentUser = storage.getUser();
      setUser(currentUser);
    };

    loadUser();

    // Check for user updates periodically (for login state)
    const interval = setInterval(loadUser, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch cart item count
  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem(TOKEN);
      if (!token || !user) {
        setCartItemCount(0);
        return;
      }

      try {
        const cart = await cartService.getCart();
        setCartItemCount(cart?.totalItems || 0);
      } catch (error) {
        // Silently fail - user might not have cart yet
        setCartItemCount(0);
      }
    };

    if (user) {
      fetchCartCount();
      // Refresh cart count periodically
      const interval = setInterval(fetchCartCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    storage.clear();
    setUser(null);
    router.push("/");
  };

  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user?.name || user?.username || "User") +
    "&background=f472b6&color=fff&size=128";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                <span className="text-white text-xl">💄</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Cosmetics
              </h1>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className={`transition-colors ${
                router.pathname === "/"
                  ? "text-pink-600 font-medium"
                  : "text-gray-600 hover:text-pink-600"
              }`}
            >
              Trang chủ
            </a>
            <a
              href="/products"
              className={`transition-colors ${
                router.pathname === "/products"
                  ? "text-pink-600 font-medium"
                  : "text-gray-600 hover:text-pink-600"
              }`}
            >
              Sản phẩm
            </a>
            {user && (
              <a
                href="/orders"
                className={`transition-colors ${
                  router.pathname === "/orders"
                    ? "text-pink-600 font-medium"
                    : "text-gray-600 hover:text-pink-600"
                }`}
              >
                Đơn hàng
              </a>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={defaultAvatar}
                      alt={user.name || user.username}
                      className="w-10 h-10 rounded-full border-2 border-pink-200"
                    />
                    <span className="text-gray-700 font-medium hidden lg:block">
                      {user.name || user.username}
                    </span>
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name || user.username}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <a
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" />
                          Tài khoản
                        </a>
                        <a
                          href="/wishlist"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Heart className="w-4 h-4" />
                          Yêu thích
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <a
                href="/auth/login"
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-pink-200 transition-all"
              >
                Đăng nhập
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="fixed top-[73px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden max-h-[calc(100vh-73px)] overflow-y-auto">
              <nav className="px-4 py-4 space-y-1">
                <a
                  href="/"
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    router.pathname === "/"
                      ? "bg-pink-50 text-pink-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Trang chủ
                </a>
                <a
                  href="/products"
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    router.pathname === "/products"
                      ? "bg-pink-50 text-pink-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Sản phẩm
                </a>
                {user && (
                  <>
                    <a
                      href="/orders"
                      onClick={() => setShowMobileMenu(false)}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        router.pathname === "/orders"
                          ? "bg-pink-50 text-pink-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Đơn hàng
                    </a>
                    <div className="border-t border-gray-200 my-2" />
                    <a
                      href="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Tài khoản
                    </a>
                    <a
                      href="/wishlist"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      Yêu thích
                    </a>
                    <div className="border-t border-gray-200 my-2" />
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={defaultAvatar}
                          alt={user.name || user.username}
                          className="w-10 h-10 rounded-full border-2 border-pink-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name || user.username}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </>
                )}
                {!user && (
                  <a
                    href="/auth/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-center font-medium mt-2"
                  >
                    Đăng nhập
                  </a>
                )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
