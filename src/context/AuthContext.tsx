/** Parent-PIN gate. Tracks whether a PIN exists and whether the app is unlocked. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearPin, isPinSet, setPin as persistPin, verifyPin } from '@/lib/pin';

type AuthContextValue = {
  /** null while still loading the stored state. */
  hasPin: boolean | null;
  /** True once the parent has unlocked this session (or no PIN is set). */
  unlocked: boolean;
  /** Create the initial PIN and unlock. */
  createPin: (pin: string) => Promise<void>;
  /** Verify a PIN; unlocks on success. Returns whether it matched. */
  unlock: (pin: string) => Promise<boolean>;
  /** Verify the current PIN without changing lock state. */
  verify: (pin: string) => Promise<boolean>;
  /** Replace the PIN (after verifying the current one elsewhere). */
  changePin: (pin: string) => Promise<void>;
  /** Re-lock parent actions. */
  lock: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    (async () => {
      setHasPin(await isPinSet());
    })();
  }, []);

  const createPin = useCallback(async (pin: string) => {
    await persistPin(pin);
    setHasPin(true);
    setUnlocked(true);
  }, []);

  const unlock = useCallback(async (pin: string) => {
    const ok = await verifyPin(pin);
    if (ok) setUnlocked(true);
    return ok;
  }, []);

  const verify = useCallback((pin: string) => verifyPin(pin), []);

  const changePin = useCallback(async (pin: string) => {
    await clearPin();
    await persistPin(pin);
    setHasPin(true);
    setUnlocked(true);
  }, []);

  const lock = useCallback(() => setUnlocked(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({ hasPin, unlocked, createPin, unlock, verify, changePin, lock }),
    [hasPin, unlocked, createPin, unlock, verify, changePin, lock],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
