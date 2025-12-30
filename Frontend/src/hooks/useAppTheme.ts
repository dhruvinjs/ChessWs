import { useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';

export const useAppSetup = () => {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // This effect runs only once when the component using this hook mounts.
    initTheme();
    // console.log("in APp store")
    // NOTE: You can add other one-time setup logic here, e.g.,
    // global event listeners, initial API calls, etc.
  }, [initTheme]);
};
