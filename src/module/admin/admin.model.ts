import { Model, model, Schema } from 'mongoose';
import { IAdmin } from './admin.interface';
import { USER_ROLE } from '../user/user.constant';
import bcrypt from 'bcrypt';
import config from '../../app/config';

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exist'],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN],
      required: true,
      default: USER_ROLE.ADMIN,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

AdminSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

AdminSchema.pre('save', async function (next) {
  const user = this;
  if (user.isNew || user.isModified('password')) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

// AdminSchema.pre('save', async function (next) {
//   const user = this;

//   if (user.isNew) {
//     if (user.password) {
//       user.password = await bcrypt.hash(
//         user.password,
//         Number(config.bcrypt_salt_rounds as string),
//       );
//     }
//     return next();
//   }

//   if (
//     !user.approvedUpdate &&
//     (user.isModified('name') ||
//       user.isModified('bio') ||
//       user.isModified('links') ||
//       user.isModified('photo'))
//   ) {
//     return next(
//       new Error('Profile updates must be submitted for admin approval'),
//     );
//   }

//   if (user.password && user.isModified('password')) {
//     user.password = await bcrypt.hash(
//       user.password,
//       Number(config.bcrypt_salt_rounds as string),
//     );
//   }

//   next();
// });

// AdminSchema.post('save', async function (doc, next) {
//   if (!doc._id) {
//     doc._id = doc.id;
//     await doc.model('Admin').findByIdAndUpdate(doc._id, { _id: doc._id });
//   }
//   doc.password = '';
//   next();
// });

AdminSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

AdminSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

AdminSchema.pre('findOne', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

AdminSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};

AdminSchema.statics.isJWTIssuesBeforePasswordChange = async function (
  passwordChangeTimestamp: Date,
  jwtIssuesTime: number,
): Promise<boolean> {
  const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000;
  return passwordChangeTime > jwtIssuesTime;
};

const Admin: Model<IAdmin> = model<IAdmin>('Admin', AdminSchema);

export default Admin;
