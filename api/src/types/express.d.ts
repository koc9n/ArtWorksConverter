import { UserSession } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
} 