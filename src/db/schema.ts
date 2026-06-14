/** SQLite schema + lightweight migration runner (keyed off PRAGMA user_version). */

import type { SQLiteDatabase } from 'expo-sqlite';

export const SCHEMA_VERSION = 1;

const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  // v1 — initial schema
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS children (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        emoji TEXT NOT NULL DEFAULT '🐹',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS standing_orders (
        id TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        amount_cents INTEGER NOT NULL,
        interval TEXT NOT NULL,
        start_date TEXT NOT NULL,
        next_run_date TEXT NOT NULL,
        comment TEXT NOT NULL DEFAULT '',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        comment TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL,
        standing_order_id TEXT REFERENCES standing_orders(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_child ON accounts(child_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_standing_orders_account ON standing_orders(account_id);
    `);
  },
];

/** Applies any migrations newer than the database's current user_version. */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = result?.user_version ?? 0;

  for (let v = current; v < MIGRATIONS.length; v++) {
    await MIGRATIONS[v](db);
  }

  if (current < MIGRATIONS.length) {
    // PRAGMA can't be parameterized; value is an internal constant.
    await db.execAsync(`PRAGMA user_version = ${MIGRATIONS.length}`);
  }
}
