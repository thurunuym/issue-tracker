export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId?: any;
  role?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Attachment {
  url: string;
  filename: string;
  publicId: string;
  uploadedAt: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  severity: 'Minor' | 'Major' | 'Critical';
  createdBy: User;
  assignedTo?: User;
  tags?: string[];
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface IssueActivity {
  _id: string;
  issueId: string;
  performedBy: User;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNED' | 'COMMENTED' | 'RESOLVED' | 'CLOSED';
  field?: string;
  oldValue?: string;
  newValue?: string;
  message?: string;
  createdAt: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}
