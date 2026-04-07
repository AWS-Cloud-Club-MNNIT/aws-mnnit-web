import mongoose, { Schema, Document, models } from "mongoose";

export interface IAnalyticsSession extends Document {
  sessionId: string;
  userAgent?: string;
  screenResolution?: string;
  startTime: Date;
  lastActivity: Date;
  duration: number; // Duration in seconds
  pageViews: { path: string; timestamp: Date }[];
  isBounce: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSessionSchema = new Schema<IAnalyticsSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    userAgent: { type: String },
    screenResolution: { type: String },
    startTime: { type: Date, required: true, default: Date.now },
    lastActivity: { type: Date, required: true, default: Date.now },
    duration: { type: Number, default: 0 },
    pageViews: [
      {
        path: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isBounce: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AnalyticsSession =
  models.AnalyticsSession ||
  mongoose.model<IAnalyticsSession>("AnalyticsSession", AnalyticsSessionSchema);

export default AnalyticsSession;
