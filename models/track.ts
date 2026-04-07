import mongoose, { Schema, Document } from 'mongoose'

export interface ITrackProblem {
  id: string
  title: string
  url: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ITrackVideo {
  id: string
  title: string
  youtubeUrl: string // Full YouTube URL — video ID extracted on frontend
}

export interface ITrackResource {
  id: string
  title: string
  url: string
  type: 'article' | 'doc' | 'github' | 'other'
}

export interface ITrackTopic {
  id: string
  title: string
  description: string
  notes?: string
  order: number
  problems: ITrackProblem[]
  videos: ITrackVideo[]
  resources: ITrackResource[]
  subtopics: ITrackTopic[] // Recursive nesting
}

export interface ITrack extends Document {
  title: string
  slug: string
  description: string
  image: string
  isFree: boolean
  topics: ITrackTopic[]
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['article', 'doc', 'github', 'other'], default: 'other' },
}, { _id: false })

const ProblemSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
}, { _id: false })

const VideoSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
}, { _id: false })

// Recursive topic schema — Mongoose handles this via Mixed for deep nesting
const TopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
  problems: { type: [ProblemSchema], default: [] },
  videos: { type: [VideoSchema], default: [] },
  resources: { type: [ResourceSchema], default: [] },
  subtopics: { type: Schema.Types.Mixed, default: [] }, // Recursive
}, { _id: false })

const TrackSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  isFree: { type: Boolean, default: true },
  topics: { type: [TopicSchema], default: [] },
}, { timestamps: true })

export default mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema)
