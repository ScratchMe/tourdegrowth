import { EngineStart } from "tour-de-growth";

/*
 * The first visit's only setup screen (design system extension 07, A18
 * T3.a): one question, how the company sells, answered by default; the plan
 * that answer means, counted from the catalogue's effort tags; every other
 * default in one sentence with « Modifier »; one primary, the example and the
 * import quiet. Flat: on a first visit the page's raised card is the privacy
 * promise above it.
 *
 * Every prop is the product's own: `startCopy` (app/[locale]/aarrr-funnel-
 * template/EngineWorkbench.tsx, over `startPlan` and `startDefaults` in
 * _engine/start.ts) run with the resolved copy on the fixtures' today, plus
 * the quiet ways the workbench adds on each screen. The motion radios share
 * the component's one `name`, as the page has one start screen; each cell
 * sits in its own <form> so the four groups on this card stay apart.
 */
const noop = () => {};

/**
 * A first visit, in French: nothing on the device yet, so this is the tool's first screen. The
 * one question is answered by its default, « Libre-service », and the plan under it counts
 * that motion's numbers by effort: « 17 chiffres : 5 se lisent en cinq minutes, 7 demandent
 * environ une heure chacun, 5 sont à demander à quelqu'un. » Every other default is one
 * sentence (the months are the ones a first visit on the fixtures' today, 24 September 2026,
 * starts on), with « Modifier » for the full settings. One primary; the example and the import
 * are quiet.
 */
export const FirstVisit = () => (
  <form style={{ maxWidth: 720 }} onSubmit={(e) => e.preventDefault()}>
    <EngineStart
      title={"Avant de commencer"}
      legend={"Comment vends-tu ?"}
      options={[
        { value: "ss", label: "Libre-service", note: "On s'inscrit et on paie seul (PLG)." },
        { value: "sa", label: "Assisté", note: "Un commercial signe les contrats (SLG)." },
        { value: "both", label: "Les deux", note: "Deux moteurs, un total." },
      ]}
      motion="ss"
      onMotionChange={noop}
      plan={"17 chiffres : 5 se lisent en cinq minutes, 7 demandent environ une heure chacun, 5 sont à demander à quelqu'un."}
      defaults={"Réglé pour un SaaS B2B, en euros. Mois des chiffres : août 2026 ; inscrits suivis : juillet 2026."}
      changeLabel={"Modifier"}
      onChange={noop}
      startLabel={"Commence →"}
      onStart={noop}
      exampleLabel={"Voir un exemple rempli"}
      onExample={noop}
      importLabel={"Importer un fichier (.json)"}
      onImport={noop}
      headingId="start-first-visit"
    />
  </form>
);

/**
 * The same screen in English with « Sales-assisted » picked: the plan counts the
 * sales-assisted catalogue (« 15 numbers: 4 take five minutes, 5 about an hour each, 6 come
 * from someone else. »), and the defaults sentence drops the followed sign-ups —
 * sales-assisted follows no self-serve cohort, its numbers cover three months.
 */
export const SalesAssisted = () => (
  <form style={{ maxWidth: 720 }} onSubmit={(e) => e.preventDefault()}>
    <EngineStart
      title={"Before you start"}
      legend={"How do you sell?"}
      options={[
        { value: "ss", label: "Self-serve", note: "People sign up and pay on their own (PLG)." },
        { value: "sa", label: "Sales-assisted", note: "A salesperson signs the deals (SLG)." },
        { value: "both", label: "Both", note: "Two engines, one total." },
      ]}
      motion="sa"
      onMotionChange={noop}
      plan={"15 numbers: 4 take five minutes, 5 about an hour each, 6 come from someone else."}
      defaults={"Set for a B2B SaaS, in euros, on three months of figures up to August 2026."}
      changeLabel={"Change"}
      onChange={noop}
      startLabel={"Start →"}
      onStart={noop}
      exampleLabel={"See a filled-in example"}
      onExample={noop}
      importLabel={"Import a file (.json)"}
      onImport={noop}
      headingId="start-sales-assisted"
    />
  </form>
);

/**
 * « Les deux » picked, in French: the two motions and the link that ties them, « 33 chiffres :
 * 9 se lisent en cinq minutes, 13 demandent environ une heure chacun, 11 sont à demander à
 * quelqu'un. » The defaults sentence is self-serve's again.
 */
export const Both = () => (
  <form style={{ maxWidth: 720 }} onSubmit={(e) => e.preventDefault()}>
    <EngineStart
      title={"Avant de commencer"}
      legend={"Comment vends-tu ?"}
      options={[
        { value: "ss", label: "Libre-service", note: "On s'inscrit et on paie seul (PLG)." },
        { value: "sa", label: "Assisté", note: "Un commercial signe les contrats (SLG)." },
        { value: "both", label: "Les deux", note: "Deux moteurs, un total." },
      ]}
      motion="both"
      onMotionChange={noop}
      plan={"33 chiffres : 9 se lisent en cinq minutes, 13 demandent environ une heure chacun, 11 sont à demander à quelqu'un."}
      defaults={"Réglé pour un SaaS B2B, en euros. Mois des chiffres : août 2026 ; inscrits suivis : juillet 2026."}
      changeLabel={"Modifier"}
      onChange={noop}
      startLabel={"Commence →"}
      onStart={noop}
      exampleLabel={"Voir un exemple rempli"}
      onExample={noop}
      importLabel={"Importer un fichier (.json)"}
      onImport={noop}
      headingId="start-both"
    />
  </form>
);

/**
 * Another engine (« New engine » in the switcher), in English: the same screen, the question
 * back at its default, and « Start » beside a quiet « Cancel » that goes back to the engine on
 * screen — no example, no import here.
 */
export const AnotherEngine = () => (
  <form style={{ maxWidth: 720 }} onSubmit={(e) => e.preventDefault()}>
    <EngineStart
      title={"Before you start"}
      legend={"How do you sell?"}
      options={[
        { value: "ss", label: "Self-serve", note: "People sign up and pay on their own (PLG)." },
        { value: "sa", label: "Sales-assisted", note: "A salesperson signs the deals (SLG)." },
        { value: "both", label: "Both", note: "Two engines, one total." },
      ]}
      motion="ss"
      onMotionChange={noop}
      plan={"17 numbers: 5 take five minutes, 7 about an hour each, 5 come from someone else."}
      defaults={"Set for a B2B SaaS, in euros, on August 2026's figures and July 2026's sign-ups."}
      changeLabel={"Change"}
      onChange={noop}
      startLabel={"Start →"}
      onStart={noop}
      cancelLabel={"Cancel"}
      onCancel={noop}
      headingId="start-another"
    />
  </form>
);
