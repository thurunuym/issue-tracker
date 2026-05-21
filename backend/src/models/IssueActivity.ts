import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IIssueActivity extends Document {
  issueId: Types.ObjectId;
  performedBy: Types.ObjectId;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNED' | 'COMMENTED' | 'RESOLVED' | 'CLOSED';
  field?: string;
  oldValue?: string;
  newValue?: string;
  message?: string;
}

const IssueActivitySchema = new Schema<IIssueActivity>({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED', 'COMMENTED', 'RESOLVED', 'CLOSED'], 
    required: true 
  },
  field: String,
  oldValue: String,
  newValue: String,
  message: String
}, { timestamps: true });

export const IssueActivity = mongoose.models.IssueActivity || mongoose.model<IIssueActivity>('IssueActivity', IssueActivitySchema);