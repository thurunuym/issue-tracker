import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String, required: true }]
}, { timestamps: true });

export const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);