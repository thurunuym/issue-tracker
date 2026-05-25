import { IssueActivity } from '../models/IssueActivity';

export interface ActivityArgs {
  issueId: string;
  performedBy: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNED' | 'COMMENTED' | 'RESOLVED' | 'CLOSED';
  field?: string;
  oldValue?: string;
  newValue?: string;
  message?: string;
}

export const createActivity = async (args: ActivityArgs) => {
  return await IssueActivity.create(args);
};

export const logIssueDiff = async (
  issueId: string,
  userId: string,
  oldData: any,
  newData: any
) => {
  const fieldsToLog = ['title', 'description', 'status', 'priority', 'severity', 'assignedTo', 'tags', 'dueDate'];
  
  for (const field of fieldsToLog) {
    let oldVal = oldData[field];
    let newVal = newData[field];

    // Format fields for comparison
    if (field === 'tags') {
      oldVal = Array.isArray(oldVal) ? oldVal.join(', ') : String(oldVal || '');
      newVal = Array.isArray(newVal) ? newVal.join(', ') : String(newVal || '');
    } else if (field === 'assignedTo') {
      // Get ID string to avoid object comparison
      oldVal = oldVal?._id ? String(oldVal._id) : (oldVal ? String(oldVal) : '');
      newVal = newVal?._id ? String(newVal._id) : (newVal ? String(newVal) : '');
    } else {
      oldVal = oldVal ? String(oldVal) : '';
      newVal = newVal ? String(newVal) : '';
    }

    if (oldVal !== newVal) {
      let action: any = 'UPDATED';
      let message = `Updated ${field} from "${oldVal || 'None'}" to "${newVal || 'None'}"`;

      if (field === 'status') {
        action = 'STATUS_CHANGED';
        if (newVal === 'Resolved') {
          action = 'RESOLVED';
          message = 'Resolved the issue';
        } else if (newVal === 'Closed') {
          action = 'CLOSED';
          message = 'Closed the issue';
        }
      } else if (field === 'priority') {
        action = 'PRIORITY_CHANGED';
      } else if (field === 'assignedTo') {
        action = 'ASSIGNED';
        message = newVal ? `Assigned the issue to user` : `Unassigned the issue`;
      }

      await createActivity({
        issueId,
        performedBy: userId,
        action,
        field,
        oldValue: oldVal,
        newValue: newVal,
        message
      });
    }
  }
};
