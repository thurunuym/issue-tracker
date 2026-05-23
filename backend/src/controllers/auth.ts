import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { JWT_REFRESH_SECRET } from '../config/constants';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const userRole = await Role.findOne({ name: 'user' });

  if (!userRole) {
    //  If this hits, seed script didn't run
    return res.status(500).json({ message: 'System configuration error: Default role not found.' });
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    roleId: userRole._id,
    isActive: true,
    lastLoginAt: new Date().toISOString(),
  });

  const accessToken = generateAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = generateRefreshToken({ userId: String(user._id), email: user.email });

  // Store refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const userObject = user.toObject();
  const { password: _, ...userSansPassword } = userObject;

  return res.status(201).json({
    user: userSansPassword,
    accessToken,
    role: 'user',
    permissions: userRole.permissions
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  user.lastLoginAt = new Date().toISOString();
  await User.findByIdAndUpdate(user._id, { lastLoginAt: user.lastLoginAt });

  const role = await Role.findById(user.roleId);
  const permissions = role ? role.permissions : [];
  const roleName = role ? role.name : 'user';

  const accessToken = generateAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = generateRefreshToken({ userId: String(user._id), email: user.email });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const userObject = user.toObject();
  const { password: _, ...userSansPassword } = userObject;

  return res.json({
    user: userSansPassword,
    accessToken,
    role: roleName,
    permissions
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; email: string };
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive.' });
    }

    const accessToken = generateAccessToken({ userId: String(user._id), email: user.email });
    return res.json({ accessToken });
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired refresh token', error: err.message });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });
  return res.json({ message: 'Logged out successfully.' });
});
