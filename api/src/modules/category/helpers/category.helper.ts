import { BadRequestException } from "@nestjs/common";
import { ObjectId } from "mongodb";
import slugify from "slugify";
import { ICategoryFilter, ICategorySortOptions } from "../interfaces";
import { CategorySearchPayload } from "../payloads";

export function validateObjectId(id: string, fieldName: string = "ID"): void {
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ${fieldName}`);
  }
}

export async function generateSlug(name: string): Promise<string> {
  if (!name || typeof name !== "string") {
    throw new BadRequestException("Name is required and must be a string");
  }
  const slug = slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
  return slug;
}

export function buildCategorySearchFilter(
  payload: CategorySearchPayload,
): ICategoryFilter {
  const query: ICategoryFilter = {};

  if (payload.status && payload.status !== "all") {
    query.status = payload.status;
  }

  if (payload.keyword) {
    query.$or = [
      { name: { $regex: payload.keyword, $options: "i" } },
      { description: { $regex: payload.keyword, $options: "i" } },
    ];
  }

  return query;
}

export function buildCategorySortOptions(
  sortBy: string = "sortOrder",
  sortOrder: "asc" | "desc" = "asc",
): ICategorySortOptions {
  const sort: ICategorySortOptions = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  if (sortBy !== "name") {
    sort.name = 1;
  }

  return sort;
}

export function calculateOffset(page?: number, limit: number = 20): number {
  if (page && page > 0) {
    return (page - 1) * limit;
  }
  return 0;
}
