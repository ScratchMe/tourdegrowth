/**
 * "Copy the text and notes" — engine spec §9.4.
 *
 * The Markdown itself is `deckMarkdown(model, strings)` (lib/engine/deck.ts):
 * every slide's title, its lines and its speaker notes, assembled from the
 * same model the slides are drawn from, so the text a user pastes into their
 * own deck cannot say something the slides don't. This module only moves it
 * to the clipboard.
 *
 * Local only: `navigator.clipboard.writeText` puts the text in the user's
 * clipboard and nowhere else. Where the async clipboard is refused (an
 * insecure context, a browser that asks and is told no), a selected hidden
 * textarea and the legacy copy command are the fallback — they do the same
 * thing, older.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  // Off-screen rather than display:none — a hidden field cannot be selected.
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}
