import mongoose, { Schema, Document, models } from "mongoose";

export interface IParticipant extends Document {
  participantId: string;
  name: string;
  email: string;
  college: string;
  present: boolean;
  food: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    participantId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    college: { type: String, required: true },
    present: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Participant = models.Participant || mongoose.model<IParticipant>("Participant", ParticipantSchema);

export default Participant;
