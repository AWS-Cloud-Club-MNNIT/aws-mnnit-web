import mongoose, { Schema, Document, models } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  banner: string; // Cloudinary URL
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    banner: { type: String, required: true },
    date: { type: Date, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Event = models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
