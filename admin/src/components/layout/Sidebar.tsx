import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Tag,
  CirclePlus,
  List,
} from "lucide-react";
import { storage } from "../../utils/storage";

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Sản phẩm",
    icon: Package,
    href: "/dashboard/products",
    children: [
      { name: "Danh sách", icon: List, href: "/products" },
      { name: "Tạo mới", icon: CirclePlus, href: "/products/create" },
    ],
  },
  {
    name: "Danh mục",
    icon: FolderTree,
    href: "/categories",
    children: [
      { name: "Danh sách", icon: List, href: "/categories" },
      { name: "Tạo mới", icon: CirclePlus, href: "/categories/create" },
    ],
  },
  {
    name: "Nhãn hàng",
    icon: Tag,
    href: "/brands",
    children: [
      { name: "Danh sách", icon: List, href: "/brands" },
      { name: "Tạo mới", icon: CirclePlus, href: "/brands/create" },
    ],
  },
  {
    name: "Đơn hàng",
    icon: ShoppingBag,
    href: "/orders",
  },
  {
    name: "Khách hàng",
    icon: Users,
    href: "/users",
  },
  {
    name: "Cài đặt",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(storage.getUser());
  }, []);

  if (!mounted) return null;

  const handleLogout = () => {
    storage.clear();
    router.push("/login");
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName],
    );
  };

  const isActive = (
    href: string,
    isParent: boolean = false,
    isChild: boolean = false,
  ) => {
    if (isParent) {
      // Parent menu chỉ active nếu pathname chính xác bằng href (không phải startsWith)
      return router.pathname === href;
    }
    if (isChild) {
      // Child menu chỉ active nếu pathname chính xác bằng href (không dùng startsWith để tránh match với route con khác)
      return router.pathname === href;
    }
    // Menu không có children: check exact match hoặc startsWith
    return router.pathname === href || router.pathname.startsWith(href + "/");
  };

  const hasActiveChild = (children: MenuItem[] | undefined) => {
    if (!children) return false;
    return children.some((child) => isActive(child.href, false, true));
  };

  return (
    <div
      className={`relative backdrop-blur-lg border-r border-purple-500/30 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        background:
          "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(79, 70, 229, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)",
        boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b border-purple-500/30 flex items-center justify-between"
        style={{
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)",
              }}
            >
              <span className="text-white text-lg">⭐</span>
            </div>
            <span
              className="font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Labubu Admin
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.name);
            // Parent menu chỉ active nếu không có child nào active
            const active = hasChildren
              ? !hasActiveChild(item.children) && isActive(item.href, true)
              : isActive(item.href);

            return (
              <li key={item.name}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        active
                          ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white border border-pink-400/50"
                          : "text-purple-200 hover:bg-white/10 hover:text-white"
                      }`}
                      style={
                        active
                          ? {
                              boxShadow: "0 0 15px rgba(236, 72, 153, 0.3)",
                            }
                          : {}
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left font-medium">
                            {item.name}
                          </span>
                          {isExpanded ? (
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.href, false, true);
                          return (
                            <li key={child.name}>
                              <a
                                href={child.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                  childActive
                                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white border border-purple-400/30"
                                    : "text-purple-300 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span>{child.name}</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      active
                        ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white border border-pink-400/50"
                        : "text-purple-200 hover:bg-white/10 hover:text-white"
                    }`}
                    style={
                      active
                        ? {
                            boxShadow: "0 0 15px rgba(236, 72, 153, 0.3)",
                          }
                        : {}
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && user && (
        <div
          className="p-4 border-t border-purple-500/30"
          style={{
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg"
              style={{
                boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)",
              }}
            >
              {(user.name || user.username || "A").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.username}
              </p>
              <p className="text-xs text-purple-300 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
