import mongoose from 'mongoose';

export const isMockDB = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1); 
  }

  try {
    const conn = await mongoose.connect(mongoURI);

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn(' MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(' MongoDB connection error:', err);
});