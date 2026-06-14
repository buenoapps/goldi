import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Loads async data whenever the screen gains focus (so it refreshes after
 * returning from a form/modal). `loader` must be memoized by the caller.
 * `reload` forces a manual refresh after an in-screen mutation.
 */
export function useFocusData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loader()
        .then((result) => {
          if (active) {
            setData(result);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loader, nonce]),
  );

  return { data, loading, reload };
}
