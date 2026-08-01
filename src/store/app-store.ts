import { create } from 'zustand';

import { presetRepository } from '../repositories/preset.repository';
import { sessionRepository } from '../repositories/session.repository';
import { settingsRepository } from '../repositories/settings.repository';
import { userRepository } from '../repositories/user.repository';
import type {
  AppSettingsEntity,
  DashboardSnapshot,
  FocusSessionEntity,
  PomodoroPresetEntity,
  RegisterInput,
  SavePresetInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  UserEntity,
} from '../shared/types/entities';
import { sessionStorageService } from '../services/storage/session-storage.service';
import { loginLocalUserUseCase } from '../use-cases/auth/login-local-user.use-case';
import { logoutUseCase } from '../use-cases/auth/logout.use-case';
import { registerLocalUserUseCase } from '../use-cases/auth/register-local-user.use-case';
import { deletePresetUseCase } from '../use-cases/presets/delete-preset.use-case';
import { savePresetUseCase } from '../use-cases/presets/save-preset.use-case';
import { updateProfileUseCase } from '../use-cases/profile/update-profile.use-case';
import { finishFocusSessionUseCase } from '../use-cases/sessions/finish-focus-session.use-case';
import { startFocusSessionUseCase } from '../use-cases/sessions/start-focus-session.use-case';
import { saveSettingsUseCase } from '../use-cases/settings/save-settings.use-case';

type AuthStatus = 'idle' | 'loading' | 'anonymous' | 'authenticated';

interface AppStoreState {
  status: AuthStatus;
  isReady: boolean;
  errorMessage: string | null;
  currentUser: UserEntity | null;
  settings: AppSettingsEntity | null;
  presets: PomodoroPresetEntity[];
  sessions: FocusSessionEntity[];
  activeSession: FocusSessionEntity | null;
  dashboard: DashboardSnapshot;
  bootstrap: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: (userId?: string) => Promise<void>;
  savePreset: (input: SavePresetInput) => Promise<void>;
  deletePreset: (presetId: string) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  updateSettings: (input: UpdateSettingsInput) => Promise<void>;
  startSession: (presetId: string) => Promise<void>;
  finishSession: (
    status: 'completed' | 'interrupted' | 'cancelled',
    reason?: string | null
  ) => Promise<void>;
  clearError: () => void;
}

const emptyDashboard: DashboardSnapshot = {
  todayFocusMinutes: 0,
  completedSessions: 0,
  streakDays: 0,
};

const loadUserBundle = async (userId: string) => {
  const [currentUser, settings, presets, sessions, activeSession, dashboard] = await Promise.all([
    userRepository.getById(userId),
    settingsRepository.getByUserId(userId),
    presetRepository.listByUserId(userId),
    sessionRepository.listByUserId(userId),
    sessionRepository.getActiveByUserId(userId),
    sessionRepository.getDashboard(userId),
  ]);

  if (!currentUser || !settings) {
    throw new Error('Nao foi possivel carregar a conta local.');
  }

  return {
    currentUser,
    settings,
    presets,
    sessions,
    activeSession,
    dashboard,
  };
};

const setLoadingState = (set: any) => {
  set({ status: 'loading', errorMessage: null });
};

const setErrorState = (set: any, message: string, fallbackStatus: AuthStatus) => {
  set({ errorMessage: message, status: fallbackStatus });
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  status: 'idle',
  isReady: false,
  errorMessage: null,
  currentUser: null,
  settings: null,
  presets: [],
  sessions: [],
  activeSession: null,
  dashboard: emptyDashboard,

  async bootstrap() {
    set({ status: 'loading', errorMessage: null });

    try {
      const currentUserId = await sessionStorageService.getCurrentUserId();

      if (!currentUserId) {
        set({ status: 'anonymous', isReady: true });
        return;
      }

      const bundle = await loadUserBundle(currentUserId);
      set({ ...bundle, status: 'authenticated', isReady: true });
    } catch (error) {
      set({
        status: 'anonymous',
        isReady: true,
        errorMessage: error instanceof Error ? error.message : 'Falha ao iniciar o app.',
      });
    }
  },

  async register(input) {
    setLoadingState(set);

    try {
      const user = await registerLocalUserUseCase(input);
      const bundle = await loadUserBundle(user.id);
      set({ ...bundle, status: 'authenticated', isReady: true });
    } catch (error) {
      setErrorState(
        set,
        error instanceof Error ? error.message : 'Nao foi possivel criar a conta.',
        'anonymous'
      );
      throw error;
    }
  },

  async login(input) {
    setLoadingState(set);

    try {
      const user = await loginLocalUserUseCase(input);
      const bundle = await loadUserBundle(user.id);
      set({ ...bundle, status: 'authenticated', isReady: true });
    } catch (error) {
      setErrorState(
        set,
        error instanceof Error ? error.message : 'Nao foi possivel entrar.',
        'anonymous'
      );
      throw error;
    }
  },

  async logout() {
    setLoadingState(set);

    try {
      await logoutUseCase();
      set({
        status: 'anonymous',
        currentUser: null,
        settings: null,
        presets: [],
        sessions: [],
        activeSession: null,
        dashboard: emptyDashboard,
        errorMessage: null,
        isReady: true,
      });
    } catch (error) {
      setErrorState(set, 'Nao foi possivel sair agora.', 'authenticated');
    }
  },

  async refreshUserData(userId) {
    const targetUserId = userId ?? get().currentUser?.id;

    if (!targetUserId) {
      return;
    }

    const bundle = await loadUserBundle(targetUserId);
    set(bundle);
  },

  async savePreset(input) {
    const userId = get().currentUser?.id;

    if (!userId) {
      return;
    }

    try {
      await savePresetUseCase(userId, input);
      await get().refreshUserData(userId);
    } catch (error) {
      set({ errorMessage: error instanceof Error ? error.message : 'Falha ao salvar timer.' });
      throw error;
    }
  },

  async deletePreset(presetId) {
    const userId = get().currentUser?.id;

    if (!userId) {
      return;
    }

    try {
      await deletePresetUseCase(presetId);
      await get().refreshUserData(userId);
    } catch (error) {
      set({ errorMessage: 'Falha ao excluir timer.' });
    }
  },

  async updateProfile(input) {
    const userId = get().currentUser?.id;

    if (!userId) {
      return;
    }

    try {
      await updateProfileUseCase(userId, input);
      await get().refreshUserData(userId);
    } catch (error) {
      set({ errorMessage: error instanceof Error ? error.message : 'Falha ao atualizar perfil.' });
      throw error;
    }
  },

  async updateSettings(input) {
    const userId = get().currentUser?.id;

    if (!userId) {
      return;
    }

    try {
      await saveSettingsUseCase(userId, input);
      await get().refreshUserData(userId);
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Falha ao salvar preferencias.',
      });
      throw error;
    }
  },

  async startSession(presetId) {
    const state = get();
    const userId = state.currentUser?.id;

    if (!userId || !state.settings) {
      return;
    }

    try {
      await startFocusSessionUseCase(
        userId,
        presetId,
        state.settings.notificationsEnabled === 1
      );
      await get().refreshUserData(userId);
    } catch (error) {
      set({ errorMessage: error instanceof Error ? error.message : 'Falha ao iniciar sessao.' });
      throw error;
    }
  },

  async finishSession(status, reason = null) {
    const state = get();

    if (!state.activeSession || !state.currentUser) {
      return;
    }

    try {
      await finishFocusSessionUseCase(state.activeSession.id, status, reason);
      await get().refreshUserData(state.currentUser.id);
    } catch (error) {
      set({ errorMessage: 'Falha ao encerrar a sessao.' });
    }
  },

  clearError() {
    set({ errorMessage: null });
  },
}));
