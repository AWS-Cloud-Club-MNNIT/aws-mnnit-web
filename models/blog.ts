import mongoose, { Schema, Document, models } from "mongoose";

// Block types for the dynamic content builder
export type BlockType = "text" | "image" | "mixed" | "code" | "embed";

export interface ITextBlockData {
  html: string; // TipTap HTML output
}

export interface IImageBlockData {
  images: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
  alignment: "left" | "center" | "right" | "full";
  size: "small" | "medium" | "large" | "full";
}

export interface IMixedBlockData {
  imageUrl: string;
  imageAlt?: string;
  imageCaption?: string;
  html: string; // Rich text content
  imagePosition: "left" | "right";
}

export interface ICodeBlockData {
  code: string;
  language: string;
  filename?: string;
}

export interface IEmbedBlockData {
  url: string; // YouTube URL or generic link
  type: "youtube" | "link";
  title?: string;
  caption?: string;
}

export interface IContentBlock {
  id: string;
  type: BlockType;
  order: number;
  data: ITextBlockData | IImageBlockData | IMixedBlockData | ICodeBlockData | IEmbedBlockData;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  coverImage: string;
  tags: string[];
  status: "draft" | "published";
  blocks: IContentBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentBlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "mixed", "code", "embed"], required: true },
    order: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    blocks: { type: [ContentBlockSchema], default: [] },
  },
  { timestamps: true }
);

const Blog = models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
