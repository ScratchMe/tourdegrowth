import { describe, expect, it } from "vitest";
import { ENGINE_INDEX_KEY, LEGACY_STORAGE_KEY_V1 } from "../types";
import { ENGINE_KNOWN_KEYS, engineKnownScript } from "../known-script";

/** Runs the script against a stand-in `window` and `document`; returns the attribute it set, if any. */
function run(storage: Record<string, string> | "throws"): string | null {
  const attributes: Record<string, string> = {};
  const localStorage =
    storage === "throws"
      ? new Proxy({}, { get: () => { throw new Error("SecurityError"); } })
      : { getItem: (key: string) => (key in storage ? storage[key]! : null) };
  const window = storage === "throws" ? Object.defineProperty({}, "localStorage", { get: () => { throw new Error("SecurityError"); } }) : { localStorage };
  const document = { documentElement: { setAttribute: (name: string, value: string) => { attributes[name] = value; } } };
  new Function("window", "document", engineKnownScript())(window, document);
  return attributes["data-engine"] ?? null;
}

describe("engineKnownScript — the returning reader, known before the first paint (A18 T4)", () => {
  it("marks <html> when the engines' index exists, or a key from before it", () => {
    expect(run({ [ENGINE_INDEX_KEY]: "{}" })).toBe("known");
    expect(run({ [LEGACY_STORAGE_KEY_V1]: "{}" })).toBe("known");
    // An empty value is still a key that exists.
    expect(run({ [ENGINE_INDEX_KEY]: "" })).toBe("known");
  });

  it("does nothing on a device without an engine, nor when the storage throws (a private window)", () => {
    expect(run({})).toBeNull();
    expect(run({ "tdg.quiz.v1": "{}" })).toBeNull();
    expect(run("throws")).toBeNull();
  });

  it("is exactly this script: any change to it is a change to this test, seen in review", () => {
    expect(engineKnownScript()).toBe(
      '(function(){try{var s=window.localStorage,k=["tdg.engines.v3","tdg.engine.v2","tdg.engine.v1"];for(var i=0;i<k.length;i++){if(s.getItem(k[i])!==null){document.documentElement.setAttribute("data-engine","known");return}}}catch(e){}})();',
    );
    // Nothing in it can close its <script> element.
    expect(engineKnownScript()).not.toMatch(/<\/|<!--/);
  });

  it("asks only whether a key exists: it parses nothing, sends nothing, writes nothing", () => {
    const script = engineKnownScript();
    for (const forbidden of ["JSON.parse", "fetch", "XMLHttpRequest", "sendBeacon", "setItem", "location", "cookie", "import("]) {
      expect(script).not.toContain(forbidden);
    }
    // The keys are written in as constants: nothing of a request reaches the script.
    for (const key of ENGINE_KNOWN_KEYS) expect(script).toContain(JSON.stringify(key));
  });
});
