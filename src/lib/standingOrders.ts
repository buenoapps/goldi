/**
 * Standing-order engine. On app launch we "catch up": for every active order
 * whose next_run_date is due (<= today), we post one transaction per occurrence
 * and advance next_run_date until it lands in the future. Because next_run_date
 * is persisted after each step, re-running is idempotent — no double-paying.
 */

import {
  createTransaction,
  listStandingOrders,
  setStandingOrderNextRun,
} from '@/db/queries';
import type { StandingOrder } from '@/db/types';
import { advanceByInterval, isOnOrBefore, todayISO } from './dates';

const MAX_CATCHUP_STEPS = 520; // ~10 years of weekly orders — a safety cap.

/** Runs catch-up across all active orders. Returns the number of posts made. */
export async function runStandingOrders(today = todayISO()): Promise<number> {
  const orders = await listStandingOrders();
  let posted = 0;

  for (const order of orders) {
    if (!order.active) continue;
    posted += await catchUpOrder(order, today);
  }

  return posted;
}

async function catchUpOrder(order: StandingOrder, today: string): Promise<number> {
  let runDate = order.next_run_date;
  let steps = 0;
  let posted = 0;

  while (isOnOrBefore(runDate, today) && steps < MAX_CATCHUP_STEPS) {
    await createTransaction({
      accountId: order.account_id,
      amountCents: order.amount_cents,
      comment: order.comment,
      type: 'standing_order',
      date: runDate,
      standingOrderId: order.id,
    });
    posted += 1;
    runDate = advanceByInterval(runDate, order.interval);
    steps += 1;
  }

  if (posted > 0) {
    await setStandingOrderNextRun(order.id, runDate);
  }

  return posted;
}
