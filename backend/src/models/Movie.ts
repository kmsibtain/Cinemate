import mongoose, { Schema } from 'mongoose';

const movieSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  watchedDate: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  genres: [{ type: String, required: true }],
  tags: [{ type: String }],
  director: { type: String, required: true },
  actors: [{ type: String, required: true }],
  notes: { type: String },
  posterUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Movie', movieSchema);