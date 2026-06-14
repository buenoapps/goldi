import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'stored'),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

import { secureDelete, secureGet, secureSet } from '../secureStorage';

const originalOS = Platform.OS;

afterEach(() => {
  (Platform as { OS: string }).OS = originalOS;
  jest.clearAllMocks();
});

describe('secureStorage on native', () => {
  beforeEach(() => {
    (Platform as { OS: string }).OS = 'ios';
  });

  it('delegates reads to SecureStore', async () => {
    await expect(secureGet('k')).resolves.toBe('stored');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('k');
  });

  it('delegates writes to SecureStore', async () => {
    await secureSet('k', 'v');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('k', 'v');
  });

  it('delegates deletes to SecureStore', async () => {
    await secureDelete('k');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('k');
  });
});

describe('secureStorage on web', () => {
  let mem: Record<string, string>;

  beforeEach(() => {
    (Platform as { OS: string }).OS = 'web';
    mem = {};
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => (k in mem ? mem[k] : null),
      setItem: (k: string, v: string) => void (mem[k] = v),
      removeItem: (k: string) => void delete mem[k],
    };
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it('uses localStorage instead of SecureStore', async () => {
    await secureSet('k', 'v');
    expect(mem.k).toBe('v');
    expect(await secureGet('k')).toBe('v');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('removes keys from localStorage', async () => {
    await secureSet('k', 'v');
    await secureDelete('k');
    expect(await secureGet('k')).toBeNull();
  });
});
