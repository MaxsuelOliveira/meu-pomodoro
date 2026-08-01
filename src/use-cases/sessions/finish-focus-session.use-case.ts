import { sessionRepository } from '../../repositories/session.repository';
import type { SessionStatus } from '../../shared/types/entities';
import { nowIso } from '../../shared/utils/date';
import { notificationService } from '../../services/notifications/notification.service';

export const finishFocusSessionUseCase = async (
  sessionId: string,
  status: Extract<SessionStatus, 'completed' | 'interrupted' | 'cancelled'>,
  reason: string | null = null
) => {
  await sessionRepository.updateStatus(sessionId, status, nowIso(), reason);
  await notificationService.clearScheduledSessionCompletion();
};
