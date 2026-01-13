import { useRouter } from "next/router";
import { User, LayoutDashboard, Package, MapPin, CreditCard } from "lucide-react";
import { storage } from "../../utils/storage";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    id: "account",
    label: "Chi tiết tài khoản",
    icon: User,
    path: "/profile",
  },
  {
    id: "wallet",
    label: "Ví",
    icon: LayoutDashboard,
    path: "/profile/wallet",
  },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: Package,
    path: "/profile/order",
  },
  {
    id: "address",
    label: "Địa chỉ",
    icon: MapPin,
    path: "/profile/address",
  },
  {
    id: "coupons",
    label: "Phiếu giảm giá",
    icon: CreditCard,
    path: "/profile/coupons",
  },
];

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const router = useRouter();
  const user = storage.getUser();

  if (!user) {
    return null;
  }

  const currentPath = router.pathname;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 text-white">
              {/* User Info Section */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700">
                <div className="w-16 h-16 rounded-full border-2 border-orange-500 flex items-center justify-center flex-shrink-0 bg-transparent">
                  <User className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-200 mb-1 truncate">
                    {user.username || user.name || "User"}
                  </h3>
                  <p className="text-xs text-gray-400 break-all">
                    {user.email || ""}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path || 
                    (item.path === "/profile" && currentPath === "/profile");
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
