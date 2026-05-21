import { Router } from 'express';
import multer from 'multer';

import * as authController from '../controllers/auth';
import * as issuesController from '../controllers/issues';
import * as usersController from '../controllers/users';
import * as commentsController from '../controllers/comments';

import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// multer in-memory buffer parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 5 
  }
});


// AUTHENTICATION ROUTES

router.post('/auth/register', authRateLimiter, authController.register);
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);


// ISSUES MANAGEMENT ROUTES (Authenticated)

router.get('/issues', authenticate, issuesController.getIssues);
router.get('/issues/stats', authenticate, issuesController.getIssueStats);
router.get('/issues/export', authenticate, issuesController.exportIssues);
router.get('/issues/:id', authenticate, issuesController.getIssueById);

router.post('/issues', authenticate, authorize('issue:create'), issuesController.createIssue);

router.patch('/issues/:id', authenticate, issuesController.updateIssue);
router.delete('/issues/:id', authenticate, issuesController.deleteIssue);

// Attachments
router.post('/issues/:id/attachments', authenticate, upload.array('files', 5), issuesController.addAttachments);
router.delete('/issues/:id/attachments/:publicId', authenticate, issuesController.deleteAttachment);

// Activity Timeline
router.get('/issues/:id/activity', authenticate, authorize('issueActivity:view'), issuesController.getIssueActivities);

// Comments
router.post('/issues/:id/comments', authenticate, commentsController.addComment);
router.get('/issues/:id/comments', authenticate, commentsController.getComments);


// USER ADMINISTRATION ROUTES (Admin Only)

router.get('/users', authenticate, authorize('user:view'), usersController.getUsers);
router.patch('/users/:id', authenticate, authorize('user:manage'), usersController.updateUser);

export default router;
