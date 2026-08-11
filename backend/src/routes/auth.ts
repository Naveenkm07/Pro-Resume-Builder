import express, { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Resume from '../models/Resume';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
    });

    const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRY || '7d') as StringValue,
    };
    const token = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      signOptions
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Registration successful',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ 
        error: `User already exists` 
      });
      return;
    }
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e: any) => e.message);
      res.status(400).json({ error: messages.join(', ') });
      return;
    }
    
    const errorMessage = error.message || 'Registration failed';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRY || '7d') as StringValue,
    };
    const token = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      signOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
});

router.post('/change-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.delete('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password } = req.body as { password?: string };
    if (user.password) {
      if (!password) {
        res.status(400).json({ error: 'Password is required to delete this account' });
        return;
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        res.status(401).json({ error: 'Password is incorrect' });
        return;
      }
    }

    await Resume.destroy({ where: { user: user.id } });
    await user.destroy();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
