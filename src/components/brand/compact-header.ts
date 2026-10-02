/**
 * The compact header's behaviour — design system extension 08 (the return's
 * `compactHeader.js`, ported). BROWSER ONLY: it reads `window`, `document`
 * and layout, and is imported by `SiteHeaderCompactor` alone, a client
 * component that calls it after mount. Free of React.
 *
 * It only ever sets attributes and custom properties: every look and every
 * motion lives in `SiteHeader.module.css`, under `(orientation: landscape)`,
 * so a phone held upright never sees a compact header whatever this sets.
 *
 *  - Trigger (Q2 of the return): position, not direction. Compact as soon as
 *    the window has scrolled at all — the moment the plain header's rule
 *    appears — full again at the very top. The header's box never changes
 *    height (mechanic 1), so the scroll position cannot feed back into the
 *    state: no threshold flicker, no hysteresis.
 *  - Keyboard (mechanic 6): focus that lands in the header with
 *    `:focus-visible` keeps it full until focus leaves it. A click does not.
 *  - Measures (mechanic 5): the compact line's scale and shifts are derived
 *    from the row's real height (72, 68 or the quiz's 47px), and `<html>`
 *    gets the header's two painted heights, which globals.css hands to
 *    `--sticky-offset`: `--sticky-offset-full` (the header's box, 118px on a
 *    laptop, 114 on a phone, 93 in the quiz on a laptop and 88 to 106 on a
 *    phone, 74 or 70 without a band) and `--sticky-offset-compact` (54px
 *    with a band, 50px without).
 *  - Close-up: a control that stays in the line slides right, by a
 *    transform, over the room left by the controls that leave after it.
 *
 * Returns a cleanup function.
 */

const px = (value: string, fallback: number): number => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const LEAVE = '[data-header-compact="leave"]';

export function attachCompactHeader(header: HTMLElement): () => void {
  const root = document.documentElement;
  const row = header.querySelector<HTMLElement>("[data-header-row]");
  if (!row) return () => {};
  const hasBand = header.dataset.siteHeader === "band";
  let scrolled = false;
  let keyboardInside = false;
  let frame = 0;

  // What stays in the line closes up on the right, over the room left by what
  // leaves after it: each kept control gets the width (and gap) of the
  // leaving ones that follow it, as a transform — the layout never changes.
  // The groups are the parents of what may leave (the landing's nav).
  const closeUp = () => {
    const groups = new Set<HTMLElement>();
    header.querySelectorAll<HTMLElement>(LEAVE).forEach((item) => item.parentElement && groups.add(item.parentElement));
    for (const group of groups) {
      const gap = px(getComputedStyle(group).columnGap, 0);
      let room = 0;
      for (const item of [...group.children].reverse() as HTMLElement[]) {
        if (item.offsetWidth === 0 && item.offsetHeight === 0) continue;
        if (item.matches(LEAVE)) {
          room += item.offsetWidth + gap;
        } else if (room > 0) {
          item.style.setProperty("--header-close-up", `${room}px`);
          item.dataset.headerCloseUp = "";
        } else {
          item.style.removeProperty("--header-close-up");
          delete item.dataset.headerCloseUp;
        }
      }
    }
  };

  const measure = () => {
    const style = getComputedStyle(header);
    const line = px(style.getPropertyValue("--header-line"), 48);
    const edge = px(style.getPropertyValue(hasBand ? "--header-edge-band" : "--header-edge-plain"), hasBand ? 6 : 2);
    const rowHeight = row.offsetHeight;
    if (rowHeight === 0) return;
    // The edge sits in the header's padding box: a plain header's own 2px
    // bottom border (today's rule) is not part of it.
    const full = header.clientHeight;
    header.style.setProperty("--header-glass-scale", String(line / rowHeight));
    header.style.setProperty("--header-row-shift", `${(line - rowHeight) / 2}px`);
    header.style.setProperty("--header-edge-shift", `${line + edge - full}px`);
    root.style.setProperty("--sticky-offset-compact", `${line + edge}px`);
    // The box, border included (a plain header's rule): it never changes
    // with the state, only with the width. Rounded up, so a fractional
    // height never leaves the offset a hair under the header.
    root.style.setProperty("--sticky-offset-full", `${Math.ceil(header.getBoundingClientRect().height)}px`);
    closeUp();
  };

  const apply = () => {
    frame = 0;
    const compact = String(scrolled && !keyboardInside);
    if (header.dataset.compact !== compact) header.dataset.compact = compact;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(apply);
  };

  const onScroll = () => {
    const next = window.scrollY > 0;
    if (next === scrolled) return;
    scrolled = next;
    schedule();
  };
  const onFocusIn = (event: FocusEvent) => {
    if (!(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
    keyboardInside = true;
    apply();
  };
  const onFocusOut = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && header.contains(event.relatedTarget)) return;
    keyboardInside = false;
    apply();
  };

  measure();
  scrolled = window.scrollY > 0;
  apply();
  // Transitions switch on only after the first state is painted: a page
  // reloaded halfway down opens compact, without a motion.
  let ready = requestAnimationFrame(() => {
    ready = requestAnimationFrame(() => {
      header.dataset.compactReady = "true";
    });
  });

  const resize = new ResizeObserver(measure);
  resize.observe(header);
  resize.observe(row);
  window.addEventListener("scroll", onScroll, { passive: true });
  header.addEventListener("focusin", onFocusIn);
  header.addEventListener("focusout", onFocusOut);

  return () => {
    resize.disconnect();
    header.querySelectorAll<HTMLElement>("[data-header-close-up]").forEach((item) => {
      item.style.removeProperty("--header-close-up");
      delete item.dataset.headerCloseUp;
    });
    window.removeEventListener("scroll", onScroll);
    header.removeEventListener("focusin", onFocusIn);
    header.removeEventListener("focusout", onFocusOut);
    cancelAnimationFrame(frame);
    cancelAnimationFrame(ready);
    header.dataset.compact = "false";
    delete header.dataset.compactReady;
    root.style.removeProperty("--sticky-offset-compact");
    root.style.removeProperty("--sticky-offset-full");
  };
}
