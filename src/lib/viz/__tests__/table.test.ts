import { describe, expect, it } from "vitest";
import { cellSortKey, cellText, nextSort, sortRows, type TableRow } from "../table";

const rows: TableRow[] = [
  { id: "jan", cells: { month: "Janv.", churn: { text: "6,0 %", sort: 6 } } },
  { id: "feb", cells: { month: "Févr.", churn: { text: "—", sort: null } } },
  { id: "mar", cells: { month: "Mars", churn: { text: "12,4 %", sort: 12.4 } } },
  { id: "apr", cells: { month: "Avr.", churn: { text: "5,7 %", sort: 5.7 } } },
  { id: "may", cells: { month: "Mai", churn: { text: "6,0 %", sort: 6 } } },
];

const ids = (list: TableRow[]) => list.map((r) => r.id);

describe("cellText / cellSortKey", () => {
  it("accepts a bare string or a cell with its own sort key", () => {
    expect(cellText("abc")).toBe("abc");
    expect(cellText({ text: "12 400", sort: 12400 })).toBe("12 400");
    expect(cellText(undefined)).toBe("");
    expect(cellSortKey("abc")).toBe("abc");
    expect(cellSortKey({ text: "x" })).toBe("x");
    expect(cellSortKey({ text: "—", sort: null })).toBeNull();
    expect(cellSortKey(undefined)).toBeNull();
  });
});

describe("sortRows", () => {
  it("sorts by the raw key, not the displayed text", () => {
    // As text, "12,4 %" < "5,7 %". As numbers, it is the largest.
    expect(ids(sortRows(rows, "churn", "descending"))).toEqual(["mar", "jan", "may", "apr", "feb"]);
  });

  it("is stable: equal keys keep the caller's order in both directions", () => {
    expect(ids(sortRows(rows, "churn", "ascending"))).toEqual(["apr", "jan", "may", "mar", "feb"]);
  });

  it("keeps rows without a value at the end whichever way the sort goes", () => {
    expect(sortRows(rows, "churn", "ascending").at(-1)?.id).toBe("feb");
    expect(sortRows(rows, "churn", "descending").at(-1)?.id).toBe("feb");
  });

  it("compares strings with numeric awareness", () => {
    const r: TableRow[] = [
      { id: "a", cells: { k: "T10" } },
      { id: "b", cells: { k: "T2" } },
    ];
    expect(ids(sortRows(r, "k", "ascending"))).toEqual(["b", "a"]);
  });

  it("does not mutate its input", () => {
    const before = ids(rows);
    sortRows(rows, "churn", "descending");
    expect(ids(rows)).toEqual(before);
  });
});

describe("nextSort", () => {
  it("goes ascending on a new column, then flips on each click of the same one", () => {
    const a = nextSort(null, "churn");
    expect(a).toEqual({ key: "churn", direction: "ascending" });
    const b = nextSort(a, "churn");
    expect(b.direction).toBe("descending");
    expect(nextSort(b, "churn").direction).toBe("ascending");
    expect(nextSort(b, "month")).toEqual({ key: "month", direction: "ascending" });
  });
});
