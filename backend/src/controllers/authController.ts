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
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');

    
    if (!user) {
      res.status(404).json({ message: 'Account not found. Please create a new account.' });
      return;
    }

    
    if (user && !user.password) {
      res.status(401).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
      return;
    }
    if (user && (await user.comparePassword(password))) {
      
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
      
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.avatar = avatar || user.avatar;
        await user.save();
      }
      
      if (role === 'admin' && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    
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
