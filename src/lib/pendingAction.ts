/**
 * A tiny singleton used to carry an action across the PIN-unlock navigation:
 * a parent taps a protected action while locked, we stash the action, route to
 * the lock modal, and run it once the PIN is verified.
 */

let pending: (() => void) | null = null;

export function setPendingAction(fn: () => void): void {
  pending = fn;
}

export function consumePendingAction(): (() => void) | null {
  const fn = pending;
  pending = null;
  return fn;
}
