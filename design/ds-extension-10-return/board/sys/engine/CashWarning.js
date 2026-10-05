// Board stand-in for the synced CashWarning (components/engine/CashWarning, the live
// system, 2026-10-04): its markup and class names, so the live CSS draws
// it (system-snapshot.css). Unchanged by extension 10. Not ported.
import React from "react";

const h = React.createElement;

/**
 * Q5. A warning, not an alarm: the system's advice (a dashed red edge, the
 * look of the backup line and the trap), never the solid red of the
 * diagnosis, never the ink tag of the loss. One sentence, its trigger in a
 * slot: "longer than {what}" — the team's runway, or a payback target of the
 * team (C49). A published reference may situate a payback, never trigger
 * this (constraint 2).
 *
 * Never drawn when the loss speaks: a customer who leaves before paying back
 * is the loss, not a late return (MoneyBlock decides).
 *
 * `maybe`: the payback is a range that straddles the limit; the sentence
 * says "may be longer", same look.
 */
export const CashWarning = ({ children, maybe = false, className }) =>
  h("p", {
    className: ["CashWarning_root", className].filter(Boolean).join(" "),
    "data-maybe": maybe ? "" : undefined,
  }, children);
