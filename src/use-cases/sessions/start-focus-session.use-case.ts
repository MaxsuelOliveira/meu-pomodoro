import { presetRepository } from '../../repositories/preset.repository';
import { sessionRepository } from '../../repositories/session.repository';
import type { FocusSessionEntity } from '../../shared/types/entities';
import { createId } from '../../shared/utils/crypto';
import { nowIso } from '../../shared/utils/date';
import { getSessionTotalDuration } from '../../shared/utils/session-timeline';
import { notificationService } from '../../services/notifications/notification.service';

export const startFocusSessionUseCase = async (userId: string, presetId: string, shouldNotify: boolean) => {
  const active = await sessionRepository.getActiveByUserId(userId);

  if (active) {
    throw new Error('Ja existe uma sessao ativa.');
  }

  const preset = await presetRepository.getById(presetId);

  if (!preset) {
    throw new Error('Timer nao encontrado.');
  }

  const session: FocusSessionEntity = {
    id: createId(),
    userId,
    presetId: preset.id,
    presetName: preset.name,
    focusMinutes: preset.focusMinutes,
    shortBreakMinutes: preset.shortBreakMinutes,
    longBreakMinutes: preset.longBreakMinutes,
    rounds: preset.rounds,
    strictMode: preset.strictMode,
    status: 'active',
    interruptionReason: null,
    startedAt: nowIso(),
    completedAt: null,
    interruptedAt: null,
  };

  await sessionRepository.create(session);

  if (shouldNotify) {
    const granted = await notificationService.requestPermissions();

    if (granted) {
      await notificationService.scheduleSessionCompletion(
        getSessionTotalDuration(session),
        session.presetName
      );
    }
  }

  return sessionRepository.getActiveByUserId(userId);
};
