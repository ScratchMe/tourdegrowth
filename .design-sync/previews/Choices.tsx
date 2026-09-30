import * as React from "react";
import { Choices } from "tour-de-growth";

/*
 * Pick one of a handful, as cards: a real radio group under its visible
 * question, native radios drawn with AnswerOption's ring, the inverse fill
 * once chosen. Not AnswerOption generalised — that one moves the quiz on after
 * a tap; Choices waits for a save. Nothing is chosen for the person. Strings
 * from brief 04 (the engine's metric sheet and setup, under review).
 */

const STATUS = [
  { value: "have", label: "I have it" },
  { value: "estimate", label: "I can estimate it" },
  { value: "ask", label: "I'll ask for it" },
  { value: "none", label: "I can't find it" },
];

const Live = (props: { initial: string | null } & Omit<React.ComponentProps<typeof Choices>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<string | null>(initial);
  return (
    <div style={{ maxWidth: 720 }}>
      <Choices {...rest} value={value} onChange={setValue} />
    </div>
  );
};

/** The status question, nothing chosen: two columns from a 560px group, one below. */
export const Empty = () => <Live initial={null} legend="Where are you with this number?" options={STATUS} columns={2} />;

/** Chosen: the inverse fill, the ring filled around a dot. */
export const Chosen = () => <Live initial="have" legend="Where are you with this number?" options={STATUS} columns={2} />;

/** Invalid on save, in French: the message sits under the group, the edge of no option turns. */
export const Invalid = () => (
  <Live
    initial={null}
    legend={"Où en es-tu avec ce chiffre ?"}
    options={[
      { value: "have", label: "Je l'ai" },
      { value: "estimate", label: "Je peux l'estimer" },
      { value: "ask", label: "Je le demande" },
      { value: "none", label: "Je ne le trouve pas" },
    ]}
    columns={2}
    error="Choisis où tu en es avec ce chiffre avant d'enregistrer."
  />
);

/** A sheet (`sm`): one live option, three « coming soon » — dashed, their reason at full contrast, never faded. */
export const DisabledWithAReason = () => (
  <Live
    initial="saas"
    legend="Your model"
    size="sm"
    options={[
      { value: "saas", label: "SaaS or web product, self-serve (trial or freemium)" },
      { value: "b2b", label: "B2B with a sales team", disabled: true, disabledLead: "Coming soon", disabledNote: "their funnel has a different shape." },
      { value: "consumer", label: "Consumer app", disabled: true, disabledLead: "Coming soon", disabledNote: "their funnel has a different shape." },
      { value: "marketplace", label: "Marketplace", disabled: true, disabledLead: "Coming soon", disabledNote: "their funnel has a different shape." },
    ]}
  />
);
