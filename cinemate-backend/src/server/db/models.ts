import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string; // hashed
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export interface IMovie extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  watchedDate: Date;
  rating: number;
  genres: string[];
  tags?: string[];
  director: string;
  actors: string[];
  notes?: string;
  posterUrl?: string;
}

const MovieSchema = new Schema<IMovie>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  watchedDate: { type: Date, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  genres: { type: [String], required: true },
  tags: { type: [String], default: [] },
  director: { type: String, required: true },
  actors: { type: [String], required: true },
  notes: { type: String },
  posterUrl: { type: String }
});

export const Movie = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
