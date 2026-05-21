export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'issue-tracker-access-secret-key-12345';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'issue-tracker-refresh-secret-key-67890';
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const DEFAULT_ADMIN_PERMISSIONS = [
  "issue:create", "issue:view",
  "issue:update:any", "issue:delete:any",
  "issue:resolve", "issue:close",
  "issue:assign:any", "issue:priority:update",
  "issue:severity:update", "issueActivity:view",
  "user:view", "user:manage"
];

export const DEFAULT_USER_PERMISSIONS = [
  "issue:create", "issue:view",
  "issue:update:own", "issue:delete:own",
  "issue:resolve", "issue:assign:self",
  "issueActivity:view"
];
