import mongoose, { Schema, Document, models } from "mongoose";

export interface IAnalyticsSession extends Document {
  sessionId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  screenResolution?: string;
  startTime: Date;
  lastActivity: Date;
  duration: number; // Engaged seconds (focus time accumulated, not wall-clock)
  exitPage?: string; // Last page reliably flushed via sendBeacon/visibilitychange
  pageViews: {
    path: string;
    timestamp: Date;
    timeOnPage?: number; // Seconds of engaged time on this specific page
  }[];
  isBounce: boolean;

  // Traffic source
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  // Geographical location (from Vercel edge headers)
  country?: string;
  city?: string;
  region?: string;

  // Web vitals
  performanceMetrics?: {
    lcp?: number;
    cls?: number;
    fid?: number;
    ttfb?: number;
    inp?: number;
  };

  // Max scroll depth reached (0-100) keyed by path
  scrollDepths?: Record<string, number>;

  // Custom events (scroll milestones, clicks, custom)
  events: {
    name: string;
    timestamp: Date;
    path?: string;
    data?: Record<string, unknown>;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSessionSchema = new Schema<IAnalyticsSession>(
  {
    sessionId:        { type: String, required: true, unique: true },
    deviceId:         { type: String, index: true },
    ipAddress:        { type: String },
    userAgent:        { type: String },
    screenResolution: { type: String },
    startTime:        { type: Date, required: true, default: Date.now },
    lastActivity:     { type: Date, required: true, default: Date.now, index: true },
    duration:         { type: Number, default: 0 },
    exitPage:         { type: String },
    pageViews: [
      {
        path:       { type: String, required: true },
        timestamp:  { type: Date, default: Date.now },
        timeOnPage: { type: Number, default: 0 },
      },
    ],
    isBounce: { type: Boolean, default: true },

    referrer:     { type: String },
    utmSource:    { type: String },
    utmMedium:    { type: String },
    utmCampaign:  { type: String },
    utmTerm:      { type: String },
    utmContent:   { type: String },

    country: { type: String },
    city:    { type: String },
    region:  { type: String },

    performanceMetrics: {
      lcp:  { type: Number },
      cls:  { type: Number },
      fid:  { type: Number },
      ttfb: { type: Number },
      inp:  { type: Number },
    },

    // scrollDepths: { "/": 75, "/about": 50, ... }
    scrollDepths: { type: Map, of: Number, default: {} },

    events: [
      {
        name:      { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        path:      { type: String },
        data:      { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

// ── Indexes for fast query performance ─────────────────────────────────────────
// sessionId is already unique: true above (creates an index automatically)
AnalyticsSessionSchema.index({ createdAt: 1 });
AnalyticsSessionSchema.index({ lastActivity: 1 });
AnalyticsSessionSchema.index({ deviceId: 1, createdAt: 1 });
AnalyticsSessionSchema.index({ country: 1 });

const AnalyticsSession =
  models.AnalyticsSession ||
  mongoose.model<IAnalyticsSession>("AnalyticsSession", AnalyticsSessionSchema);

export default AnalyticsSession;
