import * as Crypto from 'expo-crypto';

/** Generates a RFC4122 v4 UUID using the platform's secure RNG. */
export function uuid(): string {
  return Crypto.randomUUID();
}
