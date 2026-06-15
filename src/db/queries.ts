/** Typed data-access functions for all Goldi entities. */

import { getDatabase } from './database';
import type {
  Account,
  AccountWithBalance,
  Child,
  DataSnapshot,
  IntervalUnit,
  StandingOrder,
  Transaction,
  TransactionType,
} from './types';
import { uuid } from '@/lib/uuid';
import { todayISO } from '@/lib/dates';

/* ------------------------------- Children -------------------------------- */

export interface ChildSummary extends Child {
  total_cents: number;
  account_count: number;
}

export async function listChildren(): Promise<Child[]> {
  const db = await getDatabase();
  return db.getAllAsync<Child>('SELECT * FROM children ORDER BY created_at ASC');
}

/** Children with their total balance and account count, for the overview. */
export async function listChildrenWithSummary(): Promise<ChildSummary[]> {
  const db = await getDatabase();
  return db.getAllAsync<ChildSummary>(`
    SELECT c.*,
      (SELECT COUNT(*) FROM accounts a WHERE a.child_id = c.id) AS account_count,
      COALESCE((
        SELECT SUM(t.amount_cents)
          FROM accounts a
          JOIN transactions t ON t.account_id = a.id
         WHERE a.child_id = c.id
      ), 0) AS total_cents
    FROM children c
    ORDER BY c.created_at ASC
  `);
}

export async function getChild(id: string): Promise<Child | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Child>('SELECT * FROM children WHERE id = ?', [id]);
}

export async function createChild(input: {
  name: string;
  color: string;
  emoji: string;
}): Promise<Child> {
  const db = await getDatabase();
  const child: Child = {
    id: uuid(),
    name: input.name,
    color: input.color,
    emoji: input.emoji,
    created_at: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO children (id, name, color, emoji, created_at) VALUES (?, ?, ?, ?, ?)',
    [child.id, child.name, child.color, child.emoji, child.created_at],
  );
  return child;
}

export async function updateChild(
  id: string,
  input: { name: string; color: string; emoji: string },
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE children SET name = ?, color = ?, emoji = ? WHERE id = ?', [
    input.name,
    input.color,
    input.emoji,
    id,
  ]);
}

export async function deleteChild(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM children WHERE id = ?', [id]);
}

/** Total balance across all of a child's accounts, in cents. */
export async function getChildTotalBalance(childId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT COALESCE(SUM(t.amount_cents), 0) AS total
       FROM accounts a
       LEFT JOIN transactions t ON t.account_id = a.id
      WHERE a.child_id = ?`,
    [childId],
  );
  return row?.total ?? 0;
}

/* -------------------------------- Accounts ------------------------------- */

export async function listAccountsWithBalance(childId: string): Promise<AccountWithBalance[]> {
  const db = await getDatabase();
  return db.getAllAsync<AccountWithBalance>(
    `SELECT a.*, COALESCE(SUM(t.amount_cents), 0) AS balance_cents
       FROM accounts a
       LEFT JOIN transactions t ON t.account_id = a.id
      WHERE a.child_id = ?
      GROUP BY a.id
      ORDER BY a.created_at ASC`,
    [childId],
  );
}

/** Every account across all children with its balance, for the overview. */
export async function listAllAccountsWithBalance(): Promise<AccountWithBalance[]> {
  const db = await getDatabase();
  return db.getAllAsync<AccountWithBalance>(
    `SELECT a.*, COALESCE(SUM(t.amount_cents), 0) AS balance_cents
       FROM accounts a
       LEFT JOIN transactions t ON t.account_id = a.id
      GROUP BY a.id
      ORDER BY a.created_at ASC`,
  );
}

export async function getAccount(id: string): Promise<Account | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', [id]);
}

export async function getAccountBalance(accountId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(amount_cents), 0) AS total FROM transactions WHERE account_id = ?',
    [accountId],
  );
  return row?.total ?? 0;
}

export async function createAccount(input: {
  childId: string;
  name: string;
  color: string;
}): Promise<Account> {
  const db = await getDatabase();
  const account: Account = {
    id: uuid(),
    child_id: input.childId,
    name: input.name,
    color: input.color,
    created_at: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO accounts (id, child_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)',
    [account.id, account.child_id, account.name, account.color, account.created_at],
  );
  return account;
}

export async function updateAccount(
  id: string,
  input: { name: string; color: string },
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE accounts SET name = ?, color = ? WHERE id = ?', [
    input.name,
    input.color,
    id,
  ]);
}

export async function deleteAccount(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
}

/* ------------------------------ Transactions ----------------------------- */

export async function listTransactions(accountId: string): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC, created_at DESC',
    [accountId],
  );
}

export async function createTransaction(input: {
  accountId: string;
  amountCents: number; // signed
  comment: string;
  type: TransactionType;
  date?: string;
  standingOrderId?: string | null;
}): Promise<Transaction> {
  const db = await getDatabase();
  const tx: Transaction = {
    id: uuid(),
    account_id: input.accountId,
    date: input.date ?? todayISO(),
    amount_cents: input.amountCents,
    comment: input.comment,
    type: input.type,
    standing_order_id: input.standingOrderId ?? null,
    created_at: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO transactions
       (id, account_id, date, amount_cents, comment, type, standing_order_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tx.id,
      tx.account_id,
      tx.date,
      tx.amount_cents,
      tx.comment,
      tx.type,
      tx.standing_order_id,
      tx.created_at,
    ],
  );
  return tx;
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

/* ----------------------------- Standing orders --------------------------- */

export interface StandingOrderDetailed extends StandingOrder {
  account_name: string;
  child_name: string;
  child_color: string;
}

export async function listStandingOrders(): Promise<StandingOrder[]> {
  const db = await getDatabase();
  return db.getAllAsync<StandingOrder>('SELECT * FROM standing_orders ORDER BY created_at DESC');
}

/** Standing orders joined with their account & child, for the list screen. */
export async function listStandingOrdersDetailed(): Promise<StandingOrderDetailed[]> {
  const db = await getDatabase();
  return db.getAllAsync<StandingOrderDetailed>(`
    SELECT so.*,
           a.name AS account_name,
           c.name AS child_name,
           c.color AS child_color
      FROM standing_orders so
      JOIN accounts a ON a.id = so.account_id
      JOIN children c ON c.id = a.child_id
     ORDER BY so.active DESC, so.created_at DESC
  `);
}

/** Standing orders that pay into any of a child's accounts. */
export async function listStandingOrdersForChild(
  childId: string,
): Promise<StandingOrderDetailed[]> {
  const db = await getDatabase();
  return db.getAllAsync<StandingOrderDetailed>(
    `SELECT so.*,
            a.name AS account_name,
            c.name AS child_name,
            c.color AS child_color
       FROM standing_orders so
       JOIN accounts a ON a.id = so.account_id
       JOIN children c ON c.id = a.child_id
      WHERE c.id = ?
      ORDER BY so.active DESC, so.created_at DESC`,
    [childId],
  );
}

/** Standing orders for a single account. */
export async function listStandingOrdersForAccount(
  accountId: string,
): Promise<StandingOrder[]> {
  const db = await getDatabase();
  return db.getAllAsync<StandingOrder>(
    `SELECT * FROM standing_orders
      WHERE account_id = ?
      ORDER BY active DESC, created_at DESC`,
    [accountId],
  );
}

/** Accounts across all children, with child name, for pickers. */
export async function listAllAccountsForPicker(): Promise<
  { id: string; label: string }[]
> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; account_name: string; child_name: string }>(`
    SELECT a.id AS id, a.name AS account_name, c.name AS child_name
      FROM accounts a
      JOIN children c ON c.id = a.child_id
     ORDER BY c.created_at ASC, a.created_at ASC
  `);
  return rows.map((r) => ({ id: r.id, label: `${r.child_name} · ${r.account_name}` }));
}

export async function getStandingOrder(id: string): Promise<StandingOrder | null> {
  const db = await getDatabase();
  return db.getFirstAsync<StandingOrder>('SELECT * FROM standing_orders WHERE id = ?', [id]);
}

export async function createStandingOrder(input: {
  accountId: string;
  amountCents: number; // signed
  interval: IntervalUnit;
  startDate: string;
  comment: string;
}): Promise<StandingOrder> {
  const db = await getDatabase();
  const order: StandingOrder = {
    id: uuid(),
    account_id: input.accountId,
    amount_cents: input.amountCents,
    interval: input.interval,
    start_date: input.startDate,
    next_run_date: input.startDate,
    comment: input.comment,
    active: 1,
    created_at: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO standing_orders
       (id, account_id, amount_cents, interval, start_date, next_run_date, comment, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.id,
      order.account_id,
      order.amount_cents,
      order.interval,
      order.start_date,
      order.next_run_date,
      order.comment,
      order.active,
      order.created_at,
    ],
  );
  return order;
}

export async function updateStandingOrder(
  id: string,
  input: { amountCents: number; interval: IntervalUnit; comment: string },
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE standing_orders SET amount_cents = ?, interval = ?, comment = ? WHERE id = ?',
    [input.amountCents, input.interval, input.comment, id],
  );
}

export async function setStandingOrderActive(id: string, active: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE standing_orders SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
}

export async function setStandingOrderNextRun(id: string, nextRunDate: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE standing_orders SET next_run_date = ? WHERE id = ?', [nextRunDate, id]);
}

export async function deleteStandingOrder(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM standing_orders WHERE id = ?', [id]);
}

/* -------------------------------- Settings ------------------------------- */

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}

/* ----------------------------- Snapshot (I/O) ---------------------------- */

export async function buildSnapshot(version: number): Promise<DataSnapshot> {
  const db = await getDatabase();
  const [children, accounts, transactions, standing_orders, settings] = await Promise.all([
    db.getAllAsync<Child>('SELECT * FROM children'),
    db.getAllAsync<Account>('SELECT * FROM accounts'),
    db.getAllAsync<Transaction>('SELECT * FROM transactions'),
    db.getAllAsync<StandingOrder>('SELECT * FROM standing_orders'),
    db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings'),
  ]);
  return {
    version,
    exported_at: new Date().toISOString(),
    children,
    accounts,
    transactions,
    standing_orders,
    settings,
  };
}

/** Wipes all data and replaces it with the given snapshot (transactional). */
export async function replaceAllData(snapshot: DataSnapshot): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync(`
      DELETE FROM transactions;
      DELETE FROM standing_orders;
      DELETE FROM accounts;
      DELETE FROM children;
      DELETE FROM settings;
    `);

    for (const c of snapshot.children) {
      await txn.runAsync(
        'INSERT INTO children (id, name, color, emoji, created_at) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.color, c.emoji ?? '🐹', c.created_at],
      );
    }
    for (const a of snapshot.accounts) {
      await txn.runAsync(
        'INSERT INTO accounts (id, child_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)',
        [a.id, a.child_id, a.name, a.color, a.created_at],
      );
    }
    for (const o of snapshot.standing_orders) {
      await txn.runAsync(
        `INSERT INTO standing_orders
           (id, account_id, amount_cents, interval, start_date, next_run_date, comment, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          o.id,
          o.account_id,
          o.amount_cents,
          o.interval,
          o.start_date,
          o.next_run_date,
          o.comment ?? '',
          o.active ?? 1,
          o.created_at,
        ],
      );
    }
    for (const t of snapshot.transactions) {
      await txn.runAsync(
        `INSERT INTO transactions
           (id, account_id, date, amount_cents, comment, type, standing_order_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.account_id,
          t.date,
          t.amount_cents,
          t.comment ?? '',
          t.type,
          t.standing_order_id ?? null,
          t.created_at,
        ],
      );
    }
    for (const s of snapshot.settings) {
      await txn.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
    }
  });
}
