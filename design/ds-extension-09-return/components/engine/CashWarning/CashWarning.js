// CashWarning — design system extension 09. The long-payback warning: "you
// make money, but late — maybe after your cash runs out". Plain React, no JSX.
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
