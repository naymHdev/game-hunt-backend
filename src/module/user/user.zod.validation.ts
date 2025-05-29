import { z } from 'zod';
import { USER_ROLE } from './user.constant';
import {
  emailRegex,
  linksRegex,
  passwordRegex,
} from '../../constants/regex.constants';

const userSignUpValidation = z.object({
  body: z.object({
    data: z.object({
      sub: z.string({ required_error: 'Sub is required' }),
      name: z
        .string({ required_error: 'Name is required' })
        .min(1, 'Name is required'),
      email: z
        .string({ required_error: 'Email is required' })
        .email()
        .regex(emailRegex, 'Invalid Email'),
      // role: z.enum([USER_ROLE.ADMIN, USER_ROLE.USER]),
      // password: z
      //   .string({ required_error: 'Password is required' })
      //   .min(8, 'minimum password length is 8')
      //   .regex(
      //     passwordRegex,
      //     'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      //   )
      //   .optional(),
      photo: z
        .string()
        .url()
        .regex(linksRegex, 'Link must be valid')
        .optional(),
    }),
  }),
});

const userSignInValidation = z.object({
  body: z.object({
    sub: z.string({ required_error: 'Sub is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .regex(emailRegex, 'Valid email is required'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'minimum password length is 8')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      )
      .optional(),
  }),
});

const userDeleteValidation = z.object({
  body: z.object({
    data: z.object({
      userId: z.string({ required_error: 'UserId is required' }),
    }),
  }),
});

const gameDeleteValidation = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'GameId is required' }),
    }),
  }),
});

const userProfileUpdateValidation = z.object({
  body: z
    .object({
      data: z
        .object({
          name: z
            .string({ required_error: 'Name is required' })
            .min(1, 'Name is required')
            .optional(),
          userName: z.string().optional(),
          bio: z.string().optional(),
          links: z
            .array(
              z.object({
                name: z.string().min(1, 'Link name is required'),
                link: z
                  .string()
                  .url('Each link must be a valid URL')
                  .regex(linksRegex, 'Each link must match the allowed format'),
              }),
            )
            .max(5, 'Maximum 5 links are allowed')
            .refine(
              (links) =>
                new Set(links.map((l) => l.link)).size === links.length,
              {
                message: 'Links must be unique',
              },
            )
            .optional(),
        })
        .optional(),
    })
    // .strict({ message: 'Only name,username, bio, links are allowed' })
    .refine(
      (data) => Object.keys(data).length > 0,
      'At least one field must be provided for update',
    ),
});

const approveUpdateValidation = z.object({
  body: z
    .object({
      updateId: z.string({ required_error: 'Update ID is required' }),
    })
    .strict({ message: 'Only updateId is allowed' }),
});

const rejectUpdateValidation = z.object({
  body: z
    .object({
      updateId: z.string({ required_error: 'Update ID is required' }),
    })
    .strict({ message: 'Only updateId is allowed' }),
});

export const userValidation = {
  userSignUpValidation,
  userSignInValidation,
  userDeleteValidation,
  gameDeleteValidation,
  userProfileUpdateValidation,
  approveUpdateValidation,
  rejectUpdateValidation,
};
