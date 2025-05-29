import mongoose, { Schema, Types, model } from 'mongoose';
import { gameCategory } from './game.constant';
import { GameInterface, IPendingGameUpdate } from './game.interface';
import { types } from 'util';
import { linksRegex } from '../../constants/regex.constants';

const pendingGameUpdateSchema = new Schema<IPendingGameUpdate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    gameId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Game ID is required'],
      ref: 'Game',
    },
    title: {
      type: String,
      required: false,
    },
    subTitle: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: [String],
      required: false,
      default: [],
    },
    thumbnail: {
      type: String,
      required: false,
    },
    categories: {
      type: [String],
      required: false,
    },
    platform: {
      type: [String],
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    socialLinks: {
      type: [
        {
          name: { type: String, required: true },
          link: { type: String, required: true },
        },
      ],
      required: false,
    },
    linkType: {
      type: String,
      enum: ['steam', 'itch.io', 'globe', ''],
      required: false,
      default: '',
    },
    gameStatus: {
      type: String,
      enum: ['active', 'upcoming'],
      default: 'active',
    },
    upcomingDate: {
      type: Date,
      validate: {
        validator: function (this: IPendingGameUpdate) {
          return this.gameStatus === 'upcoming' ? !!this.upcomingDate : true;
        },
        message: 'Upcoming date is required when gameStatus is upcoming',
      },
      required: false,
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
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

pendingGameUpdateSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const PendingGameUpdate = model<IPendingGameUpdate>(
  'PendingGameUpdate',
  pendingGameUpdateSchema,
);

export default PendingGameUpdate;
