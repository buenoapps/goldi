import { runMigrations, SCHEMA_VERSION } from '../schema';

type FakeDb = {
  execAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

function makeFakeDb(userVersion: number | null): FakeDb {
  return {
    execAsync: jest.fn(async () => undefined),
    getFirstAsync: jest.fn(async () =>
      userVersion === null ? null : { user_version: userVersion },
    ),
  };
}

describe('runMigrations', () => {
  it('exposes schema version 1', () => {
    expect(SCHEMA_VERSION).toBe(1);
  });

  it('creates the schema on a fresh database', async () => {
    const db = makeFakeDb(0);
    await runMigrations(db as never);

    const sqlRun = db.execAsync.mock.calls.map((c) => c[0] as string);
    expect(sqlRun.some((s) => s.includes('CREATE TABLE IF NOT EXISTS children'))).toBe(true);
    expect(sqlRun.some((s) => s.includes('CREATE TABLE IF NOT EXISTS transactions'))).toBe(true);
    // Bumps user_version to the latest after migrating.
    expect(sqlRun).toContain('PRAGMA user_version = 1');
  });

  it('treats a null user_version as a fresh database', async () => {
    const db = makeFakeDb(null);
    await runMigrations(db as never);
    expect(db.execAsync.mock.calls.length).toBeGreaterThan(0);
  });

  it('does nothing when already at the latest version', async () => {
    const db = makeFakeDb(1);
    await runMigrations(db as never);
    expect(db.execAsync).not.toHaveBeenCalled();
  });
});
