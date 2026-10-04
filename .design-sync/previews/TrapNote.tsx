import { Button, TrapNote } from "tour-de-growth";

/*
 * The number's trap, shown open just above the value it changes (design system
 * extension 07, A18 T1): every trap of the catalogue is about what to put in
 * the box — which count, which period, which tool's definition. Advice, so a
 * dashed red edge (`--engine-advice-edge`), never a wash, a solid red edge
 * (a diagnosis) or a card.
 *
 * Every prop is the product's own: the `trap` slot `MetricSheet`
 * (app/[locale]/aarrr-funnel-template/_engine/MetricSheet.tsx) fills, rendered
 * on the engine's fixtures with the resolved copy — the trap text from the
 * catalogue (`engine-catalog.ts`), the hybrid's from `strings.sheet.hybridTrap`.
 * Width: the sheet's body.
 */

/**
 * The activation rate's trap, in French (the example): the catalogue's text word for word, and
 * — because this trap tells the person to write their definition down — the one quiet action,
 * « Écrire ta définition ». On the sheet it opens the folded « Ta définition et une note » and
 * moves the focus to the definition; alone here, it has no handler.
 */
export const AsksForADefinition = () => (
  <div style={{ maxWidth: 658 }}>
    <TrapNote
      label={"Le piège, avant de taper"}
      action={<Button variant="quiet" size="sm" aria-controls="define-act-rate-words">
        {"Écrire ta définition"}
      </Button>}
    >
      {"Change l'action retenue et le taux peut varier du simple au double. Écris ta définition, et garde la même d'un mois à l'autre."}
    </TrapNote>
  </div>
);

/**
 * Monthly logo churn's trap, in English (the example): advice, so a dashed red edge, never a
 * wash or a card; the label also names the note for a screen reader. No action: this trap asks
 * for nothing to be written.
 */
export const Plain = () => (
  <div style={{ maxWidth: 658 }}>
    <TrapNote label="The trap, before you type">
      {"This counts customers, not revenue: revenue churn is another number. And a monthly churn above thirty percent is often an annual figure."}
    </TrapNote>
  </div>
);

/**
 * The same trap in the hybrid example, in French: when both motions are ticked, self-serve's
 * churn carries a second trap under its own label (« Si tu vends des deux façons ») — an
 * account moved to the sales team leaves self-serve, it is not lost. One note per number: the
 * hybrid's trap joins it.
 */
export const InTheHybrid = () => (
  <div style={{ maxWidth: 658 }}>
    <TrapNote
      label={"Le piège, avant de taper"}
      hybrid={{
        label: "Si tu vends des deux façons",
        text: "Un compte passé à l'assisté n'est ni perdu, ni en baisse, ni en hausse : il quitte le libre-service. Si ton outil de facturation l'annule, retire-le des perdus.",
      }}
    >
      {"On compte des clients, pas du revenu : le churn en revenu est un autre chiffre. Et un churn mensuel au-dessus de trente pour cent est souvent un chiffre annuel."}
    </TrapNote>
  </div>
);
