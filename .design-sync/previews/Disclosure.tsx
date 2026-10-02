import { Disclosure, NightSurface } from "tour-de-growth";

/*
 * A native <details>. The marker is a `+` / `−` glyph inside a sunken mono
 * chip — the chip is the affordance, the glyph is the state — because this
 * product has no icon files at all (DESIGN-BRIEF.md, "Assets"). The glyph
 * lives in a ::before so a screen reader announces <details>'s own open state
 * and not a stray plus sign.
 *
 * Its main use is the score breakdown on a result, which is why `size="sm"`
 * exists: a top-level row opens onto one quieter row per pillar.
 *
 * `rule` DEFAULTS TO TRUE — a bare <Disclosure> draws the dashed line above
 * itself. Pass `rule={false}` to suppress it.
 *
 * Copy: `UI_STRINGS.breakdown` (dictionary.ts) and the quiz's own questions
 * (`content/copy-library.ts`).
 */

const intro = { font: "var(--body-sm)", color: "var(--text-muted)", margin: "0 0 var(--space-8)" } as const;
const line = { margin: "8px 0 0", font: "var(--body-sm)", color: "var(--text-muted)" } as const;

/** A top-level row, closed: `rule` draws the dashed line above, so it reads as a quiet divider. */
export const TopLevel = () => (
  <div style={{ maxWidth: 460 }}>
    <Disclosure summary="How this score is calculated">
      <p style={line}>Three questions per stage. Your answers, and what each one was worth.</p>
    </Disclosure>
  </div>
);

/*
 * Opened, which is the only way a static card can show what the panel holds
 * and what the marker looks like in its `−` state. `defaultOpen` opens a row
 * on first render and leaves it to the reader; `open` with `onOpenChange` is
 * the controlled form, for a row another control opens (pair `id` with that
 * control's `aria-controls`). Every row the product draws today starts
 * closed: the reader clicks.
 */
export const Open = () => (
  <div style={{ maxWidth: 460 }}>
    <Disclosure summary="How this score is calculated" defaultOpen>
      <p style={line}>Three questions per stage. Your answers, and what each one was worth.</p>
    </Disclosure>
  </div>
);

const pillarHead = { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, width: "100%" } as const;
const pillarName = { font: "var(--meta-md)", letterSpacing: "var(--meta-tracking)", color: "var(--text-body)" } as const;
const pillarMath = { font: "var(--meta-sm)", letterSpacing: 0, textTransform: "none", color: "var(--text-muted)", whiteSpace: "nowrap" } as const;
const question = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", columnGap: 16, rowGap: 2, padding: "var(--space-5) 0" } as const;
const qText = { gridColumn: "1 / -1", font: "var(--body-sm)", color: "var(--text-body)" } as const;
const answer = { font: "var(--body-sm)", color: "var(--text-muted)" } as const;
const pts = (zero: boolean) =>
  ({ font: "var(--meta-sm)", whiteSpace: "nowrap", alignSelf: "end", color: zero ? "var(--text-alert)" : "var(--text-muted)" }) as const;
const note = { font: "var(--meta-xs)", color: "var(--text-faint)", margin: "var(--space-8) 0 0" } as const;

const REFERRAL = [
  { q: "Does your product have a sharing or referral mechanism?", a: "Only in communication, not the product", n: 7 },
  { q: "If it exists, is it actually used by customers?", a: "A little, rarely", n: 7 },
  { q: "Do you measure a viral coefficient or equivalent?", a: "Never measured", n: 0 },
];

const RETENTION = [
  { q: "Do you track a retention rate (D7/D30 or similar)?", a: "We can pull it, but rarely look", n: 7 },
  { q: "Do you have a re-engagement mechanism (email, notification...)?", a: "Yes, and it's tuned/tested", n: 20 },
  { q: "Do you know your main cause of churn?", a: "No idea", n: 0 },
];

/**
 * Nested, the shape the result's breakdown ships (ScoreBreakdown): the
 * top-level row, its intro, then one `sm` row per pillar with `rule={false}`
 * (the pillar rows carry their own divider) whose head is the pillar's
 * arithmetic — 7 + 20 + 0 = 27/60, rounded to 9/20. Its panel lists the three
 * questions, the answer given and what it was worth; a zero is red. Two of
 * the five pillar rows are drawn: Retention open, Referral (7 + 7 + 0 =
 * 14/60 → 5/20) closed.
 */
export const Nested = () => (
  <div style={{ maxWidth: 520 }}>
    <Disclosure summary="How this score is calculated" defaultOpen>
      <p style={intro}>Three questions per stage. Your answers, and what each one was worth.</p>
      <div style={{ borderTop: "var(--border-rule)" }}>
        <Disclosure
          size="sm"
          rule={false}
          defaultOpen
          summary={
            <span style={pillarHead}>
              <span style={pillarName}>Retention</span>
              <span style={pillarMath}>27/60 → 9/20</span>
            </span>
          }
        >
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {RETENTION.map((r, i) => (
              <li key={r.q} style={{ ...question, borderTop: i > 0 ? "var(--border-rule)" : undefined }}>
                <span style={qText}>{r.q}</span>
                <span style={answer}>{r.a}</span>
                <span style={pts(r.n === 0)}>{r.n} pts</span>
              </li>
            ))}
          </ol>
        </Disclosure>
      </div>
      <div style={{ borderTop: "var(--border-rule)" }}>
        <Disclosure
          size="sm"
          rule={false}
          summary={
            <span style={pillarHead}>
              <span style={pillarName}>Referral</span>
              <span style={pillarMath}>14/60 → 5/20</span>
            </span>
          }
        >
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {REFERRAL.map((r, i) => (
              <li key={r.q} style={{ ...question, borderTop: i > 0 ? "var(--border-rule)" : undefined }}>
                <span style={qText}>{r.q}</span>
                <span style={answer}>{r.a}</span>
                <span style={pts(r.n === 0)}>{r.n} pts</span>
              </li>
            ))}
          </ol>
        </Disclosure>
      </div>
      <p style={note}>Only visible to you — your answers are stored on this device, never on the shared page.</p>
    </Disclosure>
  </div>
);

/**
 * `rule={false}` with `size="sm"`, as the game's video call sets it once hung
 * up: "Reread the CEO's message", inside a call that is already framed. Night
 * world, as in the page. Closed, as it always starts; its panel holds the
 * CEO's second-quarter call on the reference year A.
 */
export const NoRule = () => (
  <NightSurface as="div" style={{ padding: 20, maxWidth: 460 }}>
    <Disclosure size="sm" rule={false} summary="Reread the CEO's message">
      <p style={line}>{"You made me look like a liar in front of the committee. 5.8% instead of 5.6. It won't happen twice. End of June, 5.1%. And this quarter, you put the pause up front, big, and the cancel button… let's say, more discreet. The competition does it. That's not an idea. It's a request."}</p>
    </Disclosure>
  </NightSurface>
);
