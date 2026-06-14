// Mock the heavy/native deps so we can unit-test the pure helpers.
jest.mock('expo-file-system', () => ({ File: class {}, Paths: { cache: {} } }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('@/db/queries', () => ({ buildSnapshot: jest.fn(), replaceAllData: jest.fn() }));

import { ImportError, parseSnapshot, snapshotToCsv } from '../exportImport';
import { SCHEMA_VERSION } from '@/db/schema';
import type { DataSnapshot } from '@/db/types';

function snapshot(overrides: Partial<DataSnapshot> = {}): DataSnapshot {
  return {
    version: SCHEMA_VERSION,
    exported_at: '2026-06-14T00:00:00.000Z',
    children: [
      { id: 'c1', name: 'Mia', color: '#fff', emoji: '🐹', created_at: '' },
      { id: 'c2', name: 'Tom, Jr.', color: '#000', emoji: '🐰', created_at: '' },
    ],
    accounts: [
      { id: 'a1', child_id: 'c1', name: 'Savings', color: '#fff', created_at: '' },
      { id: 'a2', child_id: 'c2', name: 'Pocket', color: '#000', created_at: '' },
    ],
    transactions: [
      {
        id: 't1', account_id: 'a1', date: '2026-06-02', amount_cents: 500,
        comment: 'Gift', type: 'deposit', standing_order_id: null, created_at: '',
      },
      {
        id: 't2', account_id: 'a1', date: '2026-06-01', amount_cents: -250,
        comment: 'Toy "shop"', type: 'withdrawal', standing_order_id: null, created_at: '',
      },
      {
        id: 't3', account_id: 'a2', date: '2026-06-03', amount_cents: 100,
        comment: '', type: 'standing_order', standing_order_id: 's1', created_at: '',
      },
    ],
    standing_orders: [],
    settings: [],
    ...overrides,
  };
}

describe('snapshotToCsv', () => {
  it('emits a header row', () => {
    const lines = snapshotToCsv(snapshot()).split('\n');
    expect(lines[0]).toBe('date,child,account,type,amount,comment');
  });

  it('sorts transactions ascending by date and resolves names', () => {
    const lines = snapshotToCsv(snapshot()).split('\n');
    expect(lines[1]).toBe('2026-06-01,Mia,Savings,withdrawal,-2.50,"Toy ""shop"""');
    expect(lines[2]).toBe('2026-06-02,Mia,Savings,deposit,5.00,Gift');
    expect(lines[3]).toBe('2026-06-03,"Tom, Jr.",Pocket,standing_order,1.00,');
  });

  it('formats amounts as signed decimals', () => {
    const csv = snapshotToCsv(snapshot());
    expect(csv).toContain('5.00');
    expect(csv).toContain('-2.50');
  });

  it('handles an empty transaction list', () => {
    const csv = snapshotToCsv(snapshot({ transactions: [] }));
    expect(csv).toBe('date,child,account,type,amount,comment');
  });
});

describe('parseSnapshot', () => {
  it('accepts a well-formed snapshot', () => {
    const result = parseSnapshot(snapshot());
    expect(result.children).toHaveLength(2);
    expect(result.version).toBe(SCHEMA_VERSION);
  });

  it('defaults settings to an empty array when absent', () => {
    const raw = snapshot() as unknown as Record<string, unknown>;
    delete raw.settings;
    expect(parseSnapshot(raw).settings).toEqual([]);
  });

  it('rejects non-objects', () => {
    expect(() => parseSnapshot(null)).toThrow(ImportError);
    expect(() => parseSnapshot('nope')).toThrow('invalidFormat');
  });

  it('rejects a snapshot missing required arrays', () => {
    const raw = snapshot() as unknown as Record<string, unknown>;
    delete raw.accounts;
    expect(() => parseSnapshot(raw)).toThrow('invalidFormat');
  });

  it('rejects a non-numeric version', () => {
    expect(() => parseSnapshot(snapshot({ version: 'x' as never }))).toThrow('invalidFormat');
  });

  it('rejects a newer schema version', () => {
    expect(() => parseSnapshot(snapshot({ version: SCHEMA_VERSION + 1 }))).toThrow(
      'unsupportedVersion',
    );
  });
});
