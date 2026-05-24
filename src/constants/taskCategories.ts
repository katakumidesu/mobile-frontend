/** Shared categories for Post form and Browse filters */
export const TASK_CATEGORIES = [
  'Cleaning',
  'Delivery',
  'Moving',
  'Tech',
  'Other',
] as const;

export const BROWSE_CATEGORIES = ['All', ...TASK_CATEGORIES] as const;
