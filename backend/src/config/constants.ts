export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'issuetracker12345';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'issuetracker67890';
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
