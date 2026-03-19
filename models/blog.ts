import mongoose, { Schema, Document, models } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string; // Markdown content
  thumbnail: string; // Cloudinary URL
  images: string[]; // Additional Cloudinary URLs if any
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    thumbnail: { type: String, required: true },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Blog = models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
