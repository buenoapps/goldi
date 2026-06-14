# 🐹 Goldi — a playful bank for little savers

Goldi is a mobile app where parents manage **play bank accounts** for their
children. Add or remove money anytime, set up recurring **pocket money /
Taschengeld** (e.g. €1 every week), and keep a real bank-style history of every
change. Built with Expo + React Native, everything is stored **locally on the
device** — no accounts, no sync — with full **CSV & JSON export/import** for
backups.

## Features

- **Multiple children & multiple accounts** per child (e.g. _Savings_,
  _Pocket money_).
- **Full transaction history** — every entry has a date, comment and amount.
- **Standing orders** for recurring pocket money (weekly / bi-weekly / monthly).
  Due payments are caught up automatically each time the app opens.
- **Parent PIN lock** — viewing balances and history is always open; adding or
  removing money, editing, settings and import/export require the parent PIN.
- **Internationalised** — English (default) and German, switchable in settings.
- **Locale-aware currency** (EUR by default; USD / GBP / CHF selectable).
- **Backup & restore** — export all data as a lossless JSON snapshot or a
  spreadsheet-friendly CSV; import a JSON backup to restore.
- **Playful banking design** — warm "gold hamster" accents, rounded cards,
  light & dark mode.

## Tech stack

| Concern        | Choice                                                   |
| -------------- | -------------------------------------------------------- |
| Framework      | Expo SDK 56, React Native, TypeScript                    |
| Navigation     | Expo Router (file-based, tabs + modal stack)             |
| Storage        | `expo-sqlite` (relational, migrated on open)             |
| i18n           | `i18next` + `react-i18next` + `expo-localization`        |
| Security       | `expo-secure-store` + `expo-crypto` (salted SHA-256 PIN) |
| Import/Export  | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| Dates          | `date-fns`                                               |

Money is always stored and handled as **integer cents** to avoid floating-point
drift.

## Project layout

```
src/
  app/                 Expo Router routes
    (tabs)/            Kids overview · Standing orders · Settings
    child/[id].tsx     Child detail (accounts)
    account/[id].tsx   Account detail (balance + history)
    *-form.tsx         Create/edit modals (child, account, transaction, standing order)
    lock.tsx           Parent PIN unlock modal
  components/          Reusable UI (Card, Button, PinPad, TransactionRow, …)
  constants/theme.ts   Colors, spacing, brand palette
  context/             Settings (language/currency) + Auth (PIN) providers
  db/                  SQLite schema, migrations, typed queries
  hooks/               Theming, money formatting, focus-aware data loading
  i18n/                i18next config + en/de locale files
  lib/                 money, dates, standing-order engine, export/import, pin
```

## Getting started

```bash
npm install
npx expo start
```

Then open the project in **Expo Go** or a development build (iOS / Android), or
press `w` for web. On first launch you'll be asked to create a parent PIN.

### Type-check

```bash
npx tsc --noEmit
```

### Tests

Unit tests run on [`jest-expo`](https://docs.expo.dev/develop/unit-testing/):

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with a coverage report
```

The suite covers the pure logic and data layer — money formatting & parsing,
date math, the standing-order catch-up engine, CSV export & snapshot
validation, the salted-PIN store, secure-storage web fallback, i18n (including
English⇄German key parity), SQLite migrations and queries (mocked DB) — plus
context-free UI components (`Button`, `PinPad`, `EmptyState`, `ChildAvatar`).

## How standing orders work

Each standing order stores a `next_run_date`. On every app launch the engine
(`src/lib/standingOrders.ts`) posts one transaction per due occurrence and
advances `next_run_date` until it's in the future. Because the date is persisted
after each step, reopening the app never double-pays.

## Data & privacy

All data lives in the on-device SQLite database. There is no network sync. Use
**Settings → Data** to export a backup (JSON for a full restore, CSV for
spreadsheets) or to import a JSON backup, which replaces all current data.
