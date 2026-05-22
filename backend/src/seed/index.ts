import 'dotenv/config';
import { connectDB } from '../config/db';
import { seedRoles } from './seedRoles';

const runSeeds = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    await seedRoles();
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeds();
