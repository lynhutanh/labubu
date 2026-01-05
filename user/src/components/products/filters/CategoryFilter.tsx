import React, { useState, useEffect } from "react";
import { CategoryResponse } from "../../../interfaces";

interface CategoryFilterProps {
  categories: CategoryResponse[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  total: number;
  loading?: boolean;
  initialLimit?: number;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  total,
  loading = false,
  initialLimit = 5,
}: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false);

  const activeCategories = categories
    .filter((cat) => cat.status === "active")
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Reset showAll when categories change
  useEffect(() => {
    setShowAll(false);
  }, [activeCategories.length]);

  const displayedCategories = showAll
    ? activeCategories
    : activeCategories.slice(0, initialLimit);
  const hasMore = activeCategories.length > initialLimit;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải...</div>
      ) : (
        <div>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange("all")}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === "all"
                  ? "bg-pink-100 text-pink-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>Tất cả sản phẩm</span>
              <span className="text-gray-400 ml-2">({total})</span>
            </button>
            {displayedCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryChange(category._id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category._id
                    ? "bg-pink-100 text-pink-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{category.name}</span>
                <span className="text-gray-400 ml-2">
                  ({category.productCount ?? 0})
                </span>
              </button>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 w-full text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              {showAll
                ? "Thu gọn"
                : `Xem thêm (${activeCategories.length - initialLimit} danh mục)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
