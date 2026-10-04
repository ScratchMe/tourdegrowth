import * as React from "react";
import { DefinitionTrigger, HowItCompares, NumberField } from "tour-de-growth";

/*
 * The figure, the published reference and the team's target as one object
 * (design system extension 07, A18 T1): one chart (the bar is the figure, the
 * red tick the target, the bracket under the track the published range), one
 * legend line, the caveat word for word, and the target box. The diagnosis
 * rule (C1) lives here: the verdict tag exists only against a TEAM TARGET —
 * a reference never earns a tag, a colour or an edge.
 *
 * Every prop is the product's own: the `compare` slot `MetricSheet`
 * (app/[locale]/aarrr-funnel-template/_engine/MetricSheet.tsx) fills, rendered
 * on the engine's fixtures with the resolved copy — the reference and its
 * caveat from the catalogue, the verdict from the motion's diagnosis. The
 * reference's « ? » and the target's are the engine's `EngineTerm`, drawn
 * with the system's `DefinitionTrigger` (closed); the target box is
 * `TargetField`'s `NumberField`, its value in a local wrapper (the product
 * writes it on blur). Width: the sheet's body.
 */

const LiveNumber = ({ initial, ...rest }: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

/**
 * The example's activation rate, in English: the bar is the figure (18%), the bracket under
 * the track the published range (20–40%), the red tick the team's target (20%). Below that
 * target, the tag is the red of a diagnosis — « Below the target ». The reference only
 * situates: its caveat says so, word for word. The target box sits under it, where the value
 * is in front of the person.
 */
export const BelowTarget = () => (
  <div style={{ maxWidth: 658 }}>
    <HowItCompares
      title="How it compares"
      value={18}
      domain={[0, 80]}
      band={[20, 40]}
      target={20}
      chartLabel={"Activation rate: 18%. Reference 20–40%. Target 20%."}
      legend={[
        { kind: "value", label: "Your figure 18%" },
        {
          kind: "band",
          label: <>
            {"Reference 20–40%"}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term="reference" label="Definition: reference" />
            </span>
          </>,
        },
        { kind: "target", label: "Your team's target 20%" },
      ]}
      caveat={"For context, never to name a stage: for SaaS onboarding, often lower for free trials; it all depends on how demanding the chosen event is"}
      verdict={{ tone: "below", label: "Below the target" }}
      targetField={<LiveNumber
        size="sm"
        id="below-act-rate-target"
        label={"Your team's target"}
        optional="optional"
        hint={<>
          {"Only a target names the stage that holds you back. Without one, the figure still counts."}
          <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
            <DefinitionTrigger term="target" label="Definition: target" />
          </span>
        </>}
        initial={20}
        locale="en"
        digits={5}
        suffix={"%"}
        unitName="per cent"
        parseError="Type a number, such as 1,250 or 18.5."
      />}
    />
  </div>
);

/**
 * Monthly logo churn, in French, with the team's target typed at 3 % (the example's churn, 10
 * of 400): 2,5 % is outside the published range (1 à 2 %) and still earns no red — a reference
 * never does (C1). Against the target the figure is better (churn: lower is better), so the
 * tag is neutral: « Sous la cible ».
 */
export const UnderTarget = () => (
  <div style={{ maxWidth: 658 }}>
    <HowItCompares
      title="Comment il se situe"
      value={2.5}
      domain={[0, 4.5]}
      band={[1, 2]}
      target={3}
      chartLabel={"Churn logo mensuel : 2,5 %. Repère 1 à 2 %. Cible 3 %."}
      legend={[
        { kind: "value", label: "Ton chiffre 2,5 %" },
        {
          kind: "band",
          label: <>
            {"Repère 1 à 2 %"}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term={"repère"} label={"Définition : repère"} />
            </span>
          </>,
        },
        { kind: "target", label: "La cible de ton équipe 3 %" },
      ]}
      caveat={"Pour situer, sans désigner d'étape : pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut, les contrats entreprise bien plus bas"}
      verdict={{ tone: "ok", label: "Sous la cible" }}
      targetField={<LiveNumber
        size="sm"
        id="under-ret-logo-churn-target"
        label={"La cible de ton équipe"}
        optional="facultatif"
        hint={<>
          {"Seule une cible désigne l'étape qui freine. Sans cible, le chiffre compte quand même."}
          <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
            <DefinitionTrigger term="cible" label={"Définition : cible"} />
          </span>
        </>}
        initial={3}
        locale="fr"
        digits={5}
        suffix={" %"}
        unitName="pour cent"
        parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
      />}
    />
  </div>
);

/**
 * The example's sign-up rate, in English: a stage the team set no target for. The bar (820
 * sign-ups out of 26,000 visitors, 3.2%) sits inside the published range (2–5%), no tick, no
 * tag, no stage named; the empty target box is the way to one.
 */
export const NoTarget = () => (
  <div style={{ maxWidth: 658 }}>
    <HowItCompares
      title="How it compares"
      value={3.153846}
      domain={[0, 10]}
      band={[2, 5]}
      chartLabel={"Sign-up rate: 3.2%. Reference 2–5%. No target."}
      legend={[
        { kind: "value", label: "Your figure 3.2%" },
        {
          kind: "band",
          label: <>
            {"Reference 2–5%"}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term="reference" label="Definition: reference" />
            </span>
          </>,
        },
      ]}
      caveat={"For context, never to name a stage: for cold paid traffic, far higher for warm traffic; your traffic is a mix"}
      targetField={<LiveNumber
        size="sm"
        id="notarget-acq-signup-rate-target"
        label={"Your team's target"}
        optional="optional"
        hint={<>
          {"Only a target names the stage that holds you back. Without one, the figure still counts."}
          <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
            <DefinitionTrigger term="target" label="Definition: target" />
          </span>
        </>}
        initial={null}
        locale="en"
        digits={5}
        suffix={"%"}
        unitName="per cent"
        parseError="Type a number, such as 1,250 or 18.5."
      />}
    />
  </div>
);

/**
 * The example's gross margin, in French, estimated at 70 to 80 %: an estimate draws no bar —
 * the legend says the range — so the chart holds only the published range (70 à 85 %). The
 * margin cannot name a stage: no target box, and the note « Ce chiffre situe ; il ne désigne
 * pas d'étape. »
 */
export const Situates = () => (
  <div style={{ maxWidth: 658 }}>
    <HowItCompares
      title="Comment il se situe"
      domain={[0, 170]}
      band={[70, 85]}
      chartLabel={"Marge brute : 70 à 80 %. Repère 70 à 85 %. Pas de cible."}
      legend={[
        { kind: "value", label: "Ton chiffre 70 à 80 %" },
        {
          kind: "band",
          label: <>
            {"Repère 70 à 85 %"}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term={"repère"} label={"Définition : repère"} />
            </span>
          </>,
        },
      ]}
      caveat={"Pour situer, sans désigner d'étape : en SaaS ; bien moins dès qu'il y a de l'humain dans la livraison"}
      note={"Ce chiffre situe ; il ne désigne pas d'étape."}
    />
  </div>
);

/**
 * Day-30 retention in English, which the example can't find (not tracked): no figure, no
 * publishable reference, no target, so no chart at all. What remains is the caveat — « No
 * reference worth publishing: … » — and the target box.
 */
export const NothingToDraw = () => (
  <div style={{ maxWidth: 658 }}>
    <HowItCompares
      title="How it compares"
      domain={[0, 10]}
      chartLabel="Day-30 retention: no figure yet. No target."
      caveat={"No reference worth publishing: the published orders of magnitude are for consumer apps; in SaaS, compare the shape of your curve from one month to the next."}
      targetField={<LiveNumber
        size="sm"
        id="nothing-ret-d30-target"
        label={"Your team's target"}
        optional="optional"
        hint={<>
          {"Only a target names the stage that holds you back. Without one, the figure still counts."}
          <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
            <DefinitionTrigger term="target" label="Definition: target" />
          </span>
        </>}
        initial={null}
        locale="en"
        digits={5}
        suffix={"%"}
        unitName="per cent"
        parseError="Type a number, such as 1,250 or 18.5."
      />}
    />
  </div>
);
