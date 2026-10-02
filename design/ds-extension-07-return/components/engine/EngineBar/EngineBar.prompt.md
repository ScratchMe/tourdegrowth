EngineBar — design system extension 07. What you are looking at, and where everything else lives.

It replaces five things at the top of today's board (Q15): the engine line
and its `+` (switcher), the eyebrow ("Your growth engine · Self-serve · July
2026 cohort · August 2026 flows"), "Back to step by step", the month
selector with "Remind me", and — from the bottom of the board — the actions
row (Save, Import, Erase) with "Enter as a table" and the backup band.

## Anatomy

1. **The line** (MetaLabel, engine blue): engine · motion · month. A past
   month adds "· read only". The cohort is not in the line any more: it is
   said where it is used (the denominator of cohort numbers).
2. **"Never saved"** (Tag `outline`: dashed = pending) beside the line, only
   while the engine needs a backup.
3. **Settings** (quiet), right.
4. **The menu**, a Disclosure, closed: "Engine, month and file". Three
   groups, one item per 44px row:
   - *This engine*: "Switch or add an engine" (several engines per device,
     switched and deleted one by one), "Rename";
   - *Month*: the month shown (a Select, from the second month), "Compare
     two months", "Remind me to start {next} (.ics)";
   - *File*: "Save (.json)", "Import a file", "Enter as a table", "Erase this
     engine";
   - and, while the engine needs a backup, the backup sentence under them.

## Rules

- **Two controls** on the first screen: the menu and Settings. Nothing in
  the bar is ever primary.
- The backup warning lives in two places, both quiet, both only while
  needed: the "Never saved" tag here, and a line in NextStep (with "Save
  (.json)"). The full sentence (Safari's seven days) closes the File menu.
- "Back to step by step" and "See the full board" disappear: there is one
  engine screen (the board) and one number screen (NumberSheet).
- Erase asks for confirmation as today (unchanged behaviour).
