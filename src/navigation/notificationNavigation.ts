import type { NavigationProp } from '@react-navigation/native';
import type { AppNotification } from '../api/notifications';

/** Navigate to the screen that matches a notification type. */
export function navigateFromNotification(
  navigation: NavigationProp<any>,
  notification: AppNotification,
): void {
  const tabNav = navigation.getParent();
  const data = notification.data ?? {};
  const taskId = data.task_id != null ? Number(data.task_id) : null;
  const applicationId =
    data.application_id != null ? Number(data.application_id) : null;

  if (notification.type === 'application_submitted' && applicationId) {
    tabNav?.navigate('Post', {
      screen: 'ApplicantDetail',
      params: { applicationId },
    });
    return;
  }

  if (
    (notification.type === 'application_hired' ||
      notification.type === 'application_rejected' ||
      notification.type === 'task_completed') &&
    taskId
  ) {
    tabNav?.navigate('Browse', {
      screen: 'TaskDetails',
      params: { taskId },
    });
  }
}
