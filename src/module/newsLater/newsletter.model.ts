import { Model, model, Schema } from 'mongoose';
import { INewsletter } from './newsletter.interface';

const NewsletterSchema = new Schema<INewsletter>(
  {
    // userId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },

    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

NewsletterSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const NewsLetter: Model<INewsletter> = model<INewsletter>(
  'NewsLetter',
  NewsletterSchema,
);

export default NewsLetter;
