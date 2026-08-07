import mongoose, { Schema, Document } from 'mongoose';

interface IReview extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);


reviewSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
