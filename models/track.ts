import mongoose, { Schema, Document } from 'mongoose'

export interface ITrack extends Document {
  title: string
  slug: string
  description: string
  image: string
  roadmap: string
  isFree: boolean
  createdAt: Date
}

const TrackSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  roadmap: { type: String, required: true },
  isFree: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema)
