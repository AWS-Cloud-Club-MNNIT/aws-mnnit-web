import mongoose, { Schema, Document, models } from "mongoose";

export interface IAnalyticsSession extends Document {
  sessionId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  screenResolution?: string;
  startTime: Date;
  lastActivity: Date;
  duration: number; // Duration in seconds
  pageViews: { path: string; timestamp: Date }[];
  isBounce: boolean;
  
  // Advanced tracking fields
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Geographical location
  country?: string;
  city?: string;
  region?: string;
  
  // Web vitals
  performanceMetrics?: {
    lcp: number;
    cls: number;
    fid: number;
    ttfb: number;
    inp: number;
  };
  
  // Custom events
  events: { name: string; timestamp: Date; data?: any }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSessionSchema = new Schema<IAnalyticsSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    deviceId: { type: String },
    ipAddress: { type: String },
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
    
    referrer: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    
    country: { type: String },
    city: { type: String },
    region: { type: String },
    
    performanceMetrics: {
      lcp: { type: Number },
      cls: { type: Number },
      fid: { type: Number },
      ttfb: { type: Number },
      inp: { type: Number },
    },
    
    events: [
      {
        name: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        data: { type: Schema.Types.Mixed },
      }
    ],
  },
  { timestamps: true }
);

const AnalyticsSession =
  models.AnalyticsSession ||
  mongoose.model<IAnalyticsSession>("AnalyticsSession", AnalyticsSessionSchema);

export default AnalyticsSession;
