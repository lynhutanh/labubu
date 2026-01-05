export interface ICategoryFilter {
  status?: string;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
  [key: string]: unknown;
}

export interface ICategorySortOptions {
  [key: string]: 1 | -1;
}

export interface ICategoryUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  status?: string;
  sortOrder?: number;
  subcategories?: string[];
  updatedAt: Date;
}

export interface ICategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  topCategories: unknown[];
}
