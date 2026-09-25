"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Disclosure } from "@/components/core/Disclosure";
import { Tag } from "@/components/core/Tag";
import type { PatternGroup } from "@/lib/game/view";
import styles from "./PatternCatalogue.module.css";

/** One trick of the level, every string resolved and filled by the island. */
export interface CatalogueEntry {
  /** The card id; also the hook `game-pattern-{id}`. */
  id: string;
  /** From `patternCatalogue()`. */
  group: PatternGroup;
  /** `patterns[id].official` — the name the literature gives it. */
  official: string;
  /** `cards[id].name` — the quiet name it had in the meeting. */
  meeting: string;
  /** Only for a trick the player used: `catalogue.statusActive` or `.statusRemoved`. */
  status: { label: string; removed: boolean } | null;
  /** `catalogue.hiddenEffect`, filled with the card's signed trust and radar. */
  hiddenEffect: string;
  law: string;
  cas: string;
  tell: string;
}

export interface PatternCatalogueProps {
  eyebrow: string;
  title: string;
  lead: string;
  /** `catalogue.groupUsed`, `.groupRefused`, `.groupUnseen`. */
  groups: Readonly<Record<PatternGroup, string>>;
  /** `catalogue.hiddenEffectLabel`, `.lawLabel`, `.caseLabel`, `.tellLabel`. */
  labels: { hiddenEffect: string; law: string; cas: string; tell: string };
  /** All the level's tricks — eight, never only the ones the player chose (GAME-BRIEF §4). */
  entries: readonly CatalogueEntry[];
  /**
   * Called each time the PLAYER opens a folded entry (the used ones are never
   * folded, so they never call it). The island keeps the first one for
   * `game_catalogue_open`: an entry open by default is not a reader's choice.
   */
  onOpen?: (id: string) => void;
}

const GROUP_ORDER: readonly PatternGroup[] = ["used", "refused", "unseen"];

function Summary({ entry }: { entry: CatalogueEntry }) {
  return (
    <span className={styles.head}>
      <span className={styles.official}>{entry.official}</span>
      <span className={styles.meeting}>{entry.meeting}</span>
      {entry.status ? (
        <Tag tone={entry.status.removed ? "outline" : "red"} className={styles.status}>
          {entry.status.label}
        </Tag>
      ) : null}
    </span>
  );
}

function Details({ entry, labels }: { entry: CatalogueEntry; labels: PatternCatalogueProps["labels"] }) {
  const rows: [string, ReactNode][] = [
    [labels.hiddenEffect, entry.hiddenEffect],
    [labels.law, entry.law],
    [labels.cas, entry.cas],
    [labels.tell, entry.tell],
  ];
  return (
    <dl className={styles.facts}>
      {rows.map(([term, value]) => (
        <div key={term} className={styles.fact}>
          <dt className={styles.term}>{term}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The full catalogue — GAME-BRIEF §5.11 point 5, plan §2.6.
 *
 * Every trick of the level, in three groups: the ones the player used, the
 * ones dealt and turned down, the ones never dealt. Each gets its real name
 * next to the meeting-room one, then what it hides, the law, a public case
 * and the tell to spot it elsewhere.
 *
 * The used ones are printed open, and are not disclosures: the brief wants
 * them unfolded, and `core/Disclosure` is closed by default, always — a
 * `<details open>` would break that rule to fake a state nobody chose. The
 * others fold, so eight entries of legal prose do not bury the page, and a
 * player opening one is a signal worth counting (`onOpen`).
 *
 * An empty group is left out rather than titled over nothing: a player who
 * used no trick reads « celles que tu as refusées » first, which is the
 * point of that ending.
 */
export function PatternCatalogue({ eyebrow, title, lead, groups, labels, entries, onOpen }: PatternCatalogueProps) {
  const root = useRef<HTMLElement>(null);
  const opened = useRef(onOpen);

  useEffect(() => {
    opened.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // `toggle` does not bubble; capture still reaches every <details> below.
    const handler = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement) || !target.open) return;
      const id = target.closest<HTMLElement>("[data-pattern]")?.dataset.pattern;
      if (id) opened.current?.(id);
    };
    el.addEventListener("toggle", handler, true);
    return () => el.removeEventListener("toggle", handler, true);
  }, []);

  return (
    <section ref={root} className={styles.catalogue} aria-labelledby="game-catalogue-title" data-testid="game-catalogue">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id="game-catalogue-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>

      {GROUP_ORDER.map((group) => {
        const members = entries.filter((e) => e.group === group);
        if (!members.length) return null;
        return (
          <div key={group} className={styles.group} data-group={group}>
            <h3 className={styles.groupTitle}>{groups[group]}</h3>
            <ul className={styles.list}>
              {members.map((entry) =>
                group === "used" ? (
                  <li key={entry.id} className={styles.open} data-pattern={entry.id} data-testid={`game-pattern-${entry.id}`}>
                    <Summary entry={entry} />
                    <Details entry={entry} labels={labels} />
                  </li>
                ) : (
                  <li key={entry.id} data-pattern={entry.id}>
                    <Disclosure summary={<Summary entry={entry} />} data-testid={`game-pattern-${entry.id}`}>
                      <Details entry={entry} labels={labels} />
                    </Disclosure>
                  </li>
                ),
              )}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
