import { z } from 'zod';
import { emailRegex, passwordRegex } from '../../constants/regex.constants';
import { USER_ROLE } from '../user/user.constant';

const userSignInValidation = z.object({
  body: z.object({
    data: z.object({
      sub: z.string(),
      email: z.string({ required_error: 'Email is required' }),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'minimum password length is 8')
        .regex(
          passwordRegex,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        )
        .optional(),
    }),
  }),
});

const updateUserPasswordValidation = z.object({
  body: z.object({
    data: z.object({
      userId: z.string({ required_error: 'User id is required' }),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'minimum password length is 8')
        .regex(
          passwordRegex,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
      newPassword: z
        .string({ required_error: 'Password is required' })
        .min(8, 'minimum password length is 8')
        .regex(
          passwordRegex,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
    }),
  }),
});

const forgotPasswordValidation = z.object({
  body: z.object({
    data: z.object({
      email: z
        .string({ required_error: 'Email is required' })
        .regex(emailRegex, 'Valid email is required')
        .email('Email must be a valid email address'),
    }),
  }),
});

const verifyForgotPasswordValidation = z.object({
  body: z.object({
    data: z.object({
      email: z
        .string({ required_error: 'Email is required' })
        .regex(emailRegex, 'Valid email is required')
        .email('Email must be a valid email address'),
      otp: z
        .string({ required_error: 'OTP is required' })
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
      newPassword: z
        .string({ required_error: 'New password is required' })
        .regex(
          passwordRegex,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
    }),
  }),
});

const AuthValidationSchema = {
  userSignInValidation,
  updateUserPasswordValidation,
  forgotPasswordValidation,
  verifyForgotPasswordValidation,
};

export default AuthValidationSchema;
