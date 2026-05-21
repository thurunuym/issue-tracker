import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
}

const CommentSchema = new Schema<IComment>({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true });

export const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);