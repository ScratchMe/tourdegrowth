import { EngineProgress, NumberList } from "tour-de-growth";

/*
 * « Tes chiffres » on the board (design system extension 07, C41, A18 T2.b):
 * every number of the engine, by stage, in the funnel's order, one row each
 * — name, value, status — that opens the number's own screen. The stage a
 * team target names gets the diagnosis edge; pending states wear the dashed
 * tag, the others the neutral one; a found number shows its value only.
 *
 * Every prop is the product's own: `BoardNumbers` (app/[locale]/aarrr-
 * funnel-template/_engine/BoardNumbers.tsx) run on the engine's fixtures
 * with the resolved copy — `listStages` and `listProgress` (_engine/
 * number-list.ts), each row's value through the board's formatter, its note
 * from `unknownReason` and `rowDelta`. The product draws all five stages:
 * each cell keeps the title and the progress and cuts the list to one or two
 * consecutive stages, named in its comment, so a cell stays a screen high.
 */

const noop = () => {};

/**
 * The page's example (`exampleState()`, `lib/engine/__tests__/fixtures.ts`), in French: the
 * title, the progress (« Plus rien à faire », the counts, the marks, the legend), then each
 * stage with its own marks and how many of its numbers are found, one row per number. A found
 * number shows its value and no tag — the value is the status; the activation event is the
 * person's own words, in italics; the time-to-value is an estimate, a range with its neutral
 * tag. Activation is the stage a team target names: the solid red edge and « Freine ici », the
 * list's only red. Shown: Acquisition and Activation; cut here for height: Retention,
 * Referral, Revenue.
 */
export const SelfServe = () => (
  <div style={{ maxWidth: 760 }}>
    <NumberList
      title={"Tes chiffres"}
      progress={
        <EngineProgress
          remaining={"Plus rien à faire"}
          counts={"11 trouvés · 3 estimés · 1 demandé · 2 introuvables"}
          groups={[
            { id: "acquisition", label: "Acquisition : trouvé, trouvé et trouvé", marks: ["found", "found", "found"] },
            { id: "activation", label: "Activation : trouvé, trouvé et estimé", marks: ["found", "found", "est"] },
            { id: "retention", label: "Retention : introuvable, trouvé et introuvable", marks: ["cant", "found", "cant"] },
            { id: "referral", label: "Referral : trouvé, trouvé et demandé", marks: ["found", "found", "asked"] },
            { id: "revenue", label: "Revenue : estimé, trouvé, estimé, trouvé et trouvé", marks: ["est", "found", "est", "found", "found"] },
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
      }
      stages={[
        {
          id: "acquisition",
          name: "Acquisition",
          foundLabel: "3 sur 3 trouvés",
          marks: ["found", "found", "found"],
          rows: [
            { id: "acq.signup-rate", name: "Taux d'inscription", value: "3,2 %", status: "found", onOpen: noop },
            { id: "acq.top-channel-share", name: "Part du premier canal", value: "50 %", status: "found", onOpen: noop },
            { id: "acq.cac", name: "CAC", value: "~500 €", status: "found", onOpen: noop },
          ],
        },
        {
          id: "activation",
          name: "Activation",
          holdsBack: true,
          holdsLabel: "Freine ici",
          foundLabel: "2 sur 3 trouvés",
          marks: ["found", "found", "est"],
          rows: [
            { id: "act.rate", name: "Taux d'activation", value: "18 %", status: "found", onOpen: noop },
            { id: "act.event", name: "Événement d'activation", value: "« a créé un premier projet »", valueKind: "words", status: "found", onOpen: noop },
            { id: "act.ttv", name: "Time-to-value médian", value: "1 à 3 jours", status: "est", statusLabel: "Estimé", onOpen: noop },
          ],
        },
      ]}
      headingId="engine-numbers-self"
    />
  </div>
);

/**
 * A new engine with nothing typed (`emptyState()`), in English: « 17 to go », no counts, and
 * every row says « To do » in the dashed (pending) tag, no value. No target yet, so no stage
 * holds back. Shown: Acquisition and Activation; cut here for height: Retention, Referral,
 * Revenue.
 */
export const FreshEngine = () => (
  <div style={{ maxWidth: 760 }}>
    <NumberList
      title={"Your numbers"}
      progress={
        <EngineProgress
          remaining={"17 to go"}
          groups={[
            { id: "acquisition", label: "Acquisition: to do, to do and to do", marks: ["todo", "todo", "todo"] },
            { id: "activation", label: "Activation: to do, to do and to do", marks: ["todo", "todo", "todo"] },
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
      }
      stages={[
        {
          id: "acquisition",
          name: "Acquisition",
          foundLabel: "0 of 3 found",
          marks: ["todo", "todo", "todo"],
          rows: [
            { id: "acq.signup-rate", name: "Sign-up rate", status: "todo", statusLabel: "To do", onOpen: noop },
            { id: "acq.top-channel-share", name: "Top channel share", status: "todo", statusLabel: "To do", onOpen: noop },
            { id: "acq.cac", name: "CAC", status: "todo", statusLabel: "To do", onOpen: noop },
          ],
        },
        {
          id: "activation",
          name: "Activation",
          foundLabel: "0 of 3 found",
          marks: ["todo", "todo", "todo"],
          rows: [
            { id: "act.rate", name: "Activation rate", status: "todo", statusLabel: "To do", onOpen: noop },
            { id: "act.event", name: "Activation event", status: "todo", statusLabel: "To do", onOpen: noop },
            { id: "act.ttv", name: "Median time to value", status: "todo", statusLabel: "To do", onOpen: noop },
          ],
        },
      ]}
      headingId="engine-numbers-fresh"
    />
  </div>
);

/**
 * The example with a July before its August (`withMonthBefore`, July's activation at 15% and
 * logo churn at 3%), in French: under a row, how far it moved since the month before — a sign
 * and words, never a colour (« +3 points depuis juillet 2026, vers ta cible »); a number that
 * can't be found says why instead (« On ne le mesure pas »), with its neutral tag. Shown:
 * Activation and Retention; cut here for height: Acquisition, Referral, Revenue.
 */
export const SecondMonth = () => (
  <div style={{ maxWidth: 760 }}>
    <NumberList
      title={"Tes chiffres"}
      progress={
        <EngineProgress
          remaining={"Plus rien à faire"}
          counts={"11 trouvés · 3 estimés · 1 demandé · 2 introuvables"}
          groups={[
            { id: "acquisition", label: "Acquisition : trouvé, trouvé et trouvé", marks: ["found", "found", "found"] },
            { id: "activation", label: "Activation : trouvé, trouvé et estimé", marks: ["found", "found", "est"] },
            { id: "retention", label: "Retention : introuvable, trouvé et introuvable", marks: ["cant", "found", "cant"] },
            { id: "referral", label: "Referral : trouvé, trouvé et demandé", marks: ["found", "found", "asked"] },
            { id: "revenue", label: "Revenue : estimé, trouvé, estimé, trouvé et trouvé", marks: ["est", "found", "est", "found", "found"] },
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
      }
      stages={[
        {
          id: "activation",
          name: "Activation",
          holdsBack: true,
          holdsLabel: "Freine ici",
          foundLabel: "2 sur 3 trouvés",
          marks: ["found", "found", "est"],
          rows: [
            { id: "act.rate", name: "Taux d'activation", value: "18 %", status: "found", note: "+3 points depuis juillet 2026, vers ta cible", onOpen: noop },
            { id: "act.event", name: "Événement d'activation", value: "« a créé un premier projet »", valueKind: "words", status: "found", onOpen: noop },
            { id: "act.ttv", name: "Time-to-value médian", value: "1 à 3 jours", status: "est", statusLabel: "Estimé", onOpen: noop },
          ],
        },
        {
          id: "retention",
          name: "Retention",
          foundLabel: "1 sur 3 trouvé",
          marks: ["cant", "found", "cant"],
          rows: [
            { id: "ret.d30", name: "Rétention à J30", status: "cant", statusLabel: "Introuvable", note: "On ne le mesure pas", onOpen: noop },
            { id: "ret.logo-churn", name: "Churn logo mensuel", value: "2,5 %", status: "found", note: "–0,5 point depuis juillet 2026, vers ta cible", onOpen: noop },
            { id: "ret.churn-cause", name: "Cause principale de churn", status: "cant", statusLabel: "Introuvable", note: "Personne n'est d'accord sur la définition", onOpen: noop },
          ],
        },
      ]}
      headingId="engine-numbers-second"
    />
  </div>
);

/**
 * The example's revenue stage in English: two estimates (paid conversion 6–9%, gross margin
 * 70–80%) as ranges with the neutral « Estimated » tag, between found values. Revenue holds 5
 * numbers. Shown: Revenue; cut here for height: Acquisition, Activation, Retention, Referral.
 */
export const Estimated = () => (
  <div style={{ maxWidth: 760 }}>
    <NumberList
      title={"Your numbers"}
      progress={
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
      }
      stages={[
        {
          id: "revenue",
          name: "Revenue",
          foundLabel: "3 of 5 found",
          marks: ["est", "found", "est", "found", "found"],
          rows: [
            { id: "rev.paid-conversion", name: "Paid conversion", value: "6–9%", status: "est", statusLabel: "Estimated", onOpen: noop },
            { id: "rev.arpa", name: "Monthly ARPA", value: "€120", status: "found", onOpen: noop },
            { id: "rev.gross-margin", name: "Gross margin", value: "70–80%", status: "est", statusLabel: "Estimated", onOpen: noop },
            { id: "rev.expansion", name: "Monthly expansion", value: "3.1%", status: "found", onOpen: noop },
            { id: "rev.contraction", name: "Monthly contraction", value: "1%", status: "found", onOpen: noop },
          ],
        },
      ]}
      headingId="engine-numbers-estimated"
    />
  </div>
);

/**
 * The sales-assisted half of the hybrid example (`salesAssistedState()`), in English, with its
 * own catalogue: the go-live rate can't be found (why, under it), what « live » means is the
 * team's own words, the time to go-live is still to do (« Last one to go » in the progress),
 * the NRR is an estimate. Shown: Activation and Retention; cut here for height: Acquisition,
 * Referral, Revenue.
 */
export const SalesAssisted = () => (
  <div style={{ maxWidth: 760 }}>
    <NumberList
      title={"Your numbers"}
      progress={
        <EngineProgress
          remaining={"Last one to go"}
          counts={"10 found · 1 estimated · 1 asked · 2 can't be found"}
          groups={[
            { id: "acquisition", label: "Acquisition: found, found and found", marks: ["found", "found", "found"] },
            { id: "activation", label: "Activation: can't find, found and to do", marks: ["cant", "found", "todo"] },
            { id: "retention", label: "Retention: found, estimated and found", marks: ["found", "est", "found"] },
            { id: "referral", label: "Referral: found and asked", marks: ["found", "asked"] },
            { id: "revenue", label: "Revenue: found, found, found and can't find", marks: ["found", "found", "found", "cant"] },
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
      }
      stages={[
        {
          id: "activation",
          name: "Activation",
          foundLabel: "1 of 3 found",
          marks: ["cant", "found", "todo"],
          rows: [
            { id: "slg.act.go-live", name: "Go-live rate", status: "cant", statusLabel: "Can't find", note: "We don't measure it", onOpen: noop },
            { id: "slg.act.live-event", name: "What \"live\" means", value: "\"premier rapport partagé avec l'équipe du client\"", valueKind: "words", status: "found", onOpen: noop },
            { id: "slg.act.time-to-live", name: "Time to go-live", status: "todo", statusLabel: "To do", onOpen: noop },
          ],
        },
        {
          id: "retention",
          name: "Retention",
          foundLabel: "2 of 3 found",
          marks: ["found", "est", "found"],
          rows: [
            { id: "slg.ret.renewal", name: "Contract renewal rate", value: "88%", status: "found", onOpen: noop },
            { id: "slg.ret.nrr", name: "12-month NRR", value: "104–108%", status: "est", statusLabel: "Estimated", onOpen: noop },
            { id: "slg.ret.loss-cause", name: "Main reason for non-renewal", value: "\"départ du sponsor chez le client\"", valueKind: "words", status: "found", onOpen: noop },
          ],
        },
      ]}
      headingId="engine-numbers-sales"
    />
  </div>
);

/**
 * The hybrid example (`hybridState()`), sales-assisted shown under « Moteur affiché », in
 * French: reference customers asked (the dashed tag), revenue holding back — the diagnosis
 * names its win rate, under the team's target: the red edge and « Freine ici », the
 * sales-assisted margin out of reach (why, under it) — then the closed group that ends
 * sales-assisted's list in the hybrid only, « La liaison entre les deux », closed by default
 * (the link, optional, neither engine's number). Shown: Referral and Revenue; cut here for
 * height: Acquisition, Activation, Retention.
 */
export const HybridSalesSide = () => (
  <div style={{ maxWidth: 760 }}>
    <NumberList
      title={"Tes chiffres"}
      progress={
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
      }
      stages={[
        {
          id: "referral",
          name: "Referral",
          foundLabel: "1 sur 2 trouvé",
          marks: ["found", "asked"],
          rows: [
            { id: "slg.ref.referred-share", name: "Opportunités recommandées", value: "20 %", status: "found", onOpen: noop },
            { id: "slg.ref.referenceable", name: "Clients références", status: "asked", statusLabel: "Demandé", onOpen: noop },
          ],
        },
        {
          id: "revenue",
          name: "Revenue",
          holdsBack: true,
          holdsLabel: "Freine ici",
          foundLabel: "3 sur 4 trouvés",
          marks: ["found", "found", "found", "cant"],
          rows: [
            { id: "slg.rev.win-rate", name: "Taux de closing", value: "24 %", status: "found", onOpen: noop },
            { id: "slg.rev.acv", name: "ACV des nouveaux contrats", value: "24 000 €", status: "found", onOpen: noop },
            { id: "slg.rev.arpa", name: "ARPA assisté", value: "1 800 €", status: "found", onOpen: noop },
            { id: "slg.rev.gross-margin", name: "Marge brute de l'assisté", status: "cant", statusLabel: "Introuvable", note: "Ça existe, mais je n'y ai pas accès", onOpen: noop },
          ],
        },
      ]}
      extra={{
        title: "La liaison entre les deux",
        rows: [
          { id: "link.pql-handoff", name: "Opportunités venues du libre-service", value: "24 %", status: "found", onOpen: noop },
        ],
      }}
      headingId="engine-numbers-hybrid"
    />
  </div>
);
