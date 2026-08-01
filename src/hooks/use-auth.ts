import { useAppStore } from '../store/app-store';

export const useAuth = () => {
  const status = useAppStore((state) => state.status);
  const currentUser = useAppStore((state) => state.currentUser);
  const errorMessage = useAppStore((state) => state.errorMessage);
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const logout = useAppStore((state) => state.logout);
  const clearError = useAppStore((state) => state.clearError);

  return {
    status,
    currentUser,
    errorMessage,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: status === 'authenticated',
  };
};
