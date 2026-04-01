import mongoose, { Schema, Document, models } from "mongoose";

export interface ITeam extends Document {
  name: string;
  role: string;
  category: string;
  priority: number;
  image: string; // Cloudinary URL
  specialNote?: string;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: Number, required: true },
    image: { type: String, required: true },
    specialNote: { type: String, required: false },
    socials: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      instagram: { type: String },
    },
  },
  { timestamps: true }
);

const Team = models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
