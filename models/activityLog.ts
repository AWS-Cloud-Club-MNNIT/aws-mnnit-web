import mongoose, { Schema, Document, models } from "mongoose";

export interface IActivityLog extends Document {
  participantId: string;
  participantName: string;
  action: "verified" | "rejected" | "pending";
  performedBy: string;
  timestamp: Date;
  note?: string;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  participantId: { type: String, required: true },
  participantName: { type: String, required: true },
  action: {
    type: String,
    enum: ["verified", "rejected", "pending"],
    required: true,
  },
  performedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

const ActivityLog =
  models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
