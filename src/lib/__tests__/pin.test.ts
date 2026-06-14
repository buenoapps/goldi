jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  randomUUID: jest.fn(() => 'fixed-salt'),
  // Deterministic, reversible-to-inspect "hash" for assertions.
  digestStringAsync: jest.fn(async (_alg: string, data: string) => `hash(${data})`),
}));

const mockStore = new Map<string, string>();
jest.mock('../secureStorage', () => ({
  secureGet: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  secureSet: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  secureDelete: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

import { clearPin, isPinSet, setPin, verifyPin } from '../pin';

beforeEach(() => mockStore.clear());

describe('pin', () => {
  it('reports no PIN before one is set', async () => {
    expect(await isPinSet()).toBe(false);
  });

  it('stores a salted hash, never the raw PIN', async () => {
    await setPin('1234');
    expect(await isPinSet()).toBe(true);

    const stored = [...mockStore.values()];
    expect(stored).not.toContain('1234');
    // Hash combines salt + pin.
    expect(stored).toContain('hash(fixed-salt:1234)');
  });

  it('verifies a correct PIN', async () => {
    await setPin('1234');
    expect(await verifyPin('1234')).toBe(true);
  });

  it('rejects an incorrect PIN', async () => {
    await setPin('1234');
    expect(await verifyPin('0000')).toBe(false);
  });

  it('returns false when verifying with no PIN set', async () => {
    expect(await verifyPin('1234')).toBe(false);
  });

  it('clears the stored PIN', async () => {
    await setPin('1234');
    await clearPin();
    expect(await isPinSet()).toBe(false);
    expect(await verifyPin('1234')).toBe(false);
  });
});
