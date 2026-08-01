import { isExpoGo } from '../../shared/utils/runtime';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let handlerConfigured = false;

let activeNotificationId: string | null = null;

const getNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (isExpoGo) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').then((module) => {
      if (!handlerConfigured) {
        module.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });

        handlerConfigured = true;
      }

      return module;
    });
  }

  return notificationsModulePromise;
};

export const notificationService = {
  async requestPermissions() {
    const Notifications = await getNotificationsModule();

    if (!Notifications) {
      return false;
    }

    const permissions = await Notifications.getPermissionsAsync();

    if (permissions.granted) {
      return true;
    }

    const nextPermissions = await Notifications.requestPermissionsAsync();
    return nextPermissions.granted;
  },

  async scheduleSessionCompletion(seconds: number, presetName: string) {
    const Notifications = await getNotificationsModule();

    if (!Notifications) {
      return null;
    }

    if (activeNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeNotificationId);
    }

    activeNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sessao concluida',
        body: `${presetName} terminou. Volte para fechar o ciclo.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds),
      },
    });

    return activeNotificationId;
  },

  async clearScheduledSessionCompletion() {
    const Notifications = await getNotificationsModule();

    if (!Notifications) {
      activeNotificationId = null;
      return;
    }

    if (!activeNotificationId) {
      return;
    }

    await Notifications.cancelScheduledNotificationAsync(activeNotificationId);
    activeNotificationId = null;
  },
};
