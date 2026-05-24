export type TaskPermissions = {
  is_owner: boolean;
  role: 'creator' | 'applicant';
  can_edit: boolean;
  can_delete: boolean;
  can_update_status: boolean;
  can_view_applications: boolean;
  can_complete?: boolean;
  can_apply: boolean;
  has_applied?: boolean;
  application_status?: string | null;
};

export function formatTaskStatusLabel(status: string): string {
  switch (status) {
    case 'applied':
      return 'Applied';
    case 'hired':
      return 'Hired';
    case 'declined':
      return 'Declined';
    case 'occupied':
      return 'Occupied';
    case 'in_progress':
      return 'Occupied';
    case 'open':
      return 'Open';
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function statusBadgeStyle(status: string): 'applied' | 'hired' | 'declined' | 'occupied' | null {
  if (['applied', 'hired', 'declined', 'occupied'].includes(status)) {
    return status as 'applied' | 'hired' | 'declined' | 'occupied';
  }
  return null;
}

export const PERMISSION_MESSAGES = {
  notOwner:
    'You do not have permission to modify this task. Only the task creator can edit, update, or delete it.',
  cannotApplyOwn:
    'You cannot apply to a task you posted. Browse other tasks to find work.',
  applyPrompt: (posterName: string) =>
    `Here are the details for the job posted by ${posterName}. Would you like to apply for this position?`,
  ownerPrompt:
    'As the creator of this task, you can update it, change its status, or delete it.',
};

export function defaultPermissions(isOwner: boolean): TaskPermissions {
  return {
    is_owner: isOwner,
    role: isOwner ? 'creator' : 'applicant',
    can_edit: isOwner,
    can_delete: isOwner,
    can_update_status: isOwner,
    can_view_applications: isOwner,
    can_complete: false,
    can_apply: !isOwner,
  };
}
