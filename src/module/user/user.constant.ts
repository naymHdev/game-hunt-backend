import { IUser } from './user.interface';

export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export type updateUserProfileType = Partial<
  Pick<IUser, 'name' & 'userId' & 'bio' & 'links' & 'password'>
>;

export type UserRole = keyof typeof USER_ROLE;
export type AdminRole = typeof USER_ROLE.ADMIN;
