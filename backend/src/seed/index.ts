import 'dotenv/config';
import { connectDB } from '../config/db';
import { seedRoles } from './seedRoles';
import { seedAdminUser } from './seedAdmin';

const runSeeds = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    await seedRoles();
    await seedAdminUser();
    console.log('Seeding admin completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Admin seeding failed:', error);
    process.exit(1);
  }
};

runSeeds();
