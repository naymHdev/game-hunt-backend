import mongoose, { Schema } from 'mongoose';
import { BlogInterface } from './blog.interface';
import { type } from 'os';

const BlogSchema = new Schema<BlogInterface>(
  {
    author: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    blogImage: {
      type: String,
      required: true,
    },
    altTag: {
      type: String,
      required: true
    },
    rewards: {
      type: [
        {
          code: { type: String, required: true },
          reward: { type: String, required: true },
          validity: { type: String, required: true }
        }
      ],
      required: true,
      default: []
    },
    published: {
      type: Boolean,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
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

BlogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.blogId = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const Blog = mongoose.model<BlogInterface>('Blogs', BlogSchema);

export default Blog;
