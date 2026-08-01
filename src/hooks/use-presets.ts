import { useAppStore } from '../store/app-store';

export const usePresets = () => {
  const presets = useAppStore((state) => state.presets);
  const savePreset = useAppStore((state) => state.savePreset);
  const deletePreset = useAppStore((state) => state.deletePreset);

  return {
    presets,
    savePreset,
    deletePreset,
  };
};
