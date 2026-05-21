import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

export const authorize = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.permissions || !req.permissions.includes(permission)) {
      return res.status(403).json({
        message: `Forbidden. You do not have the required permission: "${permission}".`
      });
    }
    next();
  };
};

export default authorize;
