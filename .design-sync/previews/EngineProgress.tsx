import { EngineProgress } from "tour-de-growth";

/*
 * Progress told by what remains (design system extension 07, A18 T2.b): the
 * sentence leads with what is LEFT, never « fini » while a number has no
 * answer; an estimate, a request out or « can't find » is an answer. The
 * marks are one per number in the funnel's order, drawn without colour —
 * never a percentage bar.
 *
 * Every prop is the product's own. On the board: the element `BoardNumbers`
 * (app/[locale]/aarrr-funnel-template/_engine/BoardNumbers.tsx) hands
 * NumberList as `progress`, built by `listStages` and `listProgress`
 * (_engine/number-list.ts) on the engine's fixtures with the resolved copy.
 * In a number's screen: `NumberScreen`'s own `size="sm"` call, with
 * `numberRemaining`. Inside NumberList each stage's head also draws its
 * marks alone (`marksOnly`): see NumberList.
 */

/**
 * The page's example (`exampleState()`, `lib/engine/__tests__/fixtures.ts`), in English, under
 * « Your numbers » on the board: every number has an answer, so what remains reads « None to
 * go » — never « done » — and the counts follow, quieter: 11 found, 3 estimated, 1 asked, 2
 * that can't be found. Then one mark per number in the funnel's order, a gap between stages
 * (acquisition's three dots, activation's hatched estimate, retention's two struck rings,
 * referral's dashed request, revenue's two estimates), and the legend, which the board shows
 * once.
 */
export const OnTheBoard = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineProgress
      remaining={"None to go"}
      counts={"11 found · 3 estimated · 1 asked · 2 can't be found"}
      groups={[
        { id: "acquisition", label: "Acquisition: found, found and found", marks: ["found", "found", "found"] },
        { id: "activation", label: "Activation: found, found and estimated", marks: ["found", "found", "est"] },
        { id: "retention", label: "Retention: can't find, found and can't find", marks: ["cant", "found", "cant"] },
        { id: "referral", label: "Referral: found, found and asked", marks: ["found", "found", "asked"] },
        { id: "revenue", label: "Revenue: estimated, found, estimated, found and found", marks: ["est", "found", "est", "found", "found"] },
      ]}
      label={"Your numbers, stage by stage"}
      legend={[
        { status: "found", label: "Found" },
        { status: "est", label: "Estimated" },
        { status: "asked", label: "Asked" },
        { status: "cant", label: "Can't find" },
        { status: "todo", label: "To do" },
      ]}
      legendLabel={"What the marks mean"}
    />
  </div>
);

/**
 * A new engine with nothing typed (`emptyState()`), in French: « 17 à faire », no counts
 * (there is nothing to count yet), seventeen thin rings in five groups, and the legend.
 */
export const FreshEngine = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineProgress
      remaining={"17 à faire"}
      groups={[
        { id: "acquisition", label: "Acquisition : à faire, à faire et à faire", marks: ["todo", "todo", "todo"] },
        { id: "activation", label: "Activation : à faire, à faire et à faire", marks: ["todo", "todo", "todo"] },
        { id: "retention", label: "Retention : à faire, à faire et à faire", marks: ["todo", "todo", "todo"] },
        { id: "referral", label: "Referral : à faire, à faire et à faire", marks: ["todo", "todo", "todo"] },
        { id: "revenue", label: "Revenue : à faire, à faire, à faire, à faire et à faire", marks: ["todo", "todo", "todo", "todo", "todo"] },
      ]}
      label={"Tes chiffres, étape par étape"}
      legend={[
        { status: "found", label: "Trouvé" },
        { status: "est", label: "Estimé" },
        { status: "asked", label: "Demandé" },
        { status: "cant", label: "Introuvable" },
        { status: "todo", label: "À faire" },
      ]}
      legendLabel={"Ce que disent les marques"}
    />
  </div>
);

/**
 * The example with acquisition and activation answered and the last three stages not started,
 * in English: what remains first (« 11 to go »), then the five found and the one estimate; the
 * marks show where the work stopped.
 */
export const HalfWay = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineProgress
      remaining={"11 to go"}
      counts={"5 found · 1 estimated"}
      groups={[
        { id: "acquisition", label: "Acquisition: found, found and found", marks: ["found", "found", "found"] },
        { id: "activation", label: "Activation: found, found and estimated", marks: ["found", "found", "est"] },
        { id: "retention", label: "Retention: to do, to do and to do", marks: ["todo", "todo", "todo"] },
        { id: "referral", label: "Referral: to do, to do and to do", marks: ["todo", "todo", "todo"] },
        { id: "revenue", label: "Revenue: to do, to do, to do, to do and to do", marks: ["todo", "todo", "todo", "todo", "todo"] },
      ]}
      label={"Your numbers, stage by stage"}
      legend={[
        { status: "found", label: "Found" },
        { status: "est", label: "Estimated" },
        { status: "asked", label: "Asked" },
        { status: "cant", label: "Can't find" },
        { status: "todo", label: "To do" },
      ]}
      legendLabel={"What the marks mean"}
    />
  </div>
);

/**
 * The sales-assisted half of the hybrid example (`salesAssistedState()`), in French: one
 * number left (the time to go-live, still to do), so « Plus qu'un », then its answers by kind.
 * Sales-assisted's groups hold 3, 3, 3, 2 and 4 numbers.
 */
export const LastOne = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineProgress
      remaining={"Plus qu'un"}
      counts={"10 trouvés · 1 estimé · 1 demandé · 2 introuvables"}
      groups={[
        { id: "acquisition", label: "Acquisition : trouvé, trouvé et trouvé", marks: ["found", "found", "found"] },
        { id: "activation", label: "Activation : introuvable, trouvé et à faire", marks: ["cant", "found", "todo"] },
        { id: "retention", label: "Retention : trouvé, estimé et trouvé", marks: ["found", "est", "found"] },
        { id: "referral", label: "Referral : trouvé et demandé", marks: ["found", "asked"] },
        { id: "revenue", label: "Revenue : trouvé, trouvé, trouvé et introuvable", marks: ["found", "found", "found", "cant"] },
      ]}
      label={"Tes chiffres, étape par étape"}
      legend={[
        { status: "found", label: "Trouvé" },
        { status: "est", label: "Estimé" },
        { status: "asked", label: "Demandé" },
        { status: "cant", label: "Introuvable" },
        { status: "todo", label: "À faire" },
      ]}
      legendLabel={"Ce que disent les marques"}
    />
  </div>
);

/**
 * The same half-walked engine in French, in a number's own screen (`NumberScreen`, here day-30
 * retention): `size="sm"`, the sentence only, no counts and no marks — it sits at the right
 * end of the sheet's header, opposite « Retention · 1 sur 3 », which is `NumberSheet`'s and
 * not drawn here.
 */
export const OnANumberScreen = () => (
  <div style={{ maxWidth: 360 }}>
    <EngineProgress
      remaining={"11 à faire"}
      size="sm"
    />
  </div>
);
