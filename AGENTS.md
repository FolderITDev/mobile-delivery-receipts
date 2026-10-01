# Delivery Receipts

Instructions for anyone, human or AI coding agent, changing this repository. Read this file, [DESIGN.md](DESIGN.md) and [docs/architecture.md](docs/architecture.md) before editing.

Delivery Receipts is an offline delivery record for iOS and Android. A courier creates a pending delivery, records who received it with a photo, reviews the handoff and keeps a read-only receipt with the device time and time zone.

Everything runs on the device. There is no backend, account system, analytics or AI inference; SQLite is the source of truth.

**Stack:** Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript 6 (strict) · Expo Router with typed routes · `expo-sqlite` · Reanimated 4 · Node.js 24 (`.node-version`).

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependencies. |
| `npm run ios` / `npm run android` | Build and run a native development build. |
| `npm start` | Start the dev server for an installed development build. |
| `npm run web` | Browser build backed by IndexedDB, for quick UI review only. |
| `npm run check` | ESLint, `tsc --noEmit` and the test suite. |
| `npm run format` / `npm run format:check` | Prettier. |
| `npx expo-doctor` | Expo dependency and configuration checks. |

## Project structure

| Location | Responsibility |
| --- | --- |
| `src/app/` | Routes only: `index` (deliveries), `new`, `delivery/[id]`, `confirm/[id]`, `about`. |
| `src/features/deliveries/` | Screens and feature components. |
| `src/domain/` | Pure rules and runtime validation: `createDelivery`, `completeDelivery`, `parseRecord`, `pendingQueue`, `deliveredLog`. |
| `src/data/` | Store and write queue, SQLite repository and migrations, IndexedDB adapter for the web build. |
| Media | `src/data/capture-photo.ts` (picker, camera permission, resize and re-encode) and `src/data/photos.ts` (durable files, cleanup); `.web.ts` variants for the browser build. |
| `src/ui/`, `src/theme/` | Shared components and design tokens, documented in DESIGN.md. |
| `src/hooks/`, `src/lib/` | `useAction`, `useUnsavedGuard`, formatting, dialogs and haptics. |
| `tests/` | Node test runner with a real SQLite database (`node:sqlite`). |

Platform-specific code uses the `.web.ts` suffix; there are no runtime platform checks for storage.

---

## Critical rules (always apply)

### R1. Success follows the durable write
Screens change data only through the store (`add`, `change`, `remove` from `useStore()` in `src/data/store.tsx`). The store serializes writes and resolves only after the repository write succeeds. Never show a saved, completed or confirmed state before that promise resolves, and never call a repository directly from a screen.

### R2. The domain is pure and validates everything
Business rules live in `src/domain/model.ts` as pure functions that take a record and return a new one. They import nothing from React, Expo or the data layer. Every write goes through a domain transition, and every read goes through `parseRecord`; invalid data throws a readable error instead of being repaired by guessing.

### R3. Schema changes are migrations
SQLite stores one validated JSON aggregate per row with an explicit `revision`. The schema version is `PRAGMA user_version` in `src/data/sqlite-repository.ts`. To change the stored shape: bump the version, add a migration step inside a transaction, keep rejecting databases from a newer version without resetting them, bump the IndexedDB version in `src/data/persistence.web.ts`, and add a case to `tests/persistence.test.ts`.

### R4. Concurrency is explicit
Writes carry the revision they started from; a stale revision is rejected, not overwritten. Async user actions run through `useAction()` (`src/hooks/use-action.ts`), whose ref lock blocks a second tap before React re-renders. Do not replace ref locks with state.

### R5. Routes stay thin
Files in `src/app/` only register routes and screen options and render a screen from `src/features/`. Logic, data access and styling never live in route files.

### R6. Use the design system
Follow [DESIGN.md](DESIGN.md). Use `src/theme` tokens through `createStyles` and `useTheme`, and the components in `src/ui`. No raw colors, font names or spacing values in screens. Touch targets are at least 48 pt, every status has words as well as color, and Reduce Motion is respected.

### R7. No network, no tracking
The app makes no network requests at runtime: no analytics, crash reporting, remote fonts, model APIs or sync. Never log names, photos, file paths, barcodes or other user data.

### R8. Untrusted input is validated at the boundary
Validate form input, scanned or typed codes, persisted JSON and selected media before they reach a transition. SQL uses parameters only; never build queries with string interpolation.

### R9. Dependencies follow the SDK
The app targets Expo SDK 57. Check the versioned Expo documentation before using an API, install native packages with `npx expo install`, and add a dependency only for a demonstrated need with a compatible license.

### R10. A receipt is complete and final
`completeDelivery` requires a recipient and a stored photo and records `deliveredAt` and the IANA `timeZone`. A second confirmation throws `ConflictError`; completed deliveries are read-only, and `parseRecord` rejects a completed record missing any of those fields.

### R11. Photos are stored before they are referenced
Selected images are resized to at most 1600 px, re-encoded as JPEG and copied into app documents with a generated name before the record points to them. Unreferenced files are removed only after a 24-hour grace period. A failed save keeps the form and the selected photo for retry.

### R12. Permissions at the moment of use
Ask for camera access only when the person taps **Take photo**, and keep **Library** available as the alternative when access is denied.

### R13. Honest copy
The time comes from the device clock. Never describe it as verified, certified or legally valid, and never describe the receipt as proof of identity.

---

## Adding or changing a feature

1. Add or change the rule in `src/domain/model.ts` and cover it in `tests/domain.test.ts`.
2. If the stored shape changes, write the migration first (R3).
3. Build the screen in `src/features/deliveries/` with `src/ui` components, wire it through the store, and register the route in `src/app/`.
4. Design the loading, empty, error and content states, plus the screen-reader labels.
5. Update DESIGN.md when tokens, components or screen patterns change, and the README when visible behavior changes.

## Definition of done

- `npm run check`, `npm run format:check` and `npx expo-doctor` pass.
- The tests cover the changed rules. The suite already covers handoff requirements and repeated confirmation, corrupt completed records, list ordering, migrations, restart, optimistic concurrency and time-zone formatting.
- Native changes are exercised on an iOS simulator and an Android emulator. Before a release, verify on physical devices: camera capture with permission granted and denied, library selection, airplane mode and app restart.
- English copy, in sentence case, with no claims the app does not support.
- Never report a check as passing unless it ran. Guidelines for AI-assisted changes are in [docs/ai-engineering.md](docs/ai-engineering.md).
