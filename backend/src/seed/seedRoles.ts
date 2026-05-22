import { Role } from '../models/Role';
import { DEFAULT_ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS } from '../config/constants';

export const seedRoles = async () => {
  const roles = [
    { name: 'admin', permissions: DEFAULT_ADMIN_PERMISSIONS },
    { name: 'user', permissions: DEFAULT_USER_PERMISSIONS }
  ];

  for (const roleData of roles) {
    await Role.findOneAndUpdate(
      { name: roleData.name }, 
      roleData, 
      { upsert: true, returnDocument: 'after' }
    );
  }
  console.log('Roles synchronized successfully.');
};