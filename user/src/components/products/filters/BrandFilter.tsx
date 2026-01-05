import React, { useState, useEffect } from "react";
import { BrandResponse } from "../../../services/brand.service";

interface BrandFilterProps {
  brands: BrandResponse[];
  selectedBrand: string | null;
  onBrandChange: (brandId: string | null) => void;
  loading?: boolean;
  initialLimit?: number;
}

export default function BrandFilter({
  brands,
  selectedBrand,
  onBrandChange,
  loading = false,
  initialLimit = 5,
}: BrandFilterProps) {
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when brands change
  useEffect(() => {
    setShowAll(false);
  }, [brands.length]);

  const displayedBrands = showAll ? brands : brands.slice(0, initialLimit);
  const hasMore = brands.length > initialLimit;

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Thương hiệu</h3>
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải...</div>
      ) : (
        <div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                name="brand"
                value=""
                checked={selectedBrand === null}
                onChange={() => onBrandChange(null)}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-gray-600">Tất cả</span>
            </label>
            {displayedBrands.map((brand) => (
              <label
                key={brand._id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand._id}
                  checked={selectedBrand === brand._id}
                  onChange={(e) => onBrandChange(e.target.value)}
                  className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-600">{brand.name}</span>
              </label>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 w-full text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              {showAll
                ? "Thu gọn"
                : `Xem thêm (${brands.length - initialLimit} nhãn hàng)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
