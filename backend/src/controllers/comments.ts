import { Response } from 'express';
import { Comment } from '../models/Comment';
import { Issue } from '../models/Issue';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/authenticate';

export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; 
  const { text } = req.body;
  const userId = req.user._id;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  // Ensure the issue exists
  const issue = await Issue.findById(id);
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found.' });
  }

  const newComment = await Comment.create({
    issueId: id,
    userId,
    text
  });

  await newComment.populate('userId', 'name avatar');

  return res.status(201).json(newComment);
});

export const getComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  const comments = await Comment.find({ issueId: id })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 });

  return res.json(comments);
});