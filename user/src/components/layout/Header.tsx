import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  LogOut,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Search,
} from "lucide-react";
import { storage } from "../../utils/storage";
import { cartService } from "../../services/cart.service";
import { TOKEN } from "../../services/api-request";
import { useTrans } from "../../hooks/useTrans";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function Header() {
  const router = useRouter();
  const t = useTrans();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      {/* Top blue-gray line */}
      <div className="h-1 bg-gray-700"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Left */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="Labubu Store Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className="text-lg font-bold text-yellow-400 leading-tight"
                style={{
                  textShadow:
                    "2px 2px 0px rgba(255,255,255,0.8), -1px -1px 0px rgba(255,255,255,0.8), 1px 1px 0px rgba(255,255,255,0.8)",
                }}
              >
                LABUBU STORE
              </span>
            </div>
          </Link>

          {/* Navigation Links - Center */}
          <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md transition-colors ${router.pathname === "/"
                ? "text-yellow-400 font-semibold"
                : "text-white hover:text-yellow-400"
                }`}
            >
              {t.header.home}
            </Link>
            <span className="text-white/30">•</span>
            <Link
              href="/products"
              className={`px-4 py-2 rounded-md transition-colors ${router.pathname === "/products"
                ? "text-yellow-400 font-semibold"
                : "text-white hover:text-yellow-400"
                }`}
            >
              {t.header.products}
            </Link>
            <span className="text-white/30">•</span>
            <Link
              href="/contact"
              className={`px-4 py-2 rounded-md transition-colors ${router.pathname === "/contact"
                ? "text-yellow-400 font-semibold"
                : "text-white hover:text-yellow-400"
                }`}
            >
              {t.header.contact}
            </Link>
          </nav>

          {/* Icons Section - Right */}
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-white hover:text-yellow-400 transition-colors relative"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="p-2 text-white hover:text-yellow-400 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              href="/cart"
              className="p-2 text-white hover:text-yellow-400 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Account Icon */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-white hover:text-yellow-400 transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-lg shadow-xl py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        {t.header.account}
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Heart className="w-4 h-4" />
                        {t.header.favorites}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.header.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 text-white hover:text-yellow-400 transition-colors"
                aria-label="Login"
              >
                <User className="w-5 h-5" />
              </Link>
            )}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-white hover:text-yellow-400 transition-colors"
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

        {/* Search Bar (when search is clicked) */}
        {showSearch && (
          <div className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.header.search}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed top-[65px] left-0 right-0 bg-black border-b border-gray-800 shadow-lg z-50 lg:hidden max-h-[calc(100vh-65px)] overflow-y-auto">
            <nav className="px-4 py-4 space-y-1">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${router.pathname === "/"
                  ? "bg-yellow-400/20 text-yellow-400 font-medium"
                  : "text-white hover:bg-gray-800"
                  }`}
              >
                {t.header.home}
              </Link>
              <Link
                href="/products"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${router.pathname === "/products"
                  ? "bg-yellow-400/20 text-yellow-400 font-medium"
                  : "text-white hover:bg-gray-800"
                  }`}
              >
                {t.header.products}
              </Link>
              <Link
                href="/contact"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${router.pathname === "/contact"
                  ? "bg-yellow-400/20 text-yellow-400 font-medium"
                  : "text-white hover:bg-gray-800"
                  }`}
              >
                {t.header.contact}
              </Link>
              {user && (
                <>
                  <div className="border-t border-gray-700 my-2" />
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Tài khoản
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    Yêu thích
                  </Link>
                  <div className="border-t border-gray-700 my-2" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </>
              )}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 bg-yellow-400 text-black rounded-lg text-center font-medium mt-2"
                >
                  {t.header.login}
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
