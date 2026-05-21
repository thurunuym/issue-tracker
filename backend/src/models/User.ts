import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  roleId: mongoose.Types.ObjectId;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);