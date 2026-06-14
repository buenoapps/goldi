import { runStandingOrders } from '../standingOrders';
import {
  createTransaction,
  listStandingOrders,
  setStandingOrderNextRun,
} from '@/db/queries';
import type { StandingOrder } from '@/db/types';

jest.mock('@/db/queries');

const mockedList = listStandingOrders as jest.MockedFunction<typeof listStandingOrders>;
const mockedCreate = createTransaction as jest.MockedFunction<typeof createTransaction>;
const mockedSetNext = setStandingOrderNextRun as jest.MockedFunction<typeof setStandingOrderNextRun>;

function makeOrder(overrides: Partial<StandingOrder> = {}): StandingOrder {
  return {
    id: 'so1',
    account_id: 'acc1',
    amount_cents: 100,
    interval: 'weekly',
    start_date: '2026-05-17',
    next_run_date: '2026-05-17',
    comment: 'Pocket money',
    active: 1,
    created_at: '2026-05-17T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedCreate.mockResolvedValue({} as never);
  mockedSetNext.mockResolvedValue(undefined as never);
});

describe('runStandingOrders', () => {
  it('posts one transaction per due weekly occurrence and advances next_run_date', async () => {
    mockedList.mockResolvedValue([makeOrder()]);

    const posted = await runStandingOrders('2026-06-14');

    expect(posted).toBe(5);
    expect(mockedCreate).toHaveBeenCalledTimes(5);

    const dates = mockedCreate.mock.calls.map((c) => c[0].date);
    expect(dates).toEqual([
      '2026-05-17',
      '2026-05-24',
      '2026-05-31',
      '2026-06-07',
      '2026-06-14',
    ]);

    // Every post carries the order's metadata and type.
    for (const call of mockedCreate.mock.calls) {
      expect(call[0]).toMatchObject({
        accountId: 'acc1',
        amountCents: 100,
        type: 'standing_order',
        standingOrderId: 'so1',
        comment: 'Pocket money',
      });
    }

    expect(mockedSetNext).toHaveBeenCalledWith('so1', '2026-06-21');
  });

  it('is idempotent when next_run_date is in the future', async () => {
    mockedList.mockResolvedValue([makeOrder({ next_run_date: '2026-06-21' })]);

    const posted = await runStandingOrders('2026-06-14');

    expect(posted).toBe(0);
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockedSetNext).not.toHaveBeenCalled();
  });

  it('posts a single occurrence when exactly due today', async () => {
    mockedList.mockResolvedValue([makeOrder({ next_run_date: '2026-06-14' })]);

    const posted = await runStandingOrders('2026-06-14');

    expect(posted).toBe(1);
    expect(mockedSetNext).toHaveBeenCalledWith('so1', '2026-06-21');
  });

  it('skips inactive orders', async () => {
    mockedList.mockResolvedValue([makeOrder({ active: 0 })]);

    const posted = await runStandingOrders('2026-06-14');

    expect(posted).toBe(0);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('handles monthly intervals', async () => {
    mockedList.mockResolvedValue([
      makeOrder({ interval: 'monthly', next_run_date: '2026-04-14' }),
    ]);

    const posted = await runStandingOrders('2026-06-14');

    expect(posted).toBe(3); // Apr 14, May 14, Jun 14
    expect(mockedSetNext).toHaveBeenCalledWith('so1', '2026-07-14');
  });

  it('processes multiple orders independently', async () => {
    mockedList.mockResolvedValue([
      makeOrder({ id: 'a', next_run_date: '2026-06-07' }), // weekly -> 2 (07, 14)
      makeOrder({ id: 'b', next_run_date: '2026-06-14' }), // weekly -> 1
    ]);

    const posted = await runStandingOrders('2026-06-14');

    expect(posted).toBe(3);
    expect(mockedSetNext).toHaveBeenCalledWith('a', '2026-06-21');
    expect(mockedSetNext).toHaveBeenCalledWith('b', '2026-06-21');
  });
});
