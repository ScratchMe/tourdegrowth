"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DefinitionPopover } from "@/components/glossary/DefinitionPopover";
import { DefinitionTrigger } from "@/components/glossary/DefinitionTrigger";
import type { EngineStrings } from "@/lib/engine/strings";
import { fill } from "./text";
import styles from "./EngineTerm.module.css";

/** The engine's own words with a « ? » (A18 T6, the return 07's five glossary entries; A20.d T2 and T5, the return 09's money and runway). */
export type EngineTermId = "cohort" | "target" | "reference" | "window" | "sharedCount" | "cashTied" | "afterPayback" | "runway";

const Scope = createContext<{
  openId: EngineTermId | null;
  open: (id: EngineTermId) => void;
  close: (id: EngineTermId) => void;
} | null>(null);

/**
 * One definition open at a time across the island's screens (SPEC-ADDENDUM-01.md §1.2, as `GlossaryTerm`).
 * `close` clears only the term it names: pressing another « ? » opens that one first, then the open popover's
 * press-outside closes itself — and must not close the one just opened.
 */
export function EngineTermScope({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<EngineTermId | null>(null);
  return (
    <Scope.Provider value={{ openId, open: setOpenId, close: (id) => setOpenId((current) => (current === id ? null : current)) }}>
      {children}
    </Scope.Provider>
  );
}

/**
 * A word's « ? » and its definition, where the word is first needed (the
 * return 07, Q19): « cohorte » on a cohort number's months, « cible » on the
 * target box and the Settings' targets, « repère » in « Comment il se
 * situe », « fenêtre » under the activation window, « nombre partagé » over
 * the Settings' shared counts.
 *
 * `GlossaryTerm` draws the same « ? » from the site's glossary, which the
 * island never imports (`engine-boundary`, rule 2): these five come with
 * the engine's own copy (`strings.terms`), resolved on the server like
 * every other word of the island, and have no page of their own, so no
 * « En savoir plus ». The trigger and the popover are the design system's.
 * Never inside a `<label>`: a button there would become the control it names.
 */
export function EngineTerm({ id, strings, tone = "muted" }: { id: EngineTermId; strings: EngineStrings; tone?: "muted" | "ink" | "alert" }) {
  const scope = useContext(Scope);
  const [ownOpen, setOwnOpen] = useState(false);
  const open = scope ? scope.openId === id : ownOpen;
  const setOpen = (on: boolean) => (scope ? (on ? scope.open(id) : scope.close(id)) : setOwnOpen(on));
  const t = strings.terms;
  const entry = t[id];
  return (
    <span className={open ? `${styles.anchor} ${styles.anchorOpen}` : styles.anchor}>
      <DefinitionTrigger
        term={entry.term}
        label={fill(t.label, { term: entry.term })}
        open={open}
        tone={tone}
        onClick={() => setOpen(!open)}
        data-testid={`engine-term-${id}`}
      />
      {open ? <DefinitionPopover placement="auto" term={entry.term} definition={entry.definition} closeLabel={t.close} onClose={() => setOpen(false)} /> : null}
    </span>
  );
}
