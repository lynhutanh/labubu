import React from "react";
import { Filter } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import BrandFilter from "./BrandFilter";
import PriceRangeFilter, { PriceRange } from "./PriceRangeFilter";
import { CategoryResponse } from "../../../interfaces";
import { BrandResponse } from "../../../services/brand.service";

interface ProductFiltersProps {
  categories: CategoryResponse[];
  brands: BrandResponse[];
  selectedCategory: string;
  selectedBrand: string | null;
  selectedPriceRange: string | null;
  onCategoryChange: (categoryId: string) => void;
  onBrandChange: (brandId: string | null) => void;
  onPriceRangeChange: (rangeId: string | null) => void;
  total: number;
  loading?: boolean;
  priceRanges?: PriceRange[];
}

export default function ProductFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedPriceRange,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
  total,
  loading = false,
  priceRanges,
}: ProductFiltersProps) {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Bộ lọc
        </h2>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          total={total}
          loading={loading}
        />

        <BrandFilter
          brands={brands}
          selectedBrand={selectedBrand}
          onBrandChange={onBrandChange}
          loading={loading}
        />

        <PriceRangeFilter
          priceRanges={priceRanges}
          selectedPriceRange={selectedPriceRange}
          onPriceRangeChange={onPriceRangeChange}
        />
      </div>
    </aside>
  );
}
