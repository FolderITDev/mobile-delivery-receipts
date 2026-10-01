# Architecture and decisions

Delivery Receipts is a local-first Expo app: every delivery lives on the device and SQLite is the source of truth.

## Layers

```text
src/app/        routes (Expo Router)       → render a screen, nothing else
src/features/   screens and components     → read state, call store actions
src/data/store  serialized write queue     → apply a domain transition, write, then publish
src/domain/     pure rules and validation  → no React, Expo or storage imports
src/data/       repositories               → SQLite on device, IndexedDB on web
```

A screen asks the store for a change. The store applies a pure domain transition to the latest committed delivery, writes it through the repository and only then publishes the new state to React. If the write fails, the committed state is untouched and the error appears next to the action that triggered it.

## Storage

- **One aggregate per row.** Each delivery is stored as validated JSON in a single SQLite row with an explicit `revision`. Confirming a handoff updates the whole record in one atomic write. A workload with much larger collections would justify normalized tables and filtering in SQL.
- **Optimistic revisions.** Every write states the revision it started from; a stale revision is rejected instead of overwritten. The in-process queue serializes writes from the app itself.
- **Versioned schema.** `PRAGMA user_version` tracks the schema. Databases written by a newer version are rejected without a destructive reset.
- **Validation on read and write.** Every stored delivery passes through `parseRecord`; corrupt data is reported, never repaired by guessing.
- **Platforms.** Native builds use SQLite in WAL mode. The browser build uses IndexedDB transactions with the same validation and domain rules; it exists for quick UI review and does not stand in for native testing.

## Handoff and receipt

`completeDelivery` turns a pending delivery into a receipt only when it has a recipient and a stored photo, and records `deliveredAt` together with the device's IANA time zone. Times are always formatted in the zone where they were recorded, with the UTC offset computed at minute precision. A second confirmation throws a typed `ConflictError`, so a repeated tap or a stale screen cannot overwrite a receipt.

## Media

Camera and library images are resized to at most 1600 px on the longest side, re-encoded as JPEG (which drops most embedded metadata) and copied into the app documents directory under a generated name before the record references them. In the browser build the image is stored with its record in IndexedDB. A failed save keeps the selected photo for retry. On startup, unreferenced files older than 24 hours are removed, so a save still in flight never loses its photo; deleting a delivery removes its file. A missing file never hides the text of the receipt.

## Interface

Navigation uses native Expo Router stacks with large titles, modals for creation and review, and platform back gestures. Interactive elements are built from React Native primitives with explicit accessibility roles, names and states. Colors, fonts, spacing and motion come from `src/theme/tokens.ts` and follow the system appearance. Long lists are virtualized. See [DESIGN.md](../DESIGN.md).

## Verification

Automated tests run on Node's test runner against a real SQLite database (`node:sqlite`): domain invariants, migrations, durable restart, stale updates, corrupted payloads and formatting. Camera capture, permission denial, airplane mode and restart are verified manually on physical iOS and Android devices.
