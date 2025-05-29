import express from 'express';

import { UserRouter } from '../module/user/user.routes';
import GameRouter from '../module/game/game.routes';
import AuthRouter from '../module/auth/auth.routes';
import AdminRouter from '../module/admin/admin.routes';
import { NewsletterRoute } from '../module/newsLater/newsletter.routes';
import { BlogRouter } from '../module/blog/blog.routes';

const router = express.Router();
const moduleRoutes = [
  { path: '/user', route: UserRouter },
  { path: '/auth', route: AuthRouter },
  { path: '/game', route: GameRouter },
  { path: '/admin', route: AdminRouter },
  { path: '/newsletter', route: NewsletterRoute },
  { path: '/blog', route: BlogRouter }
];

moduleRoutes.forEach((v) => router.use(v.path, v.route));

export default router;
