import { z } from 'zod';
import { gameCategory } from './game.constant';
import { urlPattern } from '../../constants/regex.constants';

const SocialLinksSchema = z.object({
  name: z.string().min(1, 'Social link name is required'),
  link: z
    .string()
    .url('Must be a valid URL')
    .regex(urlPattern, 'Invalid URL format'),
});

const GameDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z
    .string()
    .min(1, 'Game title is required')
    .max(100, 'Game title cannot exceed 100 characters'),
  subTitle: z
    .string()
    .max(200, 'Subtitle cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  categories: z
    .array(z.string().min(1, 'Category cannot be empty'))
    .min(1, 'At least one category is required'),
  platform: z.array(z.string().min(1, 'Platform cannot be empty')).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  socialLinks: z.array(SocialLinksSchema).optional(),
  linkType: z
    .enum(['steam', 'itch.io', 'globe',''], {
      required_error: 'Link type must be steam, itch.io, or globe',
    })
    .optional(),

});

const ImageSchema = z.object({
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
});

const GameSchema = z.object({
  body: z.object({
    data: GameDataSchema,
    image: ImageSchema.optional(),
  }),
});

const CommentSchema = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'Game ID is required' }),
      comment: z
        .string({ required_error: 'Comment is required' })
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment cannot exceed 500 characters'),
    }),
  }),
});

const UpvoteCommentSchema = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'Game ID is required' }),
      commentId: z.string({ required_error: 'Comment ID is required' }),
    }),
  }),
});

const UpvoteGameSchema = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'Game ID is required' }),
    }),
  }),
});

const ShareSchema = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'Game ID is required' }),
    }),
  }),
});

const TopGameQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 50, {
      message: 'Limit must be between 1 and 50',
    }),
});

const GameUpdateSchemaValidation = z.object({
  body: z
    .object({
      data: GameDataSchema.partial().extend({
        userId: z.string().min(1, 'User ID is required'),
        gameId: z.string().min(1, 'Game ID is required'),
      }),
      image: ImageSchema.optional(),
    })
    .refine(
      (body) => {
        const { userId, gameId, ...otherFields } = body.data;
        const hasDataToUpdate = Object.keys(otherFields).length > 0;
        const hasImageUpdate =
          body.image?.images?.length || !!body.image?.thumbnail;

        return hasDataToUpdate || hasImageUpdate;
      },
      {
        message: 'At least one field must be provided for update',
        path: ['data'],
      },
    ),
});

// const GameUpdateSchema = z.object({
//   body: z
//     .object({
//       userId: z.string().optional(),
//       gameId: z.string({ required_error: 'Game ID is required' }),
//       game_title: z
//         .string()
//         .min(1, 'Game title is required')
//         .max(100, 'Game title cannot exceed 100 characters')
//         .optional(),
//       category: z
//         .enum(gameCategory as [string, ...string[]], {
//           message: `Category must be one of: ${gameCategory.join(', ')}`,
//         })
//         .optional(),
//       description: z
//         .string()
//         .min(10, 'Description must be at least 10 characters')
//         .max(2000, 'Description cannot exceed 2000 characters')
//         .optional(),
//       price: z.string().optional(),
//       steam_link: z
//         .string()
//         .url('Must be a valid Steam URL')
//         .regex(urlPattern, 'Invalid Steam URL format')
//         .optional(),
//       x_link: z
//         .string()
//         .url('Must be a valid X URL')
//         .regex(urlPattern, 'Invalid X URL format')
//         .optional(),
//       linkedin_link: z
//         .string()
//         .url('Must be a valid LinkedIn URL')
//         .regex(urlPattern, 'Invalid LinkedIn URL format')
//         .optional(),
//       reddit_link: z
//         .string()
//         .url('Must be a valid Reddit URL')
//         .regex(urlPattern, 'Invalid Reddit URL format')
//         .optional(),
//       instagram_link: z
//         .string()
//         .url('Must be a valid Instagram URL')
//         .regex(urlPattern, 'Invalid Instagram URL format')
//         .optional(),
//     })
//     .strict('Only specified fields are allowed')
//     .refine((data) => {
//       const { gameId, ...fields } = data;
//       return Object.keys(fields).length > 0;
//     }, 'At least one field must be provided for update'),
// });

const ApproveGameUpdateValidation = z.object({
  body: z
    .object({
      data: z.object({
        updateId: z.string({ required_error: 'Update ID is required' }),
      }),
    })
    .strict('Only updateId is allowed'),
});

const RejectGameUpdateValidation = z.object({
  body: z
    .object({
      data: z.object({
        updateId: z.string({ required_error: 'Update ID is required' }),
      }),
    })
    .strict('Only updateId is allowed'),
});

const UpdateLinkTypeValidation = z.object({
  body: z
    .object({
      data: z.object({
        gameId: z.string({ required_error: 'Game ID is required' }),
        linkType: z.enum(['steam', 'itch.io', 'globe'], {
          required_error: 'Link type must be steam, itch.io, or globe',
        })
      }),
    })
});

const GameValidationSchema = {
  GameSchema,
  CommentSchema,
  UpvoteCommentSchema,
  UpvoteGameSchema,
  ShareSchema,
  TopGameQuerySchema,
  GameUpdateSchemaValidation,
  UpdateLinkTypeValidation,
  ApproveGameUpdateValidation,
  RejectGameUpdateValidation,
};

export default GameValidationSchema;
