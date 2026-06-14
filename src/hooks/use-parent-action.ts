import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { setPendingAction } from '@/lib/pendingAction';

/**
 * Wraps a parent-only action behind the PIN. If the session is already
 * unlocked the action runs immediately; otherwise we route to the lock modal
 * and run it after a successful unlock.
 */
export function useParentAction() {
  const { unlocked } = useAuth();
  const router = useRouter();

  return useCallback(
    (action: () => void) => {
      if (unlocked) {
        action();
        return;
      }
      setPendingAction(action);
      router.push('/lock');
    },
    [unlocked, router],
  );
}
