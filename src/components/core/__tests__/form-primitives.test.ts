/* eslint-disable react/no-children-prop -- Field's children is a render prop, and FieldRow's a pair: createElement's rest arguments type neither, so the tests pass them as the prop the components declare. */
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../Checkbox";
import { Choices } from "../Choices";
import { DateField } from "../DateField";
import { Field } from "../Field";
import { FieldRow } from "../FieldRow";
import { FormSummary } from "../FormSummary";
import { NumberField } from "../NumberField";
import { Segmented } from "../Segmented";
import { Select } from "../Select";
import { TextArea } from "../TextArea";
import { TextField } from "../TextField";
import summaryStyles from "../FormSummary.module.css";

/**
 * The markup rules of the form primitives — design system extension 04
 * (design/ds-extension-04-return/). No DOM here (environment "node"):
 * `renderToStaticMarkup` turns a component into a string, CSS Modules
 * included, which is enough to pin the element tree the accessibility of a
 * form rests on — a visible label wired to its control, the message read
 * before the hint, native elements underneath, nothing pre-selected, never a
 * `type="number"`. What the fields look like is checked on screen.
 */

const html = (element: ReactElement) => renderToStaticMarkup(element);
const noop = () => {};
/** The value of `attr` on the first element matching `tag` whose markup contains `marker`. */
const attr = (markup: string, tag: string, name: string) => {
  const m = new RegExp(`<${tag}\\b[^>]*\\s${name}="([^"]*)"`).exec(markup);
  return m?.[1];
};

describe("Field", () => {
  it("gives the control a visible label pointing at it", () => {
    const out = html(createElement(Field, { label: "Month for flows", id: "m", children: createElement("input", { id: "m" }) }));
    expect(out).toMatch(/<label id="m-label" for="m"[^>]*>Month for flows<\/label>/);
  });

  it("reads the message before the hint, then the count", () => {
    let seen: string | undefined;
    html(
      createElement(Field, {
        label: "Signed up",
        id: "s",
        hint: "In July 2026.",
        error: "That isn't a readable number.",
        counter: { count: 50, max: 60 },
        children: (p: { describedBy: string | undefined }) => {
          seen = p.describedBy;
          return null;
        },
      }),
    );
    expect(seen).toBe("s-message s-hint s-count");
  });

  it("shows the invalid message when both are given, and the optional word after the label", () => {
    const out = html(
      createElement(Field, {
        label: "Your definition",
        optional: "facultatif",
        id: "d",
        error: "Too long.",
        missing: "Still to fill in.",
        children: null,
      }),
    );
    expect(out).toContain("Too long.");
    expect(out).not.toContain("Still to fill in.");
    expect(out).toMatch(/Your definition<span[^>]*>facultatif<\/span><\/label>/);
  });

  it("makes a group a fieldset whose legend is the label, described as a whole", () => {
    const out = html(createElement(Field, { group: true, label: "Activation window", id: "w", hint: "From sign-up.", children: null }));
    expect(out).toMatch(/^<fieldset[^>]*aria-describedby="w-hint"/);
    expect(out).toMatch(/<legend[^>]*>.*Activation window.*<\/legend>/);
  });
});

describe("TextField", () => {
  it("hides the soft-limit count until 80% of the limit, and never blocks typing", () => {
    const quiet = html(createElement(TextField, { label: "Name", value: "x".repeat(47), onChange: noop, maxLength: 60, id: "n" }));
    expect(quiet).not.toContain("47/60");
    expect(quiet).not.toMatch(/maxlength/i);
    const shown = html(createElement(TextField, { label: "Name", value: "x".repeat(48), onChange: noop, maxLength: 60, id: "n" }));
    expect(shown).toContain("48/60");
  });

  it("marks the field invalid past its limit, the count read with it", () => {
    const out = html(createElement(TextField, { label: "Name", value: "x".repeat(61), onChange: noop, maxLength: 60, id: "n" }));
    expect(attr(out, "input", "aria-invalid")).toBe("true");
    expect(attr(out, "input", "aria-describedby")).toBe("n-count");
  });

  it("says why a disabled field is disabled, in place of the hint", () => {
    const out = html(
      createElement(TextField, {
        label: "Name",
        value: "",
        onChange: noop,
        disabled: true,
        disabledReason: "Only for decks under 20 slides.",
        hint: "Shown on the slides.",
      }),
    );
    expect(out).toContain("Only for decks under 20 slides.");
    expect(out).not.toContain("Shown on the slides.");
  });
});

describe("NumberField", () => {
  const number = (props: Partial<Parameters<typeof NumberField>[0]>) =>
    html(createElement(NumberField, { label: "Visitors", value: null, onChange: noop, locale: "fr", parseError: "Illisible.", id: "v", ...props }));

  it("is a text input with an input mode, never type=number (which empties « 26 000 »)", () => {
    const out = number({ value: 26000 });
    expect(out).not.toContain('type="number"');
    expect(attr(out, "input", "type")).toBe("text");
    expect(attr(out, "input", "inputMode") ?? attr(out, "input", "inputmode")).toBe("decimal");
    expect(attr(number({ integer: true }), "input", "inputMode") ?? attr(number({ integer: true }), "input", "inputmode")).toBe("numeric");
  });

  it("shows a stored value grouped the way the reader writes it, and null as an empty box", () => {
    expect(attr(number({ value: 26000 }), "input", "value")).toBe("26 000");
    expect(attr(number({ value: 26000, locale: "en" }), "input", "value")).toBe("26,000");
    expect(attr(number({ value: null }), "input", "value")).toBe("");
    expect(attr(number({ value: 0 }), "input", "value")).toBe("0");
  });

  it("keeps the unit inside the box, hidden from screen readers, who hear its word instead", () => {
    const out = number({ value: 26000, suffix: "€", unitName: "euros" });
    expect(out).toMatch(/<span[^>]*aria-hidden="true"[^>]*>€<\/span>/);
    expect(out).toMatch(/<span id="v-unit" class="tdg-visually-hidden">euros<\/span>/);
    expect(attr(out, "input", "aria-describedby")).toBe("v-unit");
  });

  it("carries a caller's rule as its message, and says nothing while nothing is wrong", () => {
    expect(number({ value: 12 })).not.toContain("Illisible.");
    const out = number({ value: 12, error: "Below the minimum." });
    expect(out).toContain("Below the minimum.");
    expect(attr(out, "input", "aria-invalid")).toBe("true");
  });
});

describe("Select", () => {
  const options = [
    { label: "The tools this usually comes from", options: [{ value: "amplitude", label: "Amplitude" }] },
    { value: "sheet", label: "A spreadsheet" },
  ];

  it("keeps « not chosen yet » a choosable value, and pre-selects nothing", () => {
    const out = html(createElement(Select, { label: "Where does it come from?", value: "", onChange: noop, options, placeholder: "Choose…" }));
    expect(out).toMatch(/<select[^>]*><option value="" selected="">Choose…<\/option>/);
    expect(out.match(/selected=""/g)).toHaveLength(1);
  });

  it("is a native select with its groups as optgroups", () => {
    const out = html(createElement(Select, { label: "Source", value: "amplitude", onChange: noop, options }));
    expect(out).toMatch(/<optgroup label="The tools this usually comes from"><option value="amplitude" selected="">/);
    expect(out).not.toMatch(/role="listbox"/);
  });
});

describe("DateField", () => {
  it("draws a day as three native selects, each with its visible label — never a native date input", () => {
    const out = html(
      createElement(DateField, {
        precision: "day",
        label: "Début de la mission",
        id: "d",
        value: { day: "29", month: "09", year: "" },
        onChange: noop,
        monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        years: [2025, 2026, 2027],
        partLabels: { day: "Jour", month: "Mois", year: "Année" },
      }),
    );
    expect(out).not.toMatch(/type="date"|type="month"/);
    expect(out.match(/<select/g)).toHaveLength(3);
    for (const [key, text] of [
      ["day", "Jour"],
      ["month", "Mois"],
      ["year", "Année"],
    ]) {
      expect(out).toMatch(new RegExp(`<label[^>]*for="d-${key}"[^>]*>${text}</label>`));
    }
    expect(out).toMatch(/<option value="09" selected="">septembre<\/option>/);
  });

  it("draws a month as one select of the months the caller offers", () => {
    const out = html(
      createElement(DateField, {
        precision: "month",
        label: "Month for flows",
        value: "2026-08",
        onChange: noop,
        months: [
          { value: "2026-08", label: "August 2026" },
          { value: "2026-07", label: "July 2026" },
        ],
      }),
    );
    expect(out.match(/<select/g)).toHaveLength(1);
    expect(out).toMatch(/<option value="2026-08" selected="">August 2026<\/option>/);
  });
});

describe("Choices", () => {
  const status = [
    { value: "have", label: "I have it" },
    { value: "estimate", label: "I can estimate it" },
    { value: "b2b", label: "B2B with a sales team", disabled: true, disabledLead: "Coming soon", disabledNote: "their funnel has a different shape." },
  ];

  it("is a real radio group under its visible question, with nothing chosen for the person", () => {
    const out = html(createElement(Choices, { legend: "Where are you with this number?", options: status, onChange: noop, name: "st" }));
    expect(out).toMatch(/^<fieldset/);
    expect(out).toMatch(/<legend[^>]*>.*Where are you with this number\?.*<\/legend>/);
    expect(out.match(/type="radio"/g)).toHaveLength(3);
    expect(out.match(/name="st"/g)).toHaveLength(3);
    expect(out).not.toContain("checked");
  });

  it("gives a disabled option its reason, read with it", () => {
    const out = html(createElement(Choices, { legend: "Your model", options: status, onChange: noop, id: "m" }));
    const input = /<input id="m-b2b"[^>]*>/.exec(out)?.[0] ?? "";
    expect(input).toContain('aria-describedby="m-b2b-note"');
    expect(input).toContain('disabled=""');
    expect(out).toMatch(/<span id="m-b2b-note"[^>]*><span[^>]*>Coming soon — <\/span>their funnel has a different shape\.<\/span>/);
  });
});

describe("Checkbox", () => {
  it("is a native checkbox inside its sentence, the whole row the target", () => {
    const out = html(createElement(Checkbox, { label: "Compare with that Tour", checked: false, onChange: noop, id: "c", hint: "Side by side." }));
    expect(out).toMatch(/^<label for="c"[^>]*><input id="c" type="checkbox"/);
    expect(attr(out, "input", "aria-describedby")).toBe("c-hint");
  });
});

describe("FieldRow", () => {
  it("groups the pair and reads the pair's own message with it", () => {
    const field = (label: string) => createElement(TextField, { key: label, label, value: "", onChange: noop });
    const out = html(createElement(FieldRow, { joiner: "à", error: "Le minimum dépasse le maximum.", children: [field("Bas"), field("Haut")] }));
    const id = attr(out, "div", "aria-describedby");
    expect(out).toMatch(/^<div[^>]*role="group"/);
    expect(out).toContain(`<p id="${id}"`);
    expect(out).toContain("Le minimum dépasse le maximum.");
    expect(out).toMatch(/>à<\/span>/);
  });

  it("keeps the second field in its column without a joiner (« At least » / « At most »)", () => {
    // The layout places the pair by position (1st and 3rd child): an absent
    // joiner would move the second field into the joiner's narrow column.
    const field = (label: string) => createElement(TextField, { key: label, label, value: "", onChange: noop });
    const out = html(createElement(FieldRow, { children: [field("Au moins"), field("Au plus")] }));
    const grid = /<div class="[^"]*"><div[^>]*>.*?<\/div><span class="([^"]*)"><\/span><div/.exec(out);
    expect(grid?.[1]).toBeTruthy();
  });
});

describe("NumberField's unit", () => {
  it("is the box's last child, so it keeps its inset from the edge; the word for screen readers sits outside", () => {
    // Measured on the engine's target (2026-09-30): with the hidden word as
    // the box's last child, `.affix:last-child` lost its match and the « % »
    // sat 3px from the edge instead of 14.
    const out = html(
      createElement(NumberField, { label: "Target", value: 20, onChange: noop, locale: "en", suffix: "%", unitName: "percent", parseError: "!" }),
    );
    expect(out).toMatch(/aria-hidden="true">%<\/span><\/div><span id="[^"]*-unit" class="tdg-visually-hidden">percent<\/span>/);
  });
});

describe("test ids", () => {
  it("land on the native control, where a test clicks and reads", () => {
    const testId = { "data-testid": "x" };
    expect(html(createElement(TextField, { label: "L", value: "", onChange: noop, ...testId }))).toMatch(/<input[^>]*data-testid="x"/);
    expect(html(createElement(NumberField, { label: "L", value: null, onChange: noop, locale: "en", parseError: "!", ...testId }))).toMatch(
      /<input[^>]*data-testid="x"/,
    );
    expect(html(createElement(Select, { label: "L", value: "", onChange: noop, options: [], placeholder: "…", ...testId }))).toMatch(
      /<select[^>]*data-testid="x"/,
    );
    expect(html(createElement(Checkbox, { label: "L", checked: false, onChange: noop, ...testId }))).toMatch(/<input[^>]*data-testid="x"/);
  });
});

describe("FormSummary", () => {
  it("links each line to its field, and is dashed — not red — when nothing blocks the save", () => {
    const items = [
      { targetId: "unit", label: "Unité", kind: "missing" as const },
      { targetId: "source", label: "Source", kind: "missing" as const },
    ];
    const out = html(createElement(FormSummary, { title: "2 choses avant d'enregistrer", items }));
    expect(out).toContain('href="#unit"');
    expect(out).toContain('href="#source"');
    expect(out).toContain(summaryStyles.missingOnly);
    const blocking = html(createElement(FormSummary, { title: "3 things", items: [...items, { targetId: "n", label: "Signed up", kind: "invalid" as const }] }));
    expect(blocking).not.toContain(summaryStyles.missingOnly);
    expect(attr(blocking, "div", "tabindex") ?? attr(blocking, "div", "tabIndex")).toBe("-1");
  });
});

describe("TextArea inside a Field (extension 04 delta)", () => {
  it("takes its name from the Field's label, and reads the Field's message before its own count", () => {
    const out = html(
      createElement(Field, {
        label: "Your definition",
        id: "def",
        error: "Too long.",
        children: (p: { id: string; describedBy: string | undefined; invalid: boolean }) =>
          createElement(TextArea, { id: p.id, "aria-describedby": p.describedBy, invalid: p.invalid, value: "x", onChange: noop, maxLength: 200 }),
      }),
    );
    expect(out).not.toMatch(/<textarea[^>]*aria-label=/);
    expect(attr(out, "textarea", "aria-describedby")).toMatch(/^def-message \S+-count$/);
    expect(attr(out, "textarea", "aria-invalid")).toBe("true");
  });

  it("keeps its own accessible name when it stands alone under a QuestionCard", () => {
    const out = html(createElement(TextArea, { label: "Any specific context?", value: "", onChange: noop, maxLength: 500 }));
    expect(attr(out, "textarea", "aria-label")).toBe("Any specific context?");
  });
});

describe("Segmented labelled by its Field (extension 04, Q15)", () => {
  it("is named by the visible label, with no aria-label of its own", () => {
    const options = [
      { id: "7", label: "7 days" },
      { id: "14", label: "14 days" },
    ] as const;
    const out = html(createElement(Segmented<"7" | "14">, { options, value: "7", labelledBy: "w-label", onChange: noop }));
    expect(out).toMatch(/^<div role="group" aria-labelledby="w-label"/);
    expect(out).not.toMatch(/^<div[^>]*aria-label=/);
    const header = html(createElement(Segmented<"7" | "14">, { options, value: "7", label: "Window", onChange: noop }));
    expect(header).toMatch(/^<div role="group" aria-label="Window"/);
  });
});
