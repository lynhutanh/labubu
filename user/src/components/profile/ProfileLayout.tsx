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
                  <p className="text-xs text-gray-400 break-all mb-2">
                    {user.email || ""}
                  </p>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const rank = user.rank || 'new_member';
                      const rankStyles: Record<string, { label: string, style: string }> = {
                        new_member: { label: 'Thành viên mới', style: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
                        copper: { label: 'Đồng', style: 'bg-orange-900/40 text-orange-400 border border-orange-500/30' },
                        silver: { label: 'Bạc', style: 'bg-slate-400/20 text-slate-300 border border-slate-400/30' },
                        gold: { label: 'Vàng', style: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
                        platinum: { label: 'Bạch Kim', style: 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30' },
                        diamond: { label: 'Kim Cương', style: 'bg-blue-400/20 text-blue-300 border border-blue-400/30' },
                        emerald: { label: 'Lục Bảo', style: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' }
                      };
                      const current = rankStyles[rank] || rankStyles.new_member;
                      return (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${current.style}`}>
                          {current.label}
                        </span>
                      );
                    })()}
                  </div>
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
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
