import { consumePendingAction, setPendingAction } from '../pendingAction';

describe('pendingAction', () => {
  afterEach(() => {
    // Drain anything a test left behind.
    consumePendingAction();
  });

  it('returns null when nothing is pending', () => {
    expect(consumePendingAction()).toBeNull();
  });

  it('stores and returns the pending action once', () => {
    const fn = jest.fn();
    setPendingAction(fn);

    const consumed = consumePendingAction();
    expect(consumed).toBe(fn);

    consumed?.();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('clears the action after consuming (single-use)', () => {
    setPendingAction(jest.fn());
    consumePendingAction();
    expect(consumePendingAction()).toBeNull();
  });

  it('overwrites a previous unconsumed action', () => {
    const first = jest.fn();
    const second = jest.fn();
    setPendingAction(first);
    setPendingAction(second);
    expect(consumePendingAction()).toBe(second);
  });
});
