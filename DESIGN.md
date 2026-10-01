# Delivery Receipts design system

A modern dispatch label: quick to scan at the door, highly legible outdoors, and deliberate at the moment of confirmation. The memorable element is the **reference number set large beside a ruled delivery timeline**. It should feel precise and premium without imitating a legal or certified document.

This document is the source of truth for the interface. Tokens live in [`src/theme/tokens.ts`](src/theme/tokens.ts) and shared components in [`src/ui/`](src/ui); screens use both and never hard-code colors, fonts or spacing.

## Principles

- One dominant action per screen, in the accent color.
- Rules organize content; there are no floating cards per delivery.
- References and times are data: monospaced, tabular, never truncated.
- The receipt states what the device recorded and nothing more: no seals, badges or claims of verified identity or time.

## Color

Light and dark appearances follow the system setting; every token has a value in both. Use tokens by role, not by hue.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `#F7F4EE` | `#191715` | Screen background |
| `surface` | `#FFFFFF` | `#26221F` | Fields, cards and grouped content |
| `raised` | `#FFFFFF` | `#4A423C` | Control that sits on a `fill` track, such as the segmented thumb |
| `fill` | `#EFE9E0` | `#322C28` | Tracks, pressed rows and quiet containers |
| `ink` | `#24211E` | `#F8F2E9` | Primary text and icons |
| `muted` | `#655C54` | `#CBBEB0` | Secondary text and metadata |
| `tertiary` | `#8A8076` | `#968B80` | Placeholders and de-emphasized captions |
| `accent` | `#B73521` | `#F07457` | Primary action, current step and selection |
| `accentSubtle` | `#F5E4DF` | `#3A2520` | Background behind accent content |
| `onAccent` | `#FFFFFF` | `#2A130E` | Text and icons on `accent` |
| `rule` | `#D9D0C4` | `#4A403A` | Dividers and list rules |
| `control` | `#968A7E` | `#7A6E65` | Field and control borders |
| `imageOutline` | `rgba(0, 0, 0, 0.1)` | `rgba(255, 255, 255, 0.1)` | 1 px outline around photos |

Measured contrast for the core pairs. Light: ink on canvas 14.59:1, muted on canvas 5.96:1, on-accent on accent 5.92:1. Dark: ink on canvas 16.06:1, muted on canvas 9.82:1, on-accent on accent 6.13:1.

## Typography

**Sora** for display and interface text, in a compact weight scale. **IBM Plex Mono** with tabular numerals for references, ordinals and section labels. Fonts are bundled from `@expo-google-fonts`; licenses are in `docs/font-licenses/`.

| Variant | Font | Size / line | Tracking | Max scale | Use |
| --- | --- | --- | --- | --- | --- |
| `display` | Sora 600 | 32 / 38 | -0.8 | 1.4× | Large screen titles |
| `title` | Sora 600 | 24 / 30 | -0.5 | 1.6× | Section and sheet titles |
| `headline` | Sora 600 | 17 / 23 | -0.2 | 2× | Row titles and emphasized values |
| `body` | Sora 400 | 16 / 24 | 0 | 2× | Paragraphs and field values |
| `button` | Sora 600 | 16 / 20 | -0.1 | 1.6× | Button labels |
| `label` | Sora 500 | 15 / 20 | 0 | 2× | Field labels and compact actions |
| `subhead` | Sora 400 | 14 / 20 | 0 | 2× | Supporting text under titles |
| `footnote` | Sora 400 | 13 / 18 | 0.1 | 2× | Metadata, timestamps and hints |
| `eyebrow` | IBMPlexMono 500 | 12 / 16 | 0.8 | 1.8× | Uppercase section labels (screen readers get sentence case) |
| `code` | IBMPlexMono 500 | 15 / 20 | 0.2 | 2× | Codes and references |
| `codeDisplay` | IBMPlexMono 500 | 40 / 44 | -1 | 1.3× | Large reference number on the receipt |
| `ordinal` | IBMPlexMono 500 | 22 / 26 | -0.4 | 1.4× | List numerals |

Tracking tightens as size grows and opens slightly on small text. `Max scale` caps Dynamic Type only where a display size would otherwise overflow.

## Spacing and shape

- Spacing (pt): `xxs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32 · `xxxl` 48 · `gutter` 20. `gutter` is the screen edge inset.
- Radius (pt): `sm` 4 · `md` 8 · `lg` 12 · `pill` 999.
- Mostly straight edges: 4 pt for small elements, 8 pt for controls, 12 pt for photos. 20 pt screen gutter, strong left alignment and clear dividers.
- Photos fill the evidence region edge to edge with a 1 px `imageOutline` and a visible **Photo evidence** label. Documentation imagery must be original or properly licensed.

## Motion

- Durations (ms): press: 120, quick: 160, base: 220, enter: 260. UI motion stays under 300 ms; navigation transitions belong to the platform.
- Curves: strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for entering and state changes, ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` for movement between two positions. Never ease-in on UI.
- Press feedback starts on press-in and scales to 0.97; it commits on release.
- One haptic per user action, on the same frame as the visual change. Haptics are never the only feedback.
- Animate only meaningful state changes. No decorative loops, confetti or counters that hide the real value.
- The move from pending to delivered happens only after the durable write succeeds.

## Components

| Component | Use it for |
| --- | --- |
| `Text` | Every string. Pick a `variant` from the type scale and a `tone` from the palette; never set font family or size inline. |
| `Button` | `primary`, `secondary`, `plain` and `destructive` actions. `busy` keeps the label in place and swaps the icon for a spinner. |
| `HeaderButton` | Native-header actions. Icon-only buttons always carry an accessible name. |
| `ScrollScreen`, `Block`, `Footer` | Screen body. `Block` aligns free-standing content to the gutter; `Footer` is the pinned action bar that clears the home indicator and the keyboard. |
| `Section`, `Row`, `ActionRow`, `Separator` | Ruled lists with `Row`, `ActionRow` and `Separator`. Rows are full-bleed with a background highlight on press, not cards. |
| `TextField` | Labelled inputs. `requirement` writes Required or Optional next to the label; `error` replaces the hint under the field. |
| `SegmentedControl` | Two or three mutually exclusive views, each with its count. |
| `EmptyState`, `Notice` | Empty lists (`EmptyState`) and inline errors next to the action that failed (`Notice`). |
| `Icon` | Semantic icon names mapped to SF Symbols on iOS and Material Symbols on Android and web. Screens never reference raw glyphs. |
| `PressableScale` | Custom pressable surfaces that need press feedback. |

Add a component to `src/ui/` only when a second screen needs it; otherwise keep it beside its feature in `src/features/<feature>/components/`.

## Screens

1. **Deliveries.** Large title, a segmented control for **To deliver** and **Delivered** with counts, then a ruled list. Each row shows a large ordinal, the reference in mono, the destination and the state in words with its time.
2. **New delivery (modal).** Reference and destination fields with required markers in text. **Create** sits in the header.
3. **Delivery.** Reference, destination and state, followed by the ruled timeline. A pending delivery pins **Record handoff** in the footer; a delivered one shows the receipt with photo evidence and note.
4. **Record handoff (modal).** Reference repeated at the top, recipient name, a 4:3 photo area with **Take photo** and **Library**, and an optional note. **Review handoff** stays disabled with a sentence explaining what is missing.
5. **Review handoff.** Read-only summary of recipient, note and photo, a sentence explaining that confirming saves the device time and time zone, then **Confirm delivery** and **Edit details**.
6. **About.** What the app records, a destructive **Delete all deliveries** row and the version and license line.

Navigation uses native Expo Router stacks: large titles on root screens, modals for creation and review, and platform back gestures everywhere.

## States

Every screen designs four states explicitly:

- **Loading:** the splash stays up until stored records are readable, so lists never flash empty.
- **Empty:** an `EmptyState` with an icon, one sentence on what to do and the primary action.
- **Error:** a `Notice` next to the action that failed. Forms keep their values and any selected photo so the person can retry.
- **Content:** the normal layout. Destructive actions ask for confirmation with the platform dialog.

## Accessibility

- Touch targets are at least 48 pt (`hitTarget`), including icon buttons and steppers.
- Every status is conveyed with an icon **and** words; color is never the only signal.
- Text scales with the system setting up to each variant's max scale; layouts wrap instead of truncating meaningful content.
- Every interactive element has an accessible role and name; custom controls expose their state (selected, checked, disabled, busy).
- Screen-reader labels read as sentences, without doubled punctuation, and announce errors when they appear.
- Reduce Motion replaces scale and slide effects with short opacity changes.
- Contrast targets: body text ≥ 4.5:1, large text and control borders ≥ 3:1, in both appearances.

## Copy

- English, sentence case, short and specific. Buttons say what happens (**Confirm delivery**, not **OK**).
- Errors say what went wrong and what to do next.
- Never claim more than the app does: no verified identity, certified time, compliance or authenticity statements.
