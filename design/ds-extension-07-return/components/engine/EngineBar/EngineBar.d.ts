import * as React from 'react';

/**
 * EngineBar — design system extension 07.
 * Which engine, how it sells, which month — and the one place for everything
 * that is not the next step: the menu (engines, month, file) and Settings.
 */
export interface EngineBarGroup {
  /** "This engine" · "Month" · "File" (localized). */
  title: string;
  /** Each a quiet Button, or a Select (the month shown). One per row. */
  items: React.ReactNode[];
}

export interface EngineBarProps {
  /** One line: "Unnamed engine · Self-serve · August 2026" (add "· read only" on a past month). */
  line: React.ReactNode;
  /** "Never saved" — the dashed tag (pending) while the engine needs a backup. Omit once saved. */
  pending?: React.ReactNode;
  /** The menu's summary: "Engine, month and file". */
  menuLabel: React.ReactNode;
  groups: EngineBarGroup[];
  /** Under the groups: the backup sentence (Safari's seven days), while the engine needs a backup. */
  note?: React.ReactNode;
  /** Opens the menu on first render (board states; the trap-to-definition pattern does not apply here). */
  menuOpen?: boolean;
  /** "Settings". */
  settingsLabel: React.ReactNode;
  onSettings: () => void;
}

export declare const EngineBar: React.ComponentType<EngineBarProps>;
