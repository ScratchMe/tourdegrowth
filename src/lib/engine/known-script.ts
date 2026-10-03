import { ENGINE_INDEX_KEY, LEGACY_STORAGE_KEY_V1, LEGACY_STORAGE_KEY_V2 } from "./types";

/**
 * The keys whose presence says this device holds an engine: the index of
 * the engines (v3), and the single-engine keys a device kept from before it
 * (v2, v1), which the store migrates on the first read.
 */
export const ENGINE_KNOWN_KEYS: readonly string[] = [ENGINE_INDEX_KEY, LEGACY_STORAGE_KEY_V2, LEGACY_STORAGE_KEY_V1];

/**
 * The inline script the engine's page runs before its first paint (A18 T4,
 * design system extension 07, `EngineLanding`): when one of `keys` exists in
 * this browser's storage, it sets `data-engine="known"` on `<html>`, and the
 * page's CSS draws the returning reader's short version. The page is
 * prerendered, the same HTML for everyone: without this, a returning person
 * would see the first visit's introduction until the island hydrates.
 *
 * It asks only whether a key exists — no value parsed, nothing sent, nothing
 * in a URL. If the storage throws (a private window, storage blocked), it
 * does nothing: the first visit's page is then the right one, since the
 * engine cannot be read either. Its text is fixed at build time from
 * constants, never from a request — it takes no argument — and its exact
 * output is pinned by its test: a future `script-src` allows it by its hash
 * (`NEXTJS.md` §2.2).
 */
export function engineKnownScript(): string {
  // `<` escaped as in `JsonLd`: the keys are constants, but nothing they could hold may close the element.
  const keys = JSON.stringify(ENGINE_KNOWN_KEYS).replace(/</g, "\\u003c");
  return `(function(){try{var s=window.localStorage,k=${keys};for(var i=0;i<k.length;i++){if(s.getItem(k[i])!==null){document.documentElement.setAttribute("data-engine","known");return}}}catch(e){}})();`;
}
