/**
 * Export / import of all Goldi data.
 *  - JSON: a lossless full snapshot (the recommended backup format).
 *  - CSV:  a flat, spreadsheet-friendly transaction list (human-readable).
 * Import accepts the JSON snapshot and replaces all local data.
 */

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { SCHEMA_VERSION } from '@/db/schema';
import { buildSnapshot, replaceAllData } from '@/db/queries';
import type { DataSnapshot } from '@/db/types';
import { todayISO } from './dates';

function writeTempFile(name: string, contents: string): File {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);
  return file;
}

async function share(file: File, mimeType: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, UTI: mimeType });
  }
}

/* --------------------------------- Export -------------------------------- */

export async function exportJson(): Promise<void> {
  const snapshot = await buildSnapshot(SCHEMA_VERSION);
  const file = writeTempFile(`goldi-backup-${todayISO()}.json`, JSON.stringify(snapshot, null, 2));
  await share(file, 'application/json');
}

export async function exportCsv(): Promise<void> {
  const snapshot = await buildSnapshot(SCHEMA_VERSION);
  const file = writeTempFile(`goldi-transactions-${todayISO()}.csv`, snapshotToCsv(snapshot));
  await share(file, 'text/csv');
}

function csvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Flattens transactions into a CSV with child & account names resolved. */
export function snapshotToCsv(snapshot: DataSnapshot): string {
  const childById = new Map(snapshot.children.map((c) => [c.id, c]));
  const accountById = new Map(snapshot.accounts.map((a) => [a.id, a]));

  const header = ['date', 'child', 'account', 'type', 'amount', 'comment'];
  const rows = snapshot.transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((t) => {
      const account = accountById.get(t.account_id);
      const child = account ? childById.get(account.child_id) : undefined;
      return [
        t.date,
        child?.name ?? '',
        account?.name ?? '',
        t.type,
        (t.amount_cents / 100).toFixed(2),
        t.comment,
      ]
        .map(csvField)
        .join(',');
    });

  return [header.join(','), ...rows].join('\n');
}

/* --------------------------------- Import -------------------------------- */

export class ImportError extends Error {}

/** Validates a parsed object as a DataSnapshot. Throws ImportError on failure. */
export function parseSnapshot(raw: unknown): DataSnapshot {
  if (!raw || typeof raw !== 'object') {
    throw new ImportError('invalidFormat');
  }
  const obj = raw as Record<string, unknown>;
  const requiredArrays = ['children', 'accounts', 'transactions', 'standing_orders'];
  for (const key of requiredArrays) {
    if (!Array.isArray(obj[key])) {
      throw new ImportError('invalidFormat');
    }
  }
  if (typeof obj.version !== 'number') {
    throw new ImportError('invalidFormat');
  }
  if (obj.version > SCHEMA_VERSION) {
    throw new ImportError('unsupportedVersion');
  }
  return {
    version: obj.version,
    exported_at: typeof obj.exported_at === 'string' ? obj.exported_at : new Date().toISOString(),
    children: obj.children as DataSnapshot['children'],
    accounts: obj.accounts as DataSnapshot['accounts'],
    transactions: obj.transactions as DataSnapshot['transactions'],
    standing_orders: obj.standing_orders as DataSnapshot['standing_orders'],
    settings: Array.isArray(obj.settings) ? (obj.settings as DataSnapshot['settings']) : [],
  };
}

/**
 * Prompts the user to pick a JSON backup and replaces all data with it.
 * Returns false if the user cancels the picker, true on a successful import.
 */
export async function importJsonFromPicker(): Promise<boolean> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    return false;
  }

  const uri = result.assets[0].uri;
  let text: string;
  try {
    text = await new File(uri).text();
  } catch {
    throw new ImportError('readFailed');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError('invalidFormat');
  }

  const snapshot = parseSnapshot(parsed);
  await replaceAllData(snapshot);
  return true;
}
