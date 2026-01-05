import { Schema } from "mongoose";

export const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    icon: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    subcategories: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        slug: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        description: {
          type: String,
          default: "",
          maxlength: 500,
        },
        icon: {
          type: String,
          default: "",
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
        sortOrder: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for performance
categorySchema.index({ status: 1, sortOrder: 1 });
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug if not provided
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  // Generate slugs for subcategories
  if (this.subcategories && this.subcategories.length > 0) {
    this.subcategories.forEach((subcat: any) => {
      if (!subcat.slug && subcat.name) {
        subcat.slug = subcat.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      }
    });
  }

  next();
});

export const CategorySchema = categorySchema;
