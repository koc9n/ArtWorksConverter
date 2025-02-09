import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const session = await userService.validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Add user info to request
  req.user = session;
  next();
}; 