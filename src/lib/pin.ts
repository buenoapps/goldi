/** Parent-PIN storage. The PIN is salted + SHA-256 hashed; never stored raw. */

import * as Crypto from 'expo-crypto';

import { secureDelete, secureGet, secureSet } from './secureStorage';

const PIN_KEY = 'goldi.pin.hash';
const SALT_KEY = 'goldi.pin.salt';

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function isPinSet(): Promise<boolean> {
  return (await secureGet(PIN_KEY)) !== null;
}

export async function setPin(pin: string): Promise<void> {
  const salt = Crypto.randomUUID();
  const hash = await hashPin(pin, salt);
  await secureSet(SALT_KEY, salt);
  await secureSet(PIN_KEY, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const [salt, stored] = await Promise.all([secureGet(SALT_KEY), secureGet(PIN_KEY)]);
  if (!salt || !stored) return false;
  const hash = await hashPin(pin, salt);
  return hash === stored;
}

export async function clearPin(): Promise<void> {
  await Promise.all([secureDelete(PIN_KEY), secureDelete(SALT_KEY)]);
}
