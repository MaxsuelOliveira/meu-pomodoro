import { notificationService } from '../../services/notifications/notification.service';
import { sessionStorageService } from '../../services/storage/session-storage.service';

export const logoutUseCase = async () => {
  await notificationService.clearScheduledSessionCompletion();
  await sessionStorageService.clear();
};
