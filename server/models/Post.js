import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    ipHash: { type: String, required: true },
    likes: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    collection: "post",
  }
);

postSchema.index({ wordId: 1, createdAt: -1 });
postSchema.index({ ipHash: 1 });

export const Post = mongoose.model("Post", postSchema);
