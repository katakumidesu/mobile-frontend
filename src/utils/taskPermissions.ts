export type TaskPermissions = {
  is_owner: boolean;
  role: 'creator' | 'applicant';
  can_edit: boolean;
  can_delete: boolean;
  can_update_status: boolean;
  can_view_applications: boolean;
  can_apply: boolean;
};

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
    can_apply: !isOwner,
  };
}
