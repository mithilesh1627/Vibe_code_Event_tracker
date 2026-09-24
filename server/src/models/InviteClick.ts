import mongoose, { Document, Schema } from 'mongoose';

export interface IInviteClick extends Document {
  inviteCode: string;
  eventId: string;
  visitorIdentifier: string;
  clickedAt: Date;
}

const InviteClickSchema = new Schema<IInviteClick>(
  {
    inviteCode: {
      type: String,
      required: [true, 'Invite code is required'],
      index: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      index: true,
    },
    visitorIdentifier: {
      type: String,
      required: [true, 'Visitor identifier is required'],
      index: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for fast deduplication check
InviteClickSchema.index({ inviteCode: 1, visitorIdentifier: 1, clickedAt: -1 });

export const InviteClick = mongoose.model<IInviteClick>('InviteClick', InviteClickSchema);
