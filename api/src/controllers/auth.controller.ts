import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class AuthController {
  private userService: UserService;
  private SESSION_PREFIX: string;

  constructor() {
    this.userService = new UserService();
    this.SESSION_PREFIX = 'session:';
  }

  login = async (req: Request, res: Response) => {
    try {
      console.log('Login request received:', {
        body: req.body,
        headers: req.headers
      });

      const { email } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
      }

      const user = await this.userService.findOrCreateUser(email);
      const session = await this.userService.createSession(user);

      res.json({
        token: session.token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        // Delete session from Redis
        await this.userService.deleteSession(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      // req.user is already validated by authMiddleware
      const user = await this.userService.getUserById(req.user!.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
} 