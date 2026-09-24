import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { config } from '../config/index.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    reminderSettings: IUser['reminderSettings'];
  };
}

export class AuthService {
  /**
   * Generates a JWT token for the user
   */
  public static generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: '7d',
    });
  }

  /**
   * Registers a new user with hashed password
   */
  public static async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await User.findOne({ email: dto.email.toLowerCase().trim() });
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      (err as any).statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Initial avatar avatar URL using Dicebear style initials
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dto.name.trim())}&backgroundColor=6366f1,4f46e5`;

    const user = await User.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      avatar: avatarUrl,
      reminderSettings: {
        emailEnabled: true,
        pushEnabled: true,
        reminderHoursBefore: 24,
      },
    });

    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || avatarUrl,
        reminderSettings: user.reminderSettings,
      },
    };
  }

  /**
   * Authenticates user with email and password
   */
  public static async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await User.findOne({ email: dto.email.toLowerCase().trim() });
    if (!user) {
      const err = new Error('Invalid email or password.');
      (err as any).statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      (err as any).statusCode = 401;
      throw err;
    }

    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
        reminderSettings: user.reminderSettings,
      },
    };
  }

  /**
   * Fetches current authenticated user data
   */
  public static async getCurrentUser(userId: string) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      const err = new Error('User not found.');
      (err as any).statusCode = 404;
      throw err;
    }
    return user;
  }
}
