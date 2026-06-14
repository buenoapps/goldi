jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '11111111-2222-4333-8444-555555555555'),
}));

import * as Crypto from 'expo-crypto';

import { uuid } from '../uuid';

describe('uuid', () => {
  it('delegates to the platform secure RNG', () => {
    expect(uuid()).toBe('11111111-2222-4333-8444-555555555555');
    expect(Crypto.randomUUID).toHaveBeenCalled();
  });
});
