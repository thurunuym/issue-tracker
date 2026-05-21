import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttachment {
  url: string;
  filename: string;
  publicId?: string;
  uploadedAt: Date;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  severity: 'Minor' | 'Major' | 'Critical';
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  tags: string[];
  dueDate?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  deletedAt?: Date;
  attachments: IAttachment[];
}

const IssueSchema = new Schema<IIssue>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  severity: { type: String, enum: ['Minor', 'Major', 'Critical'], default: 'Minor' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  deletedAt: { type: Date },
  attachments: [{
    url: String,
    filename: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const Issue = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);