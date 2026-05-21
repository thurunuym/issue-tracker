import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/constants';
import { User } from '../models/User';
import { Role } from '../models/Role';

export interface AuthenticatedRequest extends Request {
  user?: any;
  permissions?: string[];
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string; email: string };
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User is inactive or does not exist.' });
    }

    let permissions: string[] = [];
    if (user.roleId) {
      const role = await Role.findById(user.roleId);
      if (role) {
        permissions = role.permissions || [];
        user.role = role.name; //temporary virtual property
      }
    }

    req.user = user;
    req.permissions = permissions;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired access token', error: err.message });
  }
};
