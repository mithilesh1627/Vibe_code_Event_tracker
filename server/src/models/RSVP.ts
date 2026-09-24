import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRSVP extends Document {
  userId: Types.ObjectId;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
  eventImage?: string;
  referredByInviteCode?: string;
  createdAt: Date;
}

const RSVPSchema = new Schema<IRSVP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      index: true,
    },
    eventTitle: {
      type: String,
      required: [true, 'Event Title is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event Date is required'],
      index: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    eventImage: {
      type: String,
      default: '',
    },
    referredByInviteCode: {
      type: String,
      default: '',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound unique index to prevent duplicate RSVPs for the same user and event
RSVPSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const RSVP = mongoose.model<IRSVP>('RSVP', RSVPSchema);
