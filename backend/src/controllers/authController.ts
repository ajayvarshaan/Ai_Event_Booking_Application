import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from './activityController';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || undefined);

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email, password });

    // Log activity
    try {
      await logActivity({
        user: { _id: user._id, name: user.name, email: user.email },
        action: 'user_registered',
        description: `New user registered: ${user.name}`
      });
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user._id.toString())
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    // Account not found -> distinct error so frontend can prompt to register
    if (!user) {
      res.status(404).json({ message: 'Account not found. Please create a new account.' });
      return;
    }

    // Google-only accounts have no password -> direct them to Google sign-in
    if (user && !user.password) {
      res.status(401).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
      return;
    }
    if (user && (await user.comparePassword(password))) {
      // Log activity
      try {
        await logActivity({
          user: { _id: user._id, name: user.name, email: user.email },
          action: 'user_login',
          description: `User logged in: ${user.name}`
        });
      } catch (activityError) {
        console.error('Activity logging failed:', activityError);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        token: generateToken(user._id.toString())
      });
    } else {
      res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ message: 'Google ID token is required' });
      return;
    }

    let payload: any;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      res.status(401).json({ message: 'Invalid Google token' });
      return;
    }

    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Google account has no email' });
      return;
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const avatar = payload.picture || '';

    // Determine role from ADMIN_EMAILS allowlist (comma-separated in env)
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const role = adminEmails.includes(email) ? 'admin' : 'user';

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: payload.sub,
        avatar,
        role
      });
    } else {
      // Attach googleId/avatar if this account was originally email/password
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.avatar = avatar || user.avatar;
        await user.save();
      }
      // Promote to admin if allowlisted and not already admin
      if (role === 'admin' && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    // Log activity
    try {
      await logActivity({
        user: { _id: user._id, name: user.name, email: user.email },
        action: 'google_login',
        description: `User signed in with Google: ${user.name}`
      });
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user._id.toString())
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(req.user);
};
