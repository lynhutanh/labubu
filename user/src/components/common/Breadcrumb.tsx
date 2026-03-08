import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    /** "dark" cho trang galaxy background, "light" cho trang profile nền trắng */
    variant?: "dark" | "light";
}

export default function Breadcrumb({
    items,
    variant = "dark",
}: BreadcrumbProps) {
    const isDark = variant === "dark";

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium tracking-wide uppercase ${isDark ? "text-purple-200" : "text-gray-500"
                }`}
        >
            <Link
                href="/"
                className={`flex items-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap ${isDark ? "hover:text-white" : "hover:text-gray-900"
                    }`}
            >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Trang chủ</span>
            </Link>
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5 sm:gap-2">
                    <ChevronRight
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isDark ? "text-purple-400" : "text-gray-400"
                            }`}
                    />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className={`transition-colors whitespace-nowrap ${isDark ? "hover:text-white" : "hover:text-gray-900"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className={`truncate max-w-[120px] sm:max-w-[200px] md:max-w-none ${isDark ? "text-white" : "text-gray-900"
                                }`}
                        >
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
