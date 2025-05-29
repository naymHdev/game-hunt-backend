import { z } from 'zod';
import { emailRegex, linksRegex, passwordRegex } from '../../constants/regex.constants';

const adminSignUpValidation = z.object({
  body: z.object({
    data: z.object({
      name: z
        .string({ required_error: 'Name is required' })
        .min(1, 'Name is required'),
      email: z
        .string({ required_error: 'Email is required' })
        .email()
        .regex(emailRegex, 'Invalid Email'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'minimum password length is 8')
        .regex(
          passwordRegex,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
      role: z.enum(['SUPERADMIN', 'ADMIN'], { required_error: 'Choose beteween SuperAdmin or Admin' })
    }),
  }),
});

const adminSignInValidation = z.object({
  body: z.object({
    data: z.object({
      email: z
        .string({ required_error: 'Email is required' })
        .regex(emailRegex, 'Valid email is required'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'minimum password length is 8')
        .regex(
          passwordRegex,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
    })
  }),
});

const approveGameValidation = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'Game ID is required' }),
    }),
  }),
});

const approveGameUpdateValidation = z.object({
  body: z.object({
    data: z.object({
      updateId: z.string({ required_error: 'Update ID is required' }),
    }),
  }),
  // .strict({ message: 'Only updateId is allowed' }),
});

const rejectGameUpdateValidation = z.object({
  body: z.object({
    data: z.object({
      updateId: z.string({ required_error: 'Update game ID is required' }),
    }),
  }),
  // .strict({ message: 'Only updateId is allowed' }),
});

const approveProfileUpdateValidation = z.object({
  body: z.object({
    data: z.object({
      updateId: z.string({ required_error: 'Update profile ID is required' }),
    }),
  }),
  // .strict({ message: 'Only updateId is allowed' }),
});

const rejectProfileUpdateValidation = z.object({
  body: z.object({
    data: z.object({
      updateId: z.string({ required_error: 'Update profile ID is required' }),
    }),
  }),
});

const deleteUserValidationSchema = z.object({
  body: z.object({
    data: z.object({
      userId: z.string({ required_error: 'User iD is required' }),
    }),
  }),
});

const deleteGameValidationSchema = z.object({
  body: z.object({
    data: z.object({
      gameId: z.string({ required_error: 'Game iD is required' }),
    }),
  }),
});

const updateUserToAdminValidation = z.object({
  body: z.object({
    data: z.object({
      userId: z.string({ required_error: 'User ID is required' }),
    }),
  }),
  // .strict({ message: 'Only updateId is allowed' }),
});


const AdminValidationSchema = {
  adminSignUpValidation,
  adminSignInValidation,
  approveGameValidation,
  approveGameUpdateValidation,
  rejectGameUpdateValidation,
  approveProfileUpdateValidation,
  rejectProfileUpdateValidation,
  deleteUserValidationSchema,
  deleteGameValidationSchema,
  updateUserToAdminValidation,
};

export default AdminValidationSchema;
