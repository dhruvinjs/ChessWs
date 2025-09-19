import { useEffect } from 'react';
import { socketManager } from '../utils/socketManager';
import { useUserStore } from '../stores/useUserStore';

export function useSocketSetup() {
  const user = useUserStore(state => state.user);
  
  useEffect(() => {
    if (user?.id) {
      socketManager.connect(user.id);
      return () => socketManager.disconnect();
    }
  }, [user?.id]);
}