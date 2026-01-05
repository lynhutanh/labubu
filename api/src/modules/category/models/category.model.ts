import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface ISubcategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status: "active" | "inactive";
  sortOrder: number;
}

export class CategoryModel extends Document {
  _id: ObjectId;

  name: string;

  slug: string;

  description?: string;

  icon?: string;

  image?: string;

  status: "active" | "inactive";

  sortOrder: number;

  subcategories?: ISubcategory[];

  createdAt: Date;

  updatedAt: Date;
}
