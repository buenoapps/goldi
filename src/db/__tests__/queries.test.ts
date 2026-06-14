jest.mock('@/lib/uuid', () => ({ uuid: jest.fn(() => 'fixed-id') }));

jest.mock('../database', () => {
  const txn = {
    runAsync: jest.fn(async () => ({})),
    execAsync: jest.fn(async () => undefined),
  };
  const db = {
    runAsync: jest.fn(async () => ({ changes: 1 })),
    getAllAsync: jest.fn(async () => []),
    getFirstAsync: jest.fn(async () => null),
    execAsync: jest.fn(async () => undefined),
    withExclusiveTransactionAsync: jest.fn(async (cb: (t: unknown) => Promise<void>) => cb(txn)),
    __txn: txn,
  };
  return { getDatabase: jest.fn(async () => db) };
});

import { getDatabase } from '../database';
import {
  buildSnapshot,
  createAccount,
  createChild,
  createStandingOrder,
  createTransaction,
  getChildTotalBalance,
  getSetting,
  replaceAllData,
  setSetting,
} from '../queries';
import { todayISO } from '@/lib/dates';
import type { DataSnapshot } from '../types';

let db: Awaited<ReturnType<typeof getDatabase>> & {
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  __txn: { runAsync: jest.Mock; execAsync: jest.Mock };
};

beforeEach(async () => {
  db = (await getDatabase()) as never;
  jest.clearAllMocks();
});

describe('createChild', () => {
  it('inserts with a generated id and returns the row', async () => {
    const child = await createChild({ name: 'Mia', color: '#fff', emoji: '🐹' });

    expect(child).toMatchObject({ id: 'fixed-id', name: 'Mia', color: '#fff', emoji: '🐹' });
    expect(child.created_at).toEqual(expect.any(String));

    const [sql, params] = db.runAsync.mock.calls[0];
    expect(sql).toContain('INSERT INTO children');
    expect(params).toEqual(['fixed-id', 'Mia', '#fff', '🐹', child.created_at]);
  });
});

describe('createAccount', () => {
  it('links the account to its child', async () => {
    const account = await createAccount({ childId: 'c1', name: 'Savings', color: '#000' });
    expect(account).toMatchObject({ id: 'fixed-id', child_id: 'c1', name: 'Savings' });
    expect(db.runAsync.mock.calls[0][0]).toContain('INSERT INTO accounts');
  });
});

describe('createTransaction', () => {
  it('stores a signed amount and explicit date', async () => {
    const tx = await createTransaction({
      accountId: 'a1',
      amountCents: -250,
      comment: 'Toy',
      type: 'withdrawal',
      date: '2026-06-01',
    });
    expect(tx).toMatchObject({
      account_id: 'a1',
      amount_cents: -250,
      type: 'withdrawal',
      date: '2026-06-01',
      standing_order_id: null,
    });
  });

  it("defaults the date to today and standing_order_id to null", async () => {
    const tx = await createTransaction({
      accountId: 'a1',
      amountCents: 500,
      comment: 'Gift',
      type: 'deposit',
    });
    expect(tx.date).toBe(todayISO());
    expect(tx.standing_order_id).toBeNull();
  });
});

describe('createStandingOrder', () => {
  it('seeds next_run_date from the start date and is active', async () => {
    const order = await createStandingOrder({
      accountId: 'a1',
      amountCents: 100,
      interval: 'weekly',
      startDate: '2026-06-14',
      comment: 'Pocket money',
    });
    expect(order).toMatchObject({
      next_run_date: '2026-06-14',
      start_date: '2026-06-14',
      active: 1,
      interval: 'weekly',
    });
  });
});

describe('getChildTotalBalance', () => {
  it('returns the summed total', async () => {
    db.getFirstAsync.mockResolvedValueOnce({ total: 1234 });
    expect(await getChildTotalBalance('c1')).toBe(1234);
  });

  it('returns 0 when there are no rows', async () => {
    db.getFirstAsync.mockResolvedValueOnce(null);
    expect(await getChildTotalBalance('c1')).toBe(0);
  });
});

describe('settings', () => {
  it('reads a stored value', async () => {
    db.getFirstAsync.mockResolvedValueOnce({ value: 'de' });
    expect(await getSetting('language')).toBe('de');
  });

  it('returns null for a missing key', async () => {
    db.getFirstAsync.mockResolvedValueOnce(null);
    expect(await getSetting('missing')).toBeNull();
  });

  it('upserts on write', async () => {
    await setSetting('currency', 'USD');
    const [sql, params] = db.runAsync.mock.calls[0];
    expect(sql).toContain('ON CONFLICT(key) DO UPDATE');
    expect(params).toEqual(['currency', 'USD']);
  });
});

describe('snapshot import', () => {
  it('builds a snapshot with the given version', async () => {
    db.getAllAsync.mockResolvedValue([]);
    const snap = await buildSnapshot(1);
    expect(snap.version).toBe(1);
    expect(snap.exported_at).toEqual(expect.any(String));
  });

  it('replaceAllData wipes then re-inserts inside a transaction', async () => {
    const snapshot: DataSnapshot = {
      version: 1,
      exported_at: '',
      children: [{ id: 'c1', name: 'Mia', color: '#fff', emoji: '🐹', created_at: '' }],
      accounts: [{ id: 'a1', child_id: 'c1', name: 'Savings', color: '#fff', created_at: '' }],
      transactions: [
        {
          id: 't1', account_id: 'a1', date: '2026-06-01', amount_cents: 100,
          comment: '', type: 'deposit', standing_order_id: null, created_at: '',
        },
      ],
      standing_orders: [],
      settings: [{ key: 'currency', value: 'EUR' }],
    };

    await replaceAllData(snapshot);

    expect(db.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
    // Wipe runs as a single exec; inserts run as parameterized statements.
    expect(db.__txn.execAsync).toHaveBeenCalled();
    const insertSql = db.__txn.runAsync.mock.calls.map((c) => c[0] as string);
    expect(insertSql.some((s) => s.includes('INSERT INTO children'))).toBe(true);
    expect(insertSql.some((s) => s.includes('INSERT INTO accounts'))).toBe(true);
    expect(insertSql.some((s) => s.includes('INSERT INTO transactions'))).toBe(true);
    expect(insertSql.some((s) => s.includes('INSERT INTO settings'))).toBe(true);
  });
});
