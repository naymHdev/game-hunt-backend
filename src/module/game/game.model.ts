import mongoose, { Schema } from 'mongoose';
import {
  CommentsInterface,
  CreateGameModel,
  GameInterface,
  ShareInterface,
  UpvoteInterface,
} from './game.interface';
import { linksRegex } from '../../constants/regex.constants';
import { string } from 'zod';

const GameSchema = new Schema<GameInterface, CreateGameModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    categories: {
      type: [String],
      required: true,
    },
    platform: {
      type: [String],
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    socialLinks: {
      type: [
        {
          name: { type: String, required: true },
          link: { type: String, required: true },
        },
      ],
      required: true,
      default: [],
      validate: [
        {
          validator: (links: { name: string; link: string }[]) =>
            links.length > 0,
          message: 'At least one social link is required',
        },
        {
          validator: (links: { name: string; link: string }[]) =>
            links.every((item) => linksRegex.test(item.link)),
          message: 'Each link must be a valid URL',
        },
      ],
    },
    linkType: {
      type: String,
      enum: ['steam', 'itch.io', 'globe',''],
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
        validator: function (this: GameInterface) {
          return this.gameStatus === 'upcoming' ? !!this.upcomingDate : true;
        },
        message: 'Upcoming date is required when gameStatus is upcoming',
      },
      required: false,
    },
    upvote: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
          },
          createdAt: {
            type: Date,
            default: () => new Date(),
          },
        },
      ],
      default: [],
    },
    totalUpvote: {
      type: Number,
      default: 0,
    },
    comments: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
          commentTime: {
            type: Date,
            default: () => new Date(),
          },
          upvote: {
            type: [
              {
                userId: {
                  type: Schema.Types.ObjectId,
                  ref: 'User',
                  required: true,
                },
                createdAt: {
                  type: Date,
                  default: () => new Date(),
                },
              },
            ],
            default: [],
          },
          totalUpvote: {
            type: Number,
            default: 0,
          },
          report: {
            type: [
              {
                userId: {
                  type: Schema.Types.ObjectId,
                  ref: 'User',
                  required: true,
                },
                reportData: {
                  type: String,
                  default: '',
                },
                createdAt: {
                  type: Date,
                  default: () => new Date(),
                },
              },
            ],
            default: [],
          },
          createdAt: {
            type: Date,
            default: () => new Date(),
          },
        },
      ],
      default: [],
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
        },
      ],
      default: [],
    },
    totalShare: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

GameSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    if (ret.userId && !(ret.userId instanceof Object)) {
      ret.userId = ret.userId.toString();
    }
    ret.comments = ret.comments.map((comment: CommentsInterface) => ({
      ...comment,
      userId: comment.userId.toString(),
      _id: comment._id?.toString(),
    }));
    ret.shares = ret.shares.map((share: ShareInterface) => ({
      ...share,
      userId: share.userId.toString(),
    }));
    return ret;
  },
});
// Middleware
GameSchema.pre('find', function (next) {
  this.where({ isDelete: { $ne: true } });
  next();
});
GameSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: true } } });
  next();
});
GameSchema.pre('findOne', function (next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

// GameSchema.virtual('totalUpvote').get(function () {
//   return this.upvote?.length || 0;
// });

// GameSchema.virtual('totalComments').get(function () {
//   return this.comments?.length || 0;
// });

// GameSchema.virtual('totalShare').get(function () {
//   return this.shares?.length || 0;
// });

GameSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

GameSchema.statics.isExistGame = async function (
  id: string,
): Promise<GameInterface> {
  const game = await this.findById(id);
  if (!game) {
    throw new Error('Game not found');
  }
  return game;
};

const Game = mongoose.model<GameInterface, CreateGameModel>('Game', GameSchema);

export default Game;
