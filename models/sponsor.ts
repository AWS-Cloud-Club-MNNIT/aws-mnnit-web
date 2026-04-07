import mongoose, { Schema, Document, models } from "mongoose";

export interface ISponsor extends Document {
  companyName: string;
  category: string;
  priority: number;
  sponsorType: string;
  logo: string; // Cloudinary URL
  specialNote?: string;
  websiteLink: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorSchema = new Schema<ISponsor>(
  {
    companyName: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: Number, required: true, default: 10 },
    sponsorType: { type: String, required: true },
    logo: { type: String, required: true },
    specialNote: { type: String, default: "" },
    websiteLink: { type: String, required: true },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
  },
  { timestamps: true }
);

const Sponsor = models.Sponsor || mongoose.model<ISponsor>("Sponsor", SponsorSchema);

export default Sponsor;
