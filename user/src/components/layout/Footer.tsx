import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Về chúng tôi */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Về chúng tôi
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Cosmetics là cửa hàng mỹ phẩm uy tín, chuyên cung cấp các sản phẩm
              làm đẹp chính hãng từ các thương hiệu nổi tiếng trên thế giới.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Thông tin liên hệ */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <span>
                  123 Đường Nguyễn Huệ, Quận 1<br />
                  Thành phố Hồ Chí Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <a
                  href="tel:1900123456"
                  className="hover:text-pink-400 transition-colors"
                >
                  1900 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <a
                  href="mailto:info@cosmetics.com"
                  className="hover:text-pink-400 transition-colors"
                >
                  info@cosmetics.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <span>
                  Thứ 2 - Chủ nhật: 9:00 - 22:00
                  <br />
                  (Mở cửa cả ngày lễ)
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-pink-400 transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-pink-400 transition-colors"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-pink-400 transition-colors"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-pink-400 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-pink-400 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-pink-400 transition-colors"
                >
                  Liên hệ với chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Danh mục sản phẩm */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Danh mục sản phẩm
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=skincare"
                  className="hover:text-pink-400 transition-colors"
                >
                  Chăm sóc da
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=makeup"
                  className="hover:text-pink-400 transition-colors"
                >
                  Trang điểm
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=haircare"
                  className="hover:text-pink-400 transition-colors"
                >
                  Chăm sóc tóc
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=fragrance"
                  className="hover:text-pink-400 transition-colors"
                >
                  Nước hoa
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=bodycare"
                  className="hover:text-pink-400 transition-colors"
                >
                  Chăm sóc cơ thể
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=men"
                  className="hover:text-pink-400 transition-colors"
                >
                  Sản phẩm nam
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Cosmetics. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="hover:text-pink-400 transition-colors"
              >
                Bảo mật
              </Link>
              <Link
                href="/terms"
                className="hover:text-pink-400 transition-colors"
              >
                Điều khoản
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-pink-400 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
