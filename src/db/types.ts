/** Domain types. Money is always stored & passed around as integer cents. */

export type IntervalUnit = 'weekly' | 'biweekly' | 'monthly';

export type TransactionType = 'deposit' | 'withdrawal' | 'standing_order';

export interface Child {
  id: string;
  name: string;
  color: string;
  emoji: string;
  created_at: string;
}

export interface Account {
  id: string;
  child_id: string;
  name: string;
  color: string;
  created_at: string;
}

/** An account row enriched with its computed balance (in cents). */
export interface AccountWithBalance extends Account {
  balance_cents: number;
}

export interface Transaction {
  id: string;
  account_id: string;
  date: string; // ISO date (YYYY-MM-DD) the entry applies to
  amount_cents: number; // signed: positive = deposit, negative = withdrawal
  comment: string;
  type: TransactionType;
  standing_order_id: string | null;
  created_at: string;
}

export interface StandingOrder {
  id: string;
  account_id: string;
  amount_cents: number; // signed
  interval: IntervalUnit;
  start_date: string; // ISO date the schedule begins
  next_run_date: string; // ISO date of the next pending occurrence
  comment: string;
  active: number; // SQLite boolean (0/1)
  created_at: string;
}

/** Full snapshot used for export / import. */
export interface DataSnapshot {
  version: number;
  exported_at: string;
  children: Child[];
  accounts: Account[];
  transactions: Transaction[];
  standing_orders: StandingOrder[];
  settings: { key: string; value: string }[];
}
