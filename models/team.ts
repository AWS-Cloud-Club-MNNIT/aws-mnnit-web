import mongoose, { Schema, Document, models } from "mongoose";

export interface ITeam extends Document {
  name: string;
  role: string;
  image: string; // Cloudinary URL
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: true },
    socials: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
    },
  },
  { timestamps: true }
);

const Team = models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
