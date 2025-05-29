import { Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../app/config';
import { USER_ROLE } from './user.constant';
import { IUser, IUserModel } from './user.interface';
import { linksRegex } from '../../constants/regex.constants';

const userSchema = new Schema<IUser, IUserModel>(
  {
    // id: {
    //   type: Types.ObjectId,
    //   required: [false, 'User ID is not required'],
    //   sparse: true,
    //   unique: true
    // },
    sub: {
      type: String,
      required: [true, 'sub is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'name is Required'],
    },
    userName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      unique: true,
    },
    password: {
      type: String,
      required: [false, 'password is not Required'],
      select: false,
    },
    role: {
      type: String,
      enum: [USER_ROLE.ADMIN, USER_ROLE.USER],
      default: USER_ROLE.USER,
    },
    bio: {
      type: String,
      required: [false, 'Bio is not require'],
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
      required: [false, 'photo is not require'],
      default: null,
    },
    approvedUpdate: {
      type: Boolean,
      required: [false, 'Approved update is not require'],
      default: true,
    },
    uploadedGame: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: false,
        default: [],
      },
    ],
    upVotedGame: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: false,
        default: [],
      },
    ],
    upVotedComment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: false,
        default: [],
      },
    ],
    commentedGame: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: false,
        default: [],
      },
    ],
    comments: {
      type: [
        {
          gameId: {
            type: Schema.Types.ObjectId,
            ref: 'Game',
            required: false,
          },
          comment: {
            type: String,
            required: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      required: false,
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Middleware and methods stay the same
// userSchema.set('toJSON', {
//   virtuals: true,
//   transform: function (doc, ret) {
//     delete ret.password;
//     return ret;
//   },
// });

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isNew && user.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds as string),
    );
    return next();
  }

  if (
    !user.approvedUpdate &&
    (user.isModified('name') ||
      user.isModified('bio') ||
      user.isModified('links') ||
      user.isModified('photo'))
  ) {
    return next(
      new Error('Profile updates must be submitted for admin approval'),
    );
  }

  if (user.password && user.isModified('password')) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds as string),
    );
  }

  next();
});

// userSchema.post('save', async function (doc, next) {
//   if (!doc.id) {
//     doc.id = doc._id.toString();
//     await doc.model('User').findByIdAndUpdate(doc._id, { userId: doc.userId });
//   }
//   doc.password = '';
//   next();
// });

userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Static methods implementation
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};

userSchema.statics.isJWTIssuesBeforePasswordChange = async function (
  passwordChangeTimestamp: Date,
  jwtIssuesTime: number,
): Promise<boolean> {
  const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuesTime;
};

const User = model<IUser, IUserModel>('User', userSchema);
export default User;
