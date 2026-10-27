import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EngineProgress, type EngineProgressProps } from "../EngineProgress";
import { NumberList, type NumberListProps } from "../NumberList";

/**
 * « Tes chiffres » (design system extension 07, C41, A18 T2.b): what the
 * list and its progress must say, pinned without a DOM — what remains first,
 * the one red stage, a found number's value without a tag, a row that opens
 * or is only read. What it looks like is checked on screen, by the engine's
 * specs.
 *
 * Extension 10 (A23 MKT-7a), non-vacuity (2026-10-27, one sabotage at a time,
 * restored after): the side drawn as a Tag drops 1 test; the side after the
 * name 1; an empty side span always drawn 2 (the reference, the row without a
 * side); the lead after the progress 1; the lead drawn empty 2; the side's
 * colour put on the alert token 1; the phone's rule dropped 1.
 */
const html = (node: ReactNode) => renderToStaticMarkup(node as never);

describe("EngineProgress", () => {
  const progress = (props: Partial<EngineProgressProps> = {}) =>
    html(
      createElement(EngineProgress, {
        remaining: "6 à faire",
        counts: "7 trouvés · 2 estimés",
        groups: [
          { id: "acquisition", label: "Acquisition : trouvé, à faire", marks: ["found", "todo"] },
          { id: "activation", label: "Activation : estimé", marks: ["est"] },
        ],
        label: "Tes chiffres, étape par étape",
        ...props,
      }),
    );

  it("says what remains first, then the counts, then the marks", () => {
    const markup = progress();
    expect(markup.indexOf("6 à faire")).toBeLessThan(markup.indexOf("7 trouvés"));
    expect(markup.indexOf("7 trouvés")).toBeLessThan(markup.indexOf("<ol"));
  });

  it("draws one mark per number, grouped by stage, each group named in words; the marks themselves are silent", () => {
    const markup = progress();
    expect(markup).toMatch(/<ol[^>]*aria-label="Tes chiffres, étape par étape"/);
    expect(markup).toMatch(/<li[^>]*aria-label="Acquisition : trouvé, à faire"/);
    expect(markup.match(/data-mark=/g)).toHaveLength(3);
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(3);
  });

  it("is never a percentage bar", () => {
    expect(progress()).not.toMatch(/%|role="progressbar"|<progress/);
  });

  it("in a number's header (sm): the sentence only, no marks", () => {
    const markup = progress({ size: "sm" });
    expect(markup).toContain("6 à faire");
    expect(markup).not.toContain("<ol");
  });
});

describe("NumberList", () => {
  const list = (props: Partial<NumberListProps> = {}) =>
    html(
      createElement(NumberList, {
        title: "Tes chiffres",
        stages: [
          {
            id: "acquisition",
            name: "Acquisition",
            foundLabel: "1 sur 2 trouvé",
            marks: ["found", "todo"],
            rows: [
              { id: "a", name: "Taux d'inscription", value: "3,2 %", status: "found", onOpen: () => {}, "data-testid": "row-a" },
              { id: "b", name: "CAC", status: "todo", statusLabel: "À faire", onOpen: () => {}, "data-testid": "row-b" },
            ],
          },
          {
            id: "activation",
            name: "Activation",
            holdsBack: true,
            holdsLabel: "Freine ici",
            foundLabel: "0 sur 1 trouvé",
            marks: ["est"],
            rows: [{ id: "c", name: "Taux d'activation", value: "15–25 %", status: "est", statusLabel: "Estimé", note: "NOTE", "data-testid": "row-c" }],
          },
        ],
        "data-testid": "list",
        ...props,
      }),
    );

  it("shows every stage, in the order given, each a section named by its heading", () => {
    const markup = list();
    expect(markup.indexOf("Acquisition")).toBeLessThan(markup.indexOf("Activation"));
    expect(markup.match(/<section[^>]*aria-labelledby="engine-numbers-/g)).toHaveLength(2);
  });

  it("marks only the stage a target names: « Freine ici » and the diagnosis edge, once", () => {
    const markup = list();
    expect(markup.match(/Freine ici/g)).toHaveLength(1);
    expect(markup.match(/data-holds="true"/g)).toHaveLength(1);
  });

  it("a found number says its value and no tag: the value is the status", () => {
    const markup = list();
    const row = markup.slice(markup.indexOf('data-testid="row-a"'), markup.indexOf('data-testid="row-b"'));
    expect(row).toContain("3,2 %");
    expect(row).not.toMatch(/Trouvé|Found/);
  });

  it("a row with somewhere to go is one button; a row only read is not", () => {
    const markup = list();
    expect(markup).toMatch(/<button type="button"[^>]*data-testid="row-a"/);
    expect(markup).toMatch(/<div[^>]*data-testid="row-c"/);
    expect(markup).toContain('data-testid="row-c-note"');
  });

  it("an extra group (the hybrid's link) is closed at the end", () => {
    const markup = list({ extra: { title: "La liaison", rows: [{ id: "l", name: "Liaison", status: "todo", "data-testid": "row-l" }] } });
    expect(markup.indexOf("La liaison")).toBeGreaterThan(markup.indexOf("Taux d'activation"));
    expect(markup).not.toMatch(/<details[^>]*\sopen=""/);
  });
});

/**
 * Extension 10 (A23 MKT-7a) adds `row.side` and `lead`. Without them the list draws exactly what it drew: these two
 * renders were taken on origin/main (2dbf9d2) before they existed, from the builder below, and the markup must still
 * match them character for character. A reference that no longer matches is an alarm, not a snapshot to update.
 */
const BEFORE_SIDE_AND_LEAD = {
  plain: "<section class=\"_root_96093d\" aria-labelledby=\"engine-numbers\" data-testid=\"list\"><h2 id=\"engine-numbers\" class=\"_title_96093d\">Tes chiffres</h2><section class=\"_stage_96093d\" aria-labelledby=\"engine-numbers-acquisition\" data-testid=\"list-acquisition\"><div class=\"_head_96093d\"><h3 id=\"engine-numbers-acquisition\" class=\"_stageName_96093d\">Acquisition</h3><div class=\"_headProgress_96093d\"><div class=\"_root_8ffe07 _md_8ffe07\"><ol class=\"_groups_8ffe07\"><li class=\"_group_8ffe07\" aria-label=\"1 sur 2 trouvé\"><span class=\"_mark_8ffe07 _found_8ffe07\" aria-hidden=\"true\" data-mark=\"found\"></span><span class=\"_mark_8ffe07 _todo_8ffe07\" aria-hidden=\"true\" data-mark=\"todo\"></span></li></ol></div><span class=\"_found_96093d\">1 sur 2 trouvé</span></div></div><ul class=\"_rows_96093d\"><li class=\"_item_96093d\"><button type=\"button\" id=\"row-el-a\" class=\"_row_96093d\" data-testid=\"row-a\" data-status=\"found\"><span class=\"_name_96093d\">Taux d&#x27;inscription</span><span class=\"_value_96093d\" data-kind=\"number\" data-testid=\"row-a-value\">3,2 %</span></button></li><li class=\"_item_96093d\"><button type=\"button\" class=\"_row_96093d\" data-testid=\"row-b\" data-status=\"todo\"><span class=\"_name_96093d\">CAC</span><span class=\"_tag_339a88 _outline_339a88\">À faire</span></button></li></ul></section><section class=\"_stage_96093d _holds_96093d\" aria-labelledby=\"engine-numbers-activation\" data-testid=\"list-activation\" data-holds=\"true\"><div class=\"_head_96093d\"><h3 id=\"engine-numbers-activation\" class=\"_stageName_96093d\">Activation</h3><span class=\"_tag_339a88 _alert_339a88\">Freine ici</span><div class=\"_headProgress_96093d\"><div class=\"_root_8ffe07 _md_8ffe07\"><ol class=\"_groups_8ffe07\"><li class=\"_group_8ffe07\" aria-label=\"0 sur 2 trouvés\"><span class=\"_mark_8ffe07 _est_8ffe07\" aria-hidden=\"true\" data-mark=\"est\"></span><span class=\"_mark_8ffe07 _asked_8ffe07\" aria-hidden=\"true\" data-mark=\"asked\"></span></li></ol></div><span class=\"_found_96093d\">0 sur 2 trouvés</span></div></div><ul class=\"_rows_96093d\"><li class=\"_item_96093d\"><div class=\"_row_96093d\" data-testid=\"row-c\" data-status=\"est\"><span class=\"_name_96093d\">Taux d&#x27;activation</span><span class=\"_value_96093d\" data-kind=\"number\" data-testid=\"row-c-value\">15–25 %</span><span class=\"_tag_339a88 _neutral_339a88\">Estimé</span><span class=\"_note_96093d\" data-testid=\"row-c-note\">NOTE</span></div></li><li class=\"_item_96093d\"><button type=\"button\" class=\"_row_96093d\" data-testid=\"row-d\" data-status=\"asked\"><span class=\"_name_96093d\">Événement d&#x27;activation</span><span class=\"_value_96093d\" data-kind=\"words\" data-testid=\"row-d-value\">Premier projet créé</span><span class=\"_tag_339a88 _outline_339a88\">Demandé</span></button></li></ul></section></section>",
  full: "<section class=\"_root_96093d\" aria-labelledby=\"numbers-x\" data-testid=\"list\"><h2 id=\"numbers-x\" class=\"_title_96093d\">Tes chiffres</h2><div class=\"_root_8ffe07 _md_8ffe07\"><p class=\"_text_8ffe07\"><strong class=\"_remaining_8ffe07\">3 à faire</strong><span class=\"_counts_8ffe07\">1 trouvé · 1 estimé</span></p><ol class=\"_groups_8ffe07\" aria-label=\"Tes chiffres, étape par étape\"><li class=\"_group_8ffe07\" aria-label=\"Acquisition : trouvé, à faire\"><span class=\"_mark_8ffe07 _found_8ffe07\" aria-hidden=\"true\" data-mark=\"found\"></span><span class=\"_mark_8ffe07 _todo_8ffe07\" aria-hidden=\"true\" data-mark=\"todo\"></span></li><li class=\"_group_8ffe07\" aria-label=\"Activation : estimé, demandé\"><span class=\"_mark_8ffe07 _est_8ffe07\" aria-hidden=\"true\" data-mark=\"est\"></span><span class=\"_mark_8ffe07 _asked_8ffe07\" aria-hidden=\"true\" data-mark=\"asked\"></span></li></ol></div><section class=\"_stage_96093d\" aria-labelledby=\"numbers-x-acquisition\" data-testid=\"list-acquisition\"><div class=\"_head_96093d\"><h3 id=\"numbers-x-acquisition\" class=\"_stageName_96093d\">Acquisition</h3><div class=\"_headProgress_96093d\"><div class=\"_root_8ffe07 _md_8ffe07\"><ol class=\"_groups_8ffe07\"><li class=\"_group_8ffe07\" aria-label=\"1 sur 2 trouvé\"><span class=\"_mark_8ffe07 _found_8ffe07\" aria-hidden=\"true\" data-mark=\"found\"></span><span class=\"_mark_8ffe07 _todo_8ffe07\" aria-hidden=\"true\" data-mark=\"todo\"></span></li></ol></div><span class=\"_found_96093d\">1 sur 2 trouvé</span></div></div><ul class=\"_rows_96093d\"><li class=\"_item_96093d\"><button type=\"button\" id=\"row-el-a\" class=\"_row_96093d\" data-testid=\"row-a\" data-status=\"found\"><span class=\"_name_96093d\">Taux d&#x27;inscription</span><span class=\"_value_96093d\" data-kind=\"number\" data-testid=\"row-a-value\">3,2 %</span></button></li><li class=\"_item_96093d\"><button type=\"button\" class=\"_row_96093d\" data-testid=\"row-b\" data-status=\"todo\"><span class=\"_name_96093d\">CAC</span><span class=\"_tag_339a88 _outline_339a88\">À faire</span></button></li></ul></section><section class=\"_stage_96093d _holds_96093d\" aria-labelledby=\"numbers-x-activation\" data-testid=\"list-activation\" data-holds=\"true\"><div class=\"_head_96093d\"><h3 id=\"numbers-x-activation\" class=\"_stageName_96093d\">Activation</h3><span class=\"_tag_339a88 _alert_339a88\">Freine ici</span><div class=\"_headProgress_96093d\"><div class=\"_root_8ffe07 _md_8ffe07\"><ol class=\"_groups_8ffe07\"><li class=\"_group_8ffe07\" aria-label=\"0 sur 2 trouvés\"><span class=\"_mark_8ffe07 _est_8ffe07\" aria-hidden=\"true\" data-mark=\"est\"></span><span class=\"_mark_8ffe07 _asked_8ffe07\" aria-hidden=\"true\" data-mark=\"asked\"></span></li></ol></div><span class=\"_found_96093d\">0 sur 2 trouvés</span></div></div><ul class=\"_rows_96093d\"><li class=\"_item_96093d\"><div class=\"_row_96093d\" data-testid=\"row-c\" data-status=\"est\"><span class=\"_name_96093d\">Taux d&#x27;activation</span><span class=\"_value_96093d\" data-kind=\"number\" data-testid=\"row-c-value\">15–25 %</span><span class=\"_tag_339a88 _neutral_339a88\">Estimé</span><span class=\"_note_96093d\" data-testid=\"row-c-note\">NOTE</span></div></li><li class=\"_item_96093d\"><button type=\"button\" class=\"_row_96093d\" data-testid=\"row-d\" data-status=\"asked\"><span class=\"_name_96093d\">Événement d&#x27;activation</span><span class=\"_value_96093d\" data-kind=\"words\" data-testid=\"row-d-value\">Premier projet créé</span><span class=\"_tag_339a88 _outline_339a88\">Demandé</span></button></li></ul></section><details class=\"_wrap_8f074e _md_8f074e _ruled_8f074e\" data-testid=\"extra\"><summary class=\"_summary_8f074e\"><span class=\"_summaryText_8f074e\">La liaison</span><span class=\"_marker_8f074e\" aria-hidden=\"true\"></span></summary><div class=\"_content_8f074e\"><ul class=\"_rows_96093d\"><li class=\"_item_96093d\"><div class=\"_row_96093d\" data-testid=\"row-l\" data-status=\"todo\"><span class=\"_name_96093d\">Liaison</span><span class=\"_tag_339a88 _outline_339a88\">À faire</span></div></li></ul></div></details></section>",
} as const;

/** The builder those references were taken from: statuses of every kind, a note, an id, a words value, the progress and the extra group. */
const referenceList = (props: Partial<NumberListProps> = {}) =>
  html(
    createElement(NumberList, {
      title: "Tes chiffres",
      stages: [
        {
          id: "acquisition",
          name: "Acquisition",
          foundLabel: "1 sur 2 trouvé",
          marks: ["found", "todo"],
          rows: [
            { id: "a", name: "Taux d'inscription", value: "3,2 %", status: "found", onOpen: () => {}, elementId: "row-el-a", "data-testid": "row-a" },
            { id: "b", name: "CAC", status: "todo", statusLabel: "À faire", onOpen: () => {}, "data-testid": "row-b" },
          ],
        },
        {
          id: "activation",
          name: "Activation",
          holdsBack: true,
          holdsLabel: "Freine ici",
          foundLabel: "0 sur 2 trouvés",
          marks: ["est", "asked"],
          rows: [
            { id: "c", name: "Taux d'activation", value: "15–25 %", status: "est", statusLabel: "Estimé", note: "NOTE", "data-testid": "row-c" },
            { id: "d", name: "Événement d'activation", value: "Premier projet créé", valueKind: "words", status: "asked", statusLabel: "Demandé", onOpen: () => {}, "data-testid": "row-d" },
          ],
        },
      ],
      "data-testid": "list",
      ...props,
    }),
  );
const fullProps: Partial<NumberListProps> = {
  progress: createElement(EngineProgress, {
    remaining: "3 à faire",
    counts: "1 trouvé · 1 estimé",
    groups: [
      { id: "acquisition", label: "Acquisition : trouvé, à faire", marks: ["found", "todo"] },
      { id: "activation", label: "Activation : estimé, demandé", marks: ["est", "asked"] },
    ],
    label: "Tes chiffres, étape par étape",
  }),
  extra: { title: "La liaison", rows: [{ id: "l", name: "Liaison", status: "todo", statusLabel: "À faire", "data-testid": "row-l" }], "data-testid": "extra" },
  headingId: "numbers-x",
};
const listCss = readFileSync(join(__dirname, "..", "NumberList.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("NumberList, extension 10 (a marketplace's sides)", () => {
  /** The stages of a marketplace's list: both sides mixed in a stage, each row saying its own. */
  const sided = (props: Partial<NumberListProps> = {}) =>
    html(
      createElement(NumberList, {
        title: "Tes chiffres",
        stages: [
          {
            id: "acquisition",
            name: "Acquisition",
            foundLabel: "2 sur 3 trouvés",
            marks: ["found", "found", "todo"],
            rows: [
              { id: "a", side: "Acheteurs", name: "Taux d'inscription", value: "3,2 %", status: "found", onOpen: () => {}, "data-testid": "row-a" },
              { id: "b", side: "Vendeurs", name: "Taux d'inscription", value: "4 %", status: "found", onOpen: () => {}, "data-testid": "row-b" },
              { id: "c", side: "Liquidité", name: "Taux de service", status: "todo", statusLabel: "À faire", onOpen: () => {}, "data-testid": "row-c" },
            ],
          },
          {
            id: "revenue",
            name: "Revenue",
            holdsBack: true,
            holdsLabel: "Freine ici",
            foundLabel: "0 sur 1 trouvé",
            marks: ["est"],
            rows: [{ id: "d", name: "Prix de l'abonnement", status: "est", statusLabel: "Estimé", "data-testid": "row-d" }],
          },
        ],
        "data-testid": "list",
        ...props,
      }),
    );

  it("without `side` and `lead` the markup is exactly what it was before them", () => {
    expect(referenceList()).toBe(BEFORE_SIDE_AND_LEAD.plain);
    expect(referenceList(fullProps)).toBe(BEFORE_SIDE_AND_LEAD.full);
    // Said as props that are off, they change nothing either.
    expect(referenceList({ lead: undefined })).toBe(BEFORE_SIDE_AND_LEAD.plain);
  });

  it("a row says its side first, in plain words — before its name, never in a Tag", () => {
    const markup = sided();
    const row = markup.slice(markup.indexOf('data-testid="row-a"'), markup.indexOf('data-testid="row-b"'));
    expect(row).toMatch(/<span class="[^"]*_side_[^"]*">Acheteurs<\/span><span class="[^"]*_name_/);
    expect(row.indexOf("Acheteurs")).toBeLessThan(row.indexOf("Taux d&#x27;inscription"));
    expect(row).not.toMatch(/_tag_/);
    // A row without a side draws no empty column, and a row that is only read can carry one too.
    const alone = markup.slice(markup.indexOf('data-testid="row-d"'));
    expect(alone).not.toContain("_side_");
    expect(sided({ stages: [{ id: "s", name: "S", foundLabel: "0", marks: [], rows: [{ id: "r", side: "Vendeurs", name: "N", status: "na", "data-testid": "row-r" }] }] })).toMatch(/<div[^>]*data-testid="row-r"[^>]*><span class="[^"]*_side_[^"]*">Vendeurs<\/span>/);
  });

  it("the sides mix in one list by stage: the rows keep the order given, in one list, and only one stage is signalled", () => {
    const markup = sided();
    expect(markup.indexOf("Acheteurs")).toBeLessThan(markup.indexOf("Vendeurs"));
    expect(markup.indexOf("Vendeurs")).toBeLessThan(markup.indexOf("Liquidité"));
    expect(markup.match(/<ul/g)).toHaveLength(2);
    expect(markup.match(/data-holds="true"/g)).toHaveLength(1);
    expect(markup.match(/Freine ici/g)).toHaveLength(1);
  });

  it("the lead is one line under the title, before the progress — and only when given", () => {
    const markup = sided({ lead: "LEAD", progress: createElement("p", null, "PROGRESS") });
    expect(markup).toMatch(/<\/h2><p class="[^"]*_lead_[^"]*">LEAD<\/p><p>PROGRESS<\/p>/);
    expect(sided()).not.toContain("_lead_");
  });

  it("the side is plain words in a column, muted and without colour; on a phone it takes its own line", () => {
    expect(listCss).toMatch(/\.side \{[^}]*flex: 0 0 var\(--market-side-tag-width\)[^}]*text-transform: uppercase[^}]*color: var\(--text-muted\)/);
    expect(listCss).toMatch(/@media \(max-width: 760px\)\s*\{\s*\.side \{\s*flex-basis: 100%/);
    expect(listCss).toMatch(/\.lead \{[^}]*font: var\(--body-sm\)[^}]*color: var\(--text-muted\)/);
    // No colour for a side: neither red nor a second ink.
    const sideRules = [...listCss.matchAll(/\.(?:side|lead) \{[^}]*\}/g)].map((m) => m[0]).join("\n");
    expect(sideRules).not.toMatch(/alert|paint-red|highlight|accent|--viz-/);
  });
});
