import { z } from 'zod';
import { emailRegex } from '../../constants/regex.constants';

export const newsletterValidationSchema = z.object({
  body: z.object({
    data: z.object({
      email: z
        .string({ required_error: 'Email is required' })
        .regex(emailRegex, 'Email must be valid'),
    }),
  }),
});

export const newsletterIdValidationSchema = z.object({
  body: z.object({
    data: z.object({
      newsletterId: z.string({ required_error: 'Email is required' }),
    }),
  }),
});
