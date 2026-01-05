import React from "react";

export interface PriceRange {
  id: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

interface PriceRangeFilterProps {
  priceRanges: PriceRange[];
  selectedPriceRange: string | null;
  onPriceRangeChange: (rangeId: string | null) => void;
}

const DEFAULT_PRICE_RANGES: PriceRange[] = [
  { id: "under-200", label: "Dưới 200.000₫", maxPrice: 200000 },
  {
    id: "200-500",
    label: "200.000₫ - 500.000₫",
    minPrice: 200000,
    maxPrice: 500000,
  },
  {
    id: "500-1000",
    label: "500.000₫ - 1.000.000₫",
    minPrice: 500000,
    maxPrice: 1000000,
  },
  { id: "over-1000", label: "Trên 1.000.000₫", minPrice: 1000000 },
];

export default function PriceRangeFilter({
  priceRanges = DEFAULT_PRICE_RANGES,
  selectedPriceRange,
  onPriceRangeChange,
}: PriceRangeFilterProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Khoảng giá</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <input
            type="radio"
            name="price"
            value=""
            checked={selectedPriceRange === null}
            onChange={() => onPriceRangeChange(null)}
            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-gray-600">Tất cả</span>
        </label>
        {priceRanges.map((range) => (
          <label
            key={range.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <input
              type="radio"
              name="price"
              value={range.id}
              checked={selectedPriceRange === range.id}
              onChange={(e) => onPriceRangeChange(e.target.value)}
              className="w-4 h-4 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-gray-600">{range.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
