"use client";

import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Disclosure } from "@/components/core/Disclosure";
import { Tag } from "@/components/core/Tag";
import styles from "./EngineBar.module.css";

export interface EngineBarGroup {
  /** « Ce moteur » · « Mois » · « Fichier ». A string: it also names the group for a screen reader. */
  title: string;
  /** Each a quiet Button, or a Select (the month shown). One per row. */
  items: ReactNode[];
}

export interface EngineBarProps {
  /** One line: « Moteur sans nom · libre-service · août 2026 » (« · lecture seule » on a past month). */
  line: ReactNode;
  /** « Jamais sauvegardé »: the dashed tag (pending) while the engine needs a backup. Omit once saved. */
  pending?: ReactNode;
  /** The menu's summary: « Moteur, mois et fichier ». */
  menuLabel: ReactNode;
  groups: EngineBarGroup[];
  /** Under the groups: the backup sentence (Safari's seven days), while the engine needs a backup. */
  note?: ReactNode;
  /** Opens the menu on first render. Closed otherwise: the next step is not in it. */
  menuOpen?: boolean;
  /** « Réglages ». */
  settingsLabel: ReactNode;
  onSettings: () => void;
  className?: string;
  /** The root's; the menu and the settings button take `-menu` and `-settings` after it. */
  "data-testid"?: string;
}

/**
 * Which engine, how it sells, which month — and the one place for
 * everything that is not the next step: the menu (engines, month, file) and
 * the settings. Design system extension 07 (brief 07 Q15). It replaces five
 * things at the head of the board: the engine switcher, the eyebrow, the
 * month selector and its reminder, and — from the foot of the board — the
 * row of file actions with the backup band.
 *
 * Two controls on the first screen, the menu and the settings; nothing in
 * the bar is ever primary. The backup warning lives in two quiet places,
 * only while needed: the dashed tag here, and its full sentence closing the
 * menu (NextStep carries the third, with « Sauvegarder (.json) »).
 */
export function EngineBar({
  line,
  pending,
  menuLabel,
  groups,
  note,
  menuOpen,
  settingsLabel,
  onSettings,
  className,
  "data-testid": testId,
}: EngineBarProps) {
  const sub = (name: string) => (testId ? `${testId}-${name}` : undefined);
  return (
    <div className={[styles.root, className ?? ""].filter(Boolean).join(" ")} data-testid={testId}>
      <div className={styles.top}>
        <div className={styles.line}>
          <MetaLabel size="sm" tone="ink" className={styles.what} data-testid={sub("line")}>
            {line}
          </MetaLabel>
          {pending ? (
            <Tag tone="outline" data-testid={sub("pending")}>
              {pending}
            </Tag>
          ) : null}
        </div>
        <Button variant="quiet" size="sm" onClick={onSettings} className={styles.settings} data-testid={sub("settings")}>
          {settingsLabel}
        </Button>
      </div>
      <Disclosure summary={menuLabel} defaultOpen={menuOpen} data-testid={sub("menu")}>
        <div className={styles.groups}>
          {groups.map((group) => (
            <section key={group.title} className={styles.group} aria-label={group.title}>
              <MetaLabel as="h3" size="xs" tone="muted">
                {group.title}
              </MetaLabel>
              <ul className={styles.items}>
                {group.items.map((item, i) => (
                  // The items are fixed per group and never reorder: the index is their identity.
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {note ? <p className={styles.note}>{note}</p> : null}
      </Disclosure>
    </div>
  );
}
