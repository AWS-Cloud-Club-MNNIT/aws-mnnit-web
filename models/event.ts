import mongoose, { Schema, Document, models } from "mongoose";

export type EventSectionType = "overview" | "schedule" | "speakers" | "sponsors" | "faqs" | "gallery";

export interface IScheduleSlot {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  room?: string;
  description?: string;
}

export interface ISpeakerProfile {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface IFAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface IGalleryItem {
  id: string;
  url: string;
  type: "image" | "video"; // video = YouTube URL
  caption?: string;
}

export interface ISponsorItem {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
}

export interface IEventSection {
  id: string;
  type: EventSectionType;
  order: number;
  data:
    | { html: string }                        // overview — rich text
    | { slots: IScheduleSlot[] }              // schedule
    | { speakers: ISpeakerProfile[] }         // speakers
    | { sponsors: ISponsorItem[] }            // sponsors
    | { faqs: IFAQItem[] }                    // faqs
    | { items: IGalleryItem[] };              // gallery
}

export interface IRegistrationLink {
  id: string;
  label: string;
  url: string;
}

export interface IEvent extends Document {
  title: string;
  slug: string;
  banner: string;
  date: Date;
  location: string;
  tags: string[];
  status: "draft" | "published";
  registrationStatus: "open" | "closed" | "coming_soon";
  featured: boolean;
  sections: IEventSection[];
  registrationLinks: IRegistrationLink[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    banner: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, default: "MNNIT Allahabad" },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    registrationStatus: { type: String, enum: ["open", "closed", "coming_soon"], default: "coming_soon" },
    featured: { type: Boolean, default: false },
    sections: {
      type: [
        new Schema(
          {
            id: { type: String, required: true },
            type: { type: String, enum: ["overview", "schedule", "speakers", "sponsors", "faqs", "gallery"], required: true },
            order: { type: Number, required: true },
            data: { type: Schema.Types.Mixed, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    registrationLinks: {
      type: [
        new Schema(
          {
            id: { type: String, required: true },
            label: { type: String, required: true },
            url: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Event = models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
