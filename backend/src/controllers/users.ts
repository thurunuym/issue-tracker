import { Response } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/authenticate';

export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const users = await User.find({}).populate({ path: 'roleId', select: 'name permissions' });
  
  // Format to exclude passwords
  const usersList = users.map((u: any) => {
    const raw = u.toObject ? u.toObject() : { ...u };
    delete raw.password;
    return raw;
  });

  return res.json({ users: usersList });
});

export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, roleId, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (isActive !== undefined) updates.isActive = isActive;
  
  if (roleId !== undefined) {
    const roleExists = await Role.findById(roleId);
    if (!roleExists) {
      return res.status(400).json({ message: 'Invalid role ID.' });
    }
    updates.roleId = roleId;
  }

  const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true })
    .populate({ path: 'roleId', select: 'name permissions' });

  const raw = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
  delete raw.password;

  return res.json({ user: raw });
});
