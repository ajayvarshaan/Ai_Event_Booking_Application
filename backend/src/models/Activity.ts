import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  action: string;
  description: string;
  eventId?: mongoose.Types.ObjectId;
  eventTitle?: string;
  bookingId?: mongoose.Types.ObjectId;
  metadata?: any;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['booking_created', 'booking_cancelled', 'event_created', 'event_updated', 'event_deleted', 'user_registered', 'user_login']
  },
  description: {
    type: String,
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  eventTitle: {
    type: String
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', activitySchema);
