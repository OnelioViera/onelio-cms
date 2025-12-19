// src/routes/auth.ts
import express, { Router } from 'express';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { generateToken, verifyToken } from '../middleware/auth';
import { IAuthRequest } from '../types';

const router = Router();

// Register a new user
router.post('/register', async (req: IAuthRequest, res) => {
  try {
    const { email, password, name, tenantSlug } = req.body;

    // Validate input
    if (!email || !password || !name || !tenantSlug) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and tenantSlug are required',
      });
    }

    // Find or create tenant
    let tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      tenant = await Tenant.create({
        name: tenantSlug,
        slug: tenantSlug,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      tenantId: tenant._id,
      role: 'admin',
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: tenant._id.toString(),
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Login
router.post('/login', async (req: IAuthRequest, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user (need to explicitly select password since it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isPasswordValid = await (user.comparePassword as any)(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId.toString(),
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Get current user (requires auth)
router.get('/me', (req: IAuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }

  res.json({
    success: true,
    data: req.user,
  });
});

export default router;

