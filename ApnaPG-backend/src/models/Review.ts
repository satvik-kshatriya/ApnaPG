import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  connection_id: mongoose.Types.ObjectId;
  author_id: mongoose.Types.ObjectId;
  target_user_id: mongoose.Types.ObjectId;
  rating: number; // 1-5
  review_text: string;
  created_at: Date;
}

const ReviewSchema: Schema = new Schema({
  connection_id: { type: Schema.Types.ObjectId, ref: 'Connection', required: true, index: true },
  author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  target_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review_text: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
