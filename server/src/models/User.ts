import mongoose, { Document, Schema } from 'mongoose';

export interface IReminderSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderHoursBefore: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  reminderSettings: IReminderSettings;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    reminderSettings: {
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      pushEnabled: {
        type: Boolean,
        default: true,
      },
      reminderHoursBefore: {
        type: Number,
        default: 24,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
