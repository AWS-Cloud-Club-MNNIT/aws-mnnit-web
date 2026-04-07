import mongoose, { Schema, Document, models } from "mongoose";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface IParticipant extends Document {
  participantId: string;
  registrationId?: string;
  name: string;
  email: string;
  mobile?: string;
  college: string;
  location?: string;
  present: boolean;
  food: boolean;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    participantId: { type: String, required: true, unique: true },
    registrationId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    college: { type: String, required: true },
    location: { type: String },
    present: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

const Participant =
  models.Participant ||
  mongoose.model<IParticipant>("Participant", ParticipantSchema);

export default Participant;
