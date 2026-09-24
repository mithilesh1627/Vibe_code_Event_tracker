import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInvite extends Document {
  inviteCode: string;
  eventId: string;
  creatorUserId: Types.ObjectId;
  clicks: number;
  createdAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    inviteCode: {
      type: String,
      required: [true, 'Invite code is required'],
      unique: true,
      index: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      index: true,
    },
    creatorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User ID is required'],
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
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

// Allow fast lookup of existing invite for a user and event
InviteSchema.index({ creatorUserId: 1, eventId: 1 });

export const Invite = mongoose.model<IInvite>('Invite', InviteSchema);
