import { Request, Response, NextFunction } from 'express';
import { File } from 'multer';
import { JwtPayload } from 'jsonwebtoken';
import { AdminRole, UserRole } from '../module/user/user.constant';
import { IUser } from '../module/user/user.interface';
import { IAdmin } from '../module/admin/admin.interface';

export interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AdminPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export type AuthPayload = UserPayload;

export interface RequestWithFiles extends Request {
  user?: LeanDocument<IUser> | LeanDocument<IAdmin>;
  files?: { [fieldname: string]: File[] } | File[] | undefined;
}

export type RequestHandlerWithFiles = (
  req: RequestWithFiles,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

declare global {
  namespace Express {
    interface Request {
      user?: LeanDocument<IUser> | LeanDocument<IAdmin>;
    }
  }
}
