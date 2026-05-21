import { Response } from 'express';
import { Parser } from 'json2csv';
import { Issue } from '../models/Issue';
import { IssueActivity } from '../models/IssueActivity';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';
import { logIssueDiff, createActivity } from '../services/activityService';

export const getIssues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { status, priority, severity, q } = req.query;

  const filter: any = { deletedAt: null };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (severity) filter.severity = severity;

  if (q && typeof q === 'string') {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  const total = await Issue.countDocuments(filter);
  const issues = await Issue.find(filter)
    .populate({ path: 'createdBy', select: 'name email avatar' })
    .populate({ path: 'assignedTo', select: 'name email avatar' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit);

  return res.json({
    issues,
    total,
    page,
    totalPages
  });
});

export const getIssueStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let byStatus: any[] = [];
  let byPriority: any[] = [];
  let total = 0;
  let resolvedToday = 0;

  // Standard MongoDB aggregations
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  total = await Issue.countDocuments({ deletedAt: null });

  byStatus = await Issue.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  byPriority = await Issue.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  resolvedToday = await Issue.countDocuments({
    deletedAt: null,
    status: 'Resolved',
    resolvedAt: { $gte: startOfToday }
  });

  // Load recent 10 global activities for the dashboard
  const recentActivities = await IssueActivity.find({})
    .populate({ path: 'performedBy', select: 'name email avatar' })
    .sort({ createdAt: -1 })
    .limit(10);

  return res.json({
    byStatus,
    byPriority,
    total,
    resolvedToday,
    recentActivities
  });
});

export const getIssueById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const issue = await Issue.findById(id)
    .populate({ path: 'createdBy', select: 'name email avatar' })
    .populate({ path: 'assignedTo', select: 'name email avatar' });

  if (!issue || issue.deletedAt) {
    return res.status(404).json({ message: 'Issue not found.' });
  }

  return res.json(issue);
});

export const createIssue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, priority, severity, assignedTo, tags, dueDate } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  // Handle optional assignments
  let assignedToId = undefined;
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user does not exist.' });
    }
    assignedToId = assignedUser._id;
  }

  const tagList = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []);

  const issue = await Issue.create({
    title,
    description,
    priority: priority || 'Medium',
    severity: severity || 'Minor',
    createdBy: req.user._id,
    assignedTo: assignedToId,
    tags: tagList,
    dueDate: dueDate || null,
    status: 'Open',
    attachments: []
  });

  // Log activity
  await createActivity({
    issueId: String(issue._id),
    performedBy: String(req.user._id),
    action: 'CREATED',
    message: 'Created a new issue'
  });

  // Populate references
  const fullIssue = await Issue.findById(issue._id)
    .populate({ path: 'createdBy', select: 'name email avatar' })
    .populate({ path: 'assignedTo', select: 'name email avatar' });

  return res.status(201).json({ issue: fullIssue });
});

export const updateIssue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);

  if (!issue || issue.deletedAt) {
    return res.status(404).json({ message: 'Issue not found.' });
  }

  // Verify fine-grained access
  const isCreator = String(issue.createdBy?._id || issue.createdBy) === String(req.user._id);
  const hasUpdateAny = req.permissions?.includes('issue:update:any');
  const hasUpdateOwn = req.permissions?.includes('issue:update:own');

  if (!hasUpdateAny && (!hasUpdateOwn || !isCreator)) {
    return res.status(403).json({ message: 'You do not have the permissions to update this issue.' });
  }

  const { title, description, status, priority, severity, assignedTo, tags, dueDate } = req.body;
  
  const updates: any = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (priority !== undefined) {
    if (priority !== issue.priority && !req.permissions?.includes('issue:priority:update') && !hasUpdateAny) {
      return res.status(403).json({ message: 'You do not have permission to update issue priority.' });
    }
    updates.priority = priority;
  }
  if (severity !== undefined) {
    if (severity !== issue.severity && !req.permissions?.includes('issue:severity:update') && !hasUpdateAny) {
      return res.status(403).json({ message: 'You do not have permission to update issue severity.' });
    }
    updates.severity = severity;
  }

  if (assignedTo !== undefined) {
    if (assignedTo && String(assignedTo) !== String(issue.assignedTo)) {
      if (!req.permissions?.includes('issue:assign:any') && !hasUpdateAny) {
        // user: check if can assign to self
        const canAssignSelf = req.permissions?.includes('issue:assign:self') && String(assignedTo) === String(req.user._id);
        if (!canAssignSelf) {
          return res.status(403).json({ message: 'You do not have permission to assign this issue.' });
        }
      }
    }
    updates.assignedTo = assignedTo || null;
  }

  if (tags !== undefined) {
    updates.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []);
  }

  if (dueDate !== undefined) updates.dueDate = dueDate || null;

  if (status !== undefined) {
    if (status === 'Resolved') {
      if (!req.permissions?.includes('issue:resolve') && !hasUpdateAny) {
        return res.status(403).json({ message: 'You do not have permission to resolve issues.' });
      }
      updates.status = 'Resolved';
      updates.resolvedAt = new Date().toISOString();
    } else if (status === 'Closed') {
      if (!req.permissions?.includes('issue:close') && !hasUpdateAny) {
        return res.status(403).json({ message: 'You do not have permission to close issues.' });
      }
      updates.status = 'Closed';
      updates.closedAt = new Date().toISOString();
    } else {
      updates.status = status;
    }
  }

  // Diffs logging
  const oldRaw = issue.toObject ? issue.toObject() : { ...issue };
  const updatedIssue = await Issue.findByIdAndUpdate(id, { $set: updates }, { new: true });
  const newRaw = updatedIssue.toObject ? updatedIssue.toObject() : { ...updatedIssue };

  await logIssueDiff(id as string, String(req.user._id), oldRaw, newRaw);

  const populated = await Issue.findById(id)
    .populate({ path: 'createdBy', select: 'name email avatar' })
    .populate({ path: 'assignedTo', select: 'name email avatar' });

  return res.json({ issue: populated });
});

export const deleteIssue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);

  if (!issue || issue.deletedAt) {
    return res.status(404).json({ message: 'Issue not found.' });
  }

  const isCreator = String(issue.createdBy?._id || issue.createdBy) === String(req.user._id);
  const hasDeleteAny = req.permissions?.includes('issue:delete:any');
  const hasDeleteOwn = req.permissions?.includes('issue:delete:own');

  if (!hasDeleteAny && (!hasDeleteOwn || !isCreator)) {
    return res.status(403).json({ message: 'You do not have the permissions to delete this issue.' });
  }

  await Issue.findByIdAndUpdate(id, { $set: { deletedAt: new Date().toISOString() } });
  
  await createActivity({
    issueId: id as string,
    performedBy: String(req.user._id),
    action: 'CLOSED', // logging code for soft-deletion audit
    message: 'Soft deleted the issue'
  });

  return res.json({ message: 'Issue deleted' });
});

export const getIssueActivities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const activities = await IssueActivity.find({ issueId: id })
    .populate({ path: 'performedBy', select: 'name email avatar' })
    .sort({ createdAt: -1 })
    .limit(20);

  return res.json({ activities });
});



export const addAttachments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);

  if (!issue || issue.deletedAt) {
    return res.status(404).json({ message: 'Issue not found.' });
  }

  const isCreator = String(issue.createdBy?._id || issue.createdBy) === String(req.user._id);
  const hasUpdateAny = req.permissions?.includes('issue:update:any');
  const hasUpdateOwn = req.permissions?.includes('issue:update:own');

  if (!hasUpdateAny && (!hasUpdateOwn || !isCreator)) {
    return res.status(403).json({ message: 'You do not have the permissions to attach files.' });
  }

  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  const uploadedFiles = [];
  for (const file of files) {
    const uploaded = await uploadToCloudinary(file);
    uploadedFiles.push({
      ...uploaded,
      uploadedAt: new Date().toISOString()
    });
  }

  // Add attachments to the DB document
  const updatedIssue = await Issue.findByIdAndUpdate(
    id,
    {
      $push: {
        attachments: { $each: uploadedFiles }
      }
    },
    { new: true }
  );

  await createActivity({
    issueId: id as string,
    performedBy: String(req.user._id),
    action: 'UPDATED',
    field: 'attachments',
    newValue: `${files.length} attachment(s) added`,
    message: `Uploaded ${files.length} attachment(s)`
  });

  return res.json({ attachments: updatedIssue.attachments });
});

export const deleteAttachment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, publicId } = req.params;
  const issue = await Issue.findById(id);

  if (!issue || issue.deletedAt) {
    return res.status(404).json({ message: 'Issue not found.' });
  }

  const isCreator = String(issue.createdBy?._id || issue.createdBy) === String(req.user._id);
  const hasUpdateAny = req.permissions?.includes('issue:update:any');
  const hasUpdateOwn = req.permissions?.includes('issue:update:own');

  if (!hasUpdateAny && (!hasUpdateOwn || !isCreator)) {
    return res.status(403).json({ message: 'You do not have permission to delete attachments.' });
  }

  await deleteFromCloudinary(publicId as string);

  // Update Mongo attachments array
  const updatedIssue = await Issue.findByIdAndUpdate(
    id,
    {
      $pull: {
        attachments: { publicId }
      }
    },
    { new: true }
  );

  await createActivity({
    issueId: id as string,
    performedBy: String(req.user._id),
    action: 'UPDATED',
    field: 'attachments',
    oldValue: publicId as string,
    message: 'Removed an attachment'
  });

  return res.json({ message: 'Attachment deleted', attachments: updatedIssue.attachments });
});

export const exportIssues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { format, status, priority, severity, q } = req.query;

  const filter: any = { deletedAt: null };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (severity) filter.severity = severity;

  if (q && typeof q === 'string') {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  const issues = await Issue.find(filter)
    .populate({ path: 'createdBy', select: 'name email' })
    .populate({ path: 'assignedTo', select: 'name email' })
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Format JSON issues for CSV representation
    const csvRecords = issues.map((issue: any) => ({
      ID: String(issue._id),
      Title: issue.title,
      Status: issue.status,
      Priority: issue.priority,
      Severity: issue.severity,
      'Created By': issue.createdBy ? issue.createdBy.name : 'Unknown',
      'Assigned To': issue.assignedTo ? issue.assignedTo.name : 'Unassigned',
      Tags: Array.isArray(issue.tags) ? issue.tags.join(', ') : '',
      'Due Date': issue.dueDate ? new Date(issue.dueDate).toISOString() : '',
      'Created At': new Date(issue.createdAt).toISOString(),
      'Resolved At': issue.resolvedAt ? new Date(issue.resolvedAt).toISOString() : ''
    }));

    try {
      const fields = ['ID', 'Title', 'Status', 'Priority', 'Severity', 'Created By', 'Assigned To', 'Tags', 'Due Date', 'Created At', 'Resolved At'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvRecords);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=issues-${Date.now()}.csv`);
      return res.send(csv);
    } catch (err: any) {
      return res.status(500).json({ message: 'Error compiling CSV export', error: err.message });
    }
  } else {
    // JSON Export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=issues-${Date.now()}.json`);
    return res.send(JSON.stringify(issues, null, 2));
  }
});
