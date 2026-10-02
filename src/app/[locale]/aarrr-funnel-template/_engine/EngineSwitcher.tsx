"use client";

import { Button } from "@/components/core/Button";
import { Disclosure } from "@/components/core/Disclosure";
import type { EngineListing } from "@/lib/engine/storage";
import type { EngineStrings } from "@/lib/engine/strings";
import { MAX_ENGINES } from "@/lib/engine/types";
import { fill, formatDate, formatMonth } from "./text";
import styles from "./Screens.module.css";

/** An engine's name on the device (§19.1.5): its company, else « Moteur sans nom, créé le {date} ». */
export function engineName(listing: Pick<EngineListing, "companyLabel" | "createdAt">, strings: EngineStrings, locale: "en" | "fr"): string {
  return listing.companyLabel?.trim() || fill(strings.engines.unnamed, { date: formatDate(listing.createdAt, locale) });
}

/**
 * « Changer ou ajouter un moteur », in the engine bar's menu (engine spec
 * §19.1.5, C32 Q12, A14 T5; the menu since A18 T2.a): every engine of the
 * device, the one on screen said so, then « Nouveau moteur » — greyed, with
 * its reason, at `MAX_ENGINES`. Folded: one engine is the common case, and
 * the board is about its numbers, not about the device. Deleting one is in
 * the menu's « Fichier ».
 *
 * Names and months only (`EngineListing`): switching reads the other engine
 * from the device, the list never carries its numbers.
 */
export function EngineSwitcher({
  engines,
  currentId,
  strings,
  locale,
  onSwitch,
  onNew,
}: {
  engines: readonly EngineListing[];
  currentId: string;
  strings: EngineStrings;
  locale: "en" | "fr";
  onSwitch: (id: string) => void;
  onNew: () => void;
}) {
  const e = strings.engines;
  const full = engines.length >= MAX_ENGINES;
  return (
    <Disclosure size="sm" rule={false} className={styles.switcher} summary={strings.bar.switch} data-testid="engine-switcher">
      <ul className={styles.switcherList} data-testid="engine-switcher-list">
        {engines.map((listing) => {
          const name = engineName(listing, strings, locale);
          const meta = fill(e.upTo, { month: formatMonth(listing.lastMonth, locale) });
          return (
            <li key={listing.id} className={styles.switcherItem} aria-current={listing.id === currentId ? "true" : undefined} data-testid={`engine-switcher-${listing.id}`}>
              <span className={styles.switcherName}>{name}</span>
              <span className={styles.switcherMeta}>{listing.id === currentId ? `${meta} · ${e.onScreen}` : meta}</span>
              {listing.id === currentId ? null : (
                <Button variant="quiet" size="sm" onClick={() => onSwitch(listing.id)} aria-label={`${e.open} — ${name}`} data-testid={`engine-switch-${listing.id}`}>
                  {e.open}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className={styles.panelActions}>
        <Button variant="secondary" size="sm" onClick={onNew} disabled={full} aria-describedby={full ? "engine-switcher-full" : undefined} data-testid="engine-new">
          {e.new}
        </Button>
      </div>
      {full ? (
        <p id="engine-switcher-full" className={styles.switcherMeta} data-testid="engine-switcher-full">
          {fill(e.full, { max: MAX_ENGINES })}
        </p>
      ) : null}
    </Disclosure>
  );
}
