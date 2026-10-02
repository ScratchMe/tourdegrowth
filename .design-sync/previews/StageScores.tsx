import * as React from "react";
import { GlossaryTerm, StageScore, StageScores, StampedPillar } from "tour-de-growth";

/*
 * The five stage scores as one score sheet (design system extension 05,
 * design/ds-extension-05-return/): an ordered list in AARRR order, ruled like
 * DataTable — one solid rule on top, a dashed hairline between rows, no box.
 * It is the route profile's table, right under StageProfile, one column at
 * every width. It replaced PillarChip, five boxes that read as secondary
 * buttons (A15.19).
 *
 * Which rows are red follows the bottleneck's sharpness, as the profile does
 * (C34, Antoine, 2026-10-02): one row on `clear`, the tied group on `shared`,
 * none on `level` — resolveBottleneck on each board below. Pillar names stay
 * in English on French screens.
 *
 * Labels: dictionary.ts (`result.stageScoresLabel`, `glossary`).
 */

const LABELS = {
  closeLabel: "Close",
  labelTemplate: "Definition: {term}",
  moreLabel: "Learn more →",
};

type StageId = "acquisition" | "activation" | "retention" | "referral" | "revenue";
type Row = { id: StageId; label: string; score: number };
const row = (id: StageId, label: string, score: number): Row => ({ id, label, score });

/** `/r/sample`'s board, 18 · 12 · 8 · 16 · 20 (lib/submissions/sample.ts): a clear bottleneck, Retention. */
const SAMPLE = [
  row("acquisition", "Acquisition", 18),
  row("activation", "Activation", 12),
  row("retention", "Retention", 8),
  row("referral", "Referral", 16),
  row("revenue", "Revenue", 20),
];

/** As ResultView draws it: every row keeps its « ? »; in a roast, `stamped` names the stage whose row is the stamp. */
function Sheet({
  rows,
  alert,
  stamped,
  label = "Score per stage, out of 20",
}: {
  rows: Row[];
  alert: string[];
  stamped?: string;
  label?: string;
}) {
  const [open, setOpen] = React.useState("");
  return (
    <StageScores label={label}>
      {rows.map((r) =>
        r.id === stamped ? (
          <StampedPillar key={r.id} pillar={r.label} score={r.score} suffix="dead last" />
        ) : (
          <StageScore key={r.id} stage={r.label} score={r.score} tone={alert.includes(r.id) ? "alert" : "neutral"}>
            <GlossaryTerm
              id={r.id}
              locale="en"
              openId={open}
              onOpenChange={(id) => setOpen(id ?? "")}
              tone={alert.includes(r.id) ? "alert" : "muted"}
              {...LABELS}
            />
          </StageScore>
        ),
      )}
    </StageScores>
  );
}

/** The result, a clear bottleneck: one row red — the wash, the solid rule, the meter in the text red. */
export const Result = () => (
  <div style={{ maxWidth: 420 }}>
    <Sheet rows={SAMPLE} alert={["retention"]} />
  </div>
);

/**
 * A shared bottleneck, 20 · 11 · 9 · 16 · 16: Retention at 9 and Activation at
 * 11 sit within CLEAR_GAP (4) of each other, so the profile flags both and
 * the sheet reds both (C34).
 */
export const Shared = () => (
  <div style={{ maxWidth: 420 }}>
    <Sheet
      rows={[
        row("acquisition", "Acquisition", 20),
        row("activation", "Activation", 11),
        row("retention", "Retention", 9),
        row("referral", "Referral", 16),
        row("revenue", "Revenue", 16),
      ]}
      alert={["activation", "retention"]}
    />
  </div>
);

/** A level board, 16 · 20 · 16 · 20 · 16: every stage strong, nothing is behind, no row is red. */
export const Level = () => (
  <div style={{ maxWidth: 420 }}>
    <Sheet
      rows={[
        row("acquisition", "Acquisition", 16),
        row("activation", "Activation", 20),
        row("retention", "Retention", 16),
        row("referral", "Referral", 20),
        row("revenue", "Revenue", 16),
      ]}
      alert={[]}
    />
  </div>
);

/**
 * Roast, 20 · 13 · 9 · 16 · 16 (a board the quiz can produce; resolveBottleneck:
 * `clear`, Retention): the weakest stage leaves the sheet as StampedPillar, in
 * its own row; the second-lowest takes the red row — emphasis, not a
 * diagnosis. Every other row keeps its « ? », as on the calm result.
 */
export const Roast = () => (
  <div style={{ maxWidth: 420 }}>
    <Sheet
      rows={[
        row("acquisition", "Acquisition", 20),
        row("activation", "Activation", 13),
        row("retention", "Retention", 9),
        row("referral", "Referral", 16),
        row("revenue", "Revenue", 16),
      ]}
      alert={["activation"]}
      stamped="retention"
    />
  </div>
);

/**
 * The landing's preview: `size="sm"` (44px rows at every width), no « ? » —
 * the stage NAME is the link to its glossary page, underlined in its row's
 * ink, with an accessible name that says where it goes
 * (`result.stageLinkLabelTemplate`). French here: the names stay English.
 */
export const Landing = () => (
  <div style={{ maxWidth: 380 }}>
    <StageScores size="sm" label="Score par étape, sur 20">
      {SAMPLE.map((r) => (
        <StageScore
          key={r.id}
          stage={r.label}
          score={r.score}
          tone={r.id === "retention" ? "alert" : "neutral"}
          href={`/fr/glossary/${r.id}`}
          linkLabel={`${r.label} — définition`}
        />
      ))}
    </StageScores>
  </div>
);
