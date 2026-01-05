import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
    List
} from 'lucide-react';
import { storage } from '../../utils/storage';

interface MenuItem {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        name: 'Sản phẩm',
        icon: Package,
        href: '/dashboard/products',
        children: [
            { name: 'Danh sách', icon: List, href: '/products' },
            { name: 'Tạo mới', icon: CirclePlus, href: '/products/create' },
        ],
    },
    {
        name: 'Danh mục',
        icon: FolderTree,
        href: '/categories',
        children: [
            { name: 'Danh sách', icon: List, href: '/categories' },
            { name: 'Tạo mới', icon: CirclePlus, href: '/categories/create' },
        ],
    },
    {
        name: 'Nhãn hàng',
        icon: Tag,
        href: '/brands',
        children: [
            { name: 'Danh sách', icon: List, href: '/brands' },
            { name: 'Tạo mới', icon: CirclePlus, href: '/brands/create' },
        ],
    },
    {
        name: 'Đơn hàng',
        icon: ShoppingBag,
        href: '/orders',
    },
    {
        name: 'Khách hàng',
        icon: Users,
        href: '/users',
    },
    {
        name: 'Cài đặt',
        icon: Settings,
        href: '/settings',
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
        router.push('/login');
    };

    const toggleMenu = (menuName: string) => {
        setExpandedMenus((prev) =>
            prev.includes(menuName)
                ? prev.filter((name) => name !== menuName)
                : [...prev, menuName]
        );
    };

    const isActive = (href: string, isParent: boolean = false, isChild: boolean = false) => {
        if (isParent) {
            // Parent menu chỉ active nếu pathname chính xác bằng href (không phải startsWith)
            return router.pathname === href;
        }
        if (isChild) {
            // Child menu chỉ active nếu pathname chính xác bằng href (không dùng startsWith để tránh match với route con khác)
            return router.pathname === href;
        }
        // Menu không có children: check exact match hoặc startsWith
        return router.pathname === href || router.pathname.startsWith(href + '/');
    };

    const hasActiveChild = (children: MenuItem[] | undefined) => {
        if (!children) return false;
        return children.some(child => isActive(child.href, false, true));
    };

    return (
        <div
            className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">💄</span>
                        </div>
                        <span className="font-bold text-gray-900">Admin</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
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
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                                                ? 'bg-pink-50 text-pink-600'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
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
                                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${childActive
                                                                    ? 'bg-pink-50 text-pink-600'
                                                                    : 'text-gray-600 hover:bg-gray-100'
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
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                                            ? 'bg-pink-50 text-pink-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
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
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(user.name || user.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name || user.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}
        </div>
    );
}


