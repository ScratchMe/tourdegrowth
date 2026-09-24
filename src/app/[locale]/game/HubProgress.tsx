"use client";

import { useEffect, useState } from "react";
import { GAME_COLLECTION_KEY } from "@/lib/game/storage-keys";
import type { EndingId, LevelSlug } from "@/lib/game/types";
import type { Locale } from "@/lib/i18n/locale";

export interface HubProgressProps {
  slug: LevelSlug;
  locale: Locale;
  /** « Ta dernière année : {ending}, le {date}. » — already in the page's language. */
  template: string;
  endingLabels: Record<EndingId, string>;
  className?: string;
}

const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", fr: "fr-FR" };

/**
 * Only what this island needs from the collection, checked rather than
 * trusted: `localStorage` is anyone's to edit, and an unknown ending id or an
 * unreadable date renders nothing instead of a broken sentence.
 */
function readEnding(raw: string | null, slug: LevelSlug, labels: Record<string, string>): { id: EndingId; at: Date } | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const entry = (parsed as { endings?: Record<string, unknown> } | null)?.endings?.[slug];
    if (typeof entry !== "object" || entry === null) return null;
    const { id, at } = entry as { id?: unknown; at?: unknown };
    if (typeof id !== "string" || !(id in labels) || typeof at !== "string") return null;
    const date = new Date(at);
    return Number.isNaN(date.getTime()) ? null : { id: id as EndingId, at: date };
  } catch {
    return null;
  }
}

/**
 * The ending a player last reached on a level, read from this device — GAME-
 * BRIEF 11.5: "pour chaque niveau terminé la fin obtenue et la date".
 *
 * Read after mount, never in the initial state: the hub is prerendered, so the
 * server's HTML and the first client render must both be "nothing" (the
 * hydration lesson of step 4). A new visitor — most of this page's traffic —
 * therefore sees nothing appear and disappear.
 *
 * It only READS the collection. The shape is written by `lib/game/storage.ts`
 * in December; the key lives in `storage-keys.ts` so this island never has to
 * import the storage module and the level definition behind it.
 */
export function HubProgress({ slug, locale, template, endingLabels, className }: HubProgressProps) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(GAME_COLLECTION_KEY);
    } catch {
      // Storage refused (private mode, blocked site data): the hub simply shows no progress.
    }
    const ending = readEnding(raw, slug, endingLabels);
    if (!ending) return;
    const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "long", year: "numeric" }).format(
      ending.at,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount; seeding the initial state from it would break hydration (step 4).
    setLine(template.replace("{ending}", endingLabels[ending.id]).replace("{date}", date));
  }, [slug, locale, template, endingLabels]);

  if (!line) return null;
  return (
    <p className={className} data-testid={`game-hub-last-ending-${slug}`}>
      {line}
    </p>
  );
}
