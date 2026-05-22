import bcryptjs from 'bcryptjs';
import { User } from '../models/User';
import { Role } from '../models/Role';

export const seedAdminUser = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Skipping admin seed in production');
      return;
    }

    const adminRole = await Role.findOne({ name: 'admin' });

    if (!adminRole) {
      throw new Error('Admin role not found. Please run seed:roles first.');
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env');
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    const adminUser = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRole._id,
      isActive: true,
      lastLoginAt: new Date().toISOString()
    });

    console.log(`Admin user created: ${adminUser.email}`);
  } catch (error: any) {
    console.error('Failed to seed admin user:', error.message);
    throw error;
  }
}

