import { User, UserSession } from '../types/user.types';
import crypto from 'crypto';
import Redis from 'ioredis';
import { config } from '../config/config';

interface StoredUser extends User {
  loginCount: number;
  lastLogin: Date;
}

export class UserService {
  private redis: Redis;
  private readonly USER_PREFIX = 'user:';
  private readonly SESSION_PREFIX = 'session:';
  private readonly EMAIL_INDEX = 'email_index';

  constructor() {
    this.redis = new Redis(config.redis.url);
  }

  async findOrCreateUser(email: string): Promise<StoredUser> {
    // Check email index for existing user
    const userId = await this.redis.hget(this.EMAIL_INDEX, email);
    let user: StoredUser;

    if (userId) {
      // Get existing user
      const userData = await this.redis.hgetall(`${this.USER_PREFIX}${userId}`);
      user = this.deserializeUser(userData);
    } else {
      // Create new user
      user = {
        id: crypto.randomUUID(),
        email,
        createdAt: new Date(),
        loginCount: 0,
        lastLogin: new Date()
      };
      // Index email to userId
      await this.redis.hset(this.EMAIL_INDEX, email, user.id);
    }

    // Update login stats
    user.loginCount++;
    user.lastLogin = new Date();
    
    // Save user data
    await this.redis.hmset(
      `${this.USER_PREFIX}${user.id}`,
      this.serializeUser(user)
    );

    return user;
  }

  async createSession(user: StoredUser): Promise<UserSession> {
    const token = crypto.randomBytes(32).toString('hex');
    const session: UserSession = {
      userId: user.id,
      email: user.email,
      token,
      createdAt: new Date()
    };

    // Store session with 24h expiry
    await this.redis.hmset(
      `${this.SESSION_PREFIX}${token}`,
      this.serializeSession(session)
    );
    await this.redis.expire(`${this.SESSION_PREFIX}${token}`, 24 * 60 * 60);

    return session;
  }

  async deleteSession(token: string): Promise<void> {
    await this.redis.del(`${this.SESSION_PREFIX}${token}`);
  }

  async validateSession(token: string): Promise<UserSession | null> {
    const sessionData = await this.redis.hgetall(`${this.SESSION_PREFIX}${token}`);
    return Object.keys(sessionData).length ? this.deserializeSession(sessionData) : null;
  }

  async getUserById(userId: string): Promise<StoredUser | null> {
    const userData = await this.redis.hgetall(`${this.USER_PREFIX}${userId}`);
    return Object.keys(userData).length ? this.deserializeUser(userData) : null;
  }

  private serializeUser(user: StoredUser): Record<string, string> {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      loginCount: user.loginCount.toString(),
      lastLogin: user.lastLogin.toISOString()
    };
  }

  private deserializeUser(data: Record<string, string>): StoredUser {
    return {
      id: data.id,
      email: data.email,
      createdAt: new Date(data.createdAt),
      loginCount: parseInt(data.loginCount),
      lastLogin: new Date(data.lastLogin)
    };
  }

  private serializeSession(session: UserSession): Record<string, string> {
    return {
      userId: session.userId,
      email: session.email,
      token: session.token,
      createdAt: session.createdAt.toISOString()
    };
  }

  private deserializeSession(data: Record<string, string>): UserSession {
    return {
      userId: data.userId,
      email: data.email,
      token: data.token,
      createdAt: new Date(data.createdAt)
    };
  }
} 