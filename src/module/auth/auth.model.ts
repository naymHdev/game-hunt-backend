import { model, Schema } from 'mongoose';
import { IForgotPassword } from './auth.interface';

const forgotPasswordSchema = new Schema<IForgotPassword>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [false, 'User ID is not required'],
    },
    email: {
      type: String,
      required: [true, 'Email is Not Required'],
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0' },
    },
  },
  { timestamps: true },
);

forgotPasswordSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

const ForgotPassword = model<IForgotPassword>(
  'ForgotPassword',
  forgotPasswordSchema,
);
export default ForgotPassword;
