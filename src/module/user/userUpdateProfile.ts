import { Schema, Types, model } from 'mongoose';
import { IPendingUserUpdate } from './user.interface';
import { linksRegex } from '../../constants/regex.constants';
import mongoose from 'mongoose';

const pendingUserUpdateSchema = new Schema<IPendingUserUpdate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    name: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    links: {
      type: [
        {
          name: { type: String, required: true },
          link: { type: String, required: true },
        },
      ],
      required: [false, 'Links are not required'],
      default: [],
      validate: {
        validator: (links: { name: string; link: string }[]) =>
          links.every((item) => linksRegex.test(item.link)),
        message: 'Each link must be a valid URL',
      },
    },
    photo: {
      type: String,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

pendingUserUpdateSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const PendingUserUpdate = model<IPendingUserUpdate>(
  'PendingUserUpdate',
  pendingUserUpdateSchema,
);

export default PendingUserUpdate;
