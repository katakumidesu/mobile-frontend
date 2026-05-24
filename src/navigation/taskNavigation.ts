type NavLike = {
  getParent?: () => NavLike | undefined;
  getState?: () => { routeNames?: string[] };
  navigate: (name: string, params?: object) => void;
};

/** Finds the bottom-tab navigator (Home / Browse / Post / Profile). */
function getTabNavigation(navigation: NavLike): NavLike {
  let node: NavLike | undefined = navigation;
  while (node) {
    const routeNames = node.getState?.()?.routeNames;
    if (routeNames?.includes('Post')) {
      return node;
    }
    node = node.getParent?.();
  }
  return navigation;
}

/**
 * Opens a fresh task creation form.
 * Pops ManageTask / EditTask and clears form fields via resetAt.
 */
export function openCreateTaskForm(navigation: NavLike) {
  getTabNavigation(navigation).navigate('Post', {
    screen: 'PostForm',
    params: { mode: 'create' as const, resetAt: Date.now() },
  });
}

/**
 * Opens the edit form for an existing task (creator only).
 */
export function openEditTaskForm(navigation: NavLike, taskId: number) {
  getTabNavigation(navigation).navigate('Post', {
    screen: 'EditTask',
    params: { taskId, mode: 'edit' as const },
  });
}
