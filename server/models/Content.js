import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    ko: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const meaningSchema = new mongoose.Schema(
  {
    ko: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema(
  {
    word: { type: String, required: true, trim: true },
    meaning: { type: meaningSchema, required: true },
    examples: {
      type: [exampleSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "examples must have at least one item",
      },
    },
    publishDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    monthKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    order: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "contents",
  }
);

contentSchema.index({ monthKey: 1, order: 1 }, { unique: true });
contentSchema.index({ publishDate: 1 });
contentSchema.index({ monthKey: 1, isActive: 1 });

export const Content = mongoose.model("Content", contentSchema);
