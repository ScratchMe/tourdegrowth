// compactHeader — design system extension 08. The compact header's behaviour,
// free of React: SiteHeaderCompactor calls it in the app; the board calls it
// directly. It only ever sets attributes and custom properties: every look
// and every motion is in SiteHeader.css, under `(orientation: landscape)`.

const px = (value, fallback) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Compacts `header` (a SiteHeader) once the page has scrolled, and gives it
 * back in full at the top or while keyboard focus is inside it.
 *
 *  - Trigger: position (Q2). Compact as soon as the window has scrolled at
 *    all — the moment the plain header's rule appears — full again at the
 *    very top. The header's box never changes height (mechanic 1), so the
 *    scroll position cannot feed back into the state: no threshold flicker,
 *    no hysteresis needed.
 *  - Keyboard (mechanic 6): focus that lands in the header with
 *    `:focus-visible` keeps the header full until focus leaves it. A mouse
 *    click does not.
 *  - Measures (mechanic 5): the compact line's scale and shifts are derived
 *    from the row's real height (72, 68 or the quiz's 47px), and the page
 *    gets `--sticky-offset-compact` (54px with a band, 50px without).
 *  - Close-up: a control that stays in the line slides right over the room
 *    left by the controls that leave after it (`--header-close-up`).
 *
 * Returns a cleanup function.
 */
export const attachCompactHeader = (header) => {
  const root = document.documentElement;
  const row = header.querySelector(".SiteHeader_row");
  const hasBand = header.dataset.siteHeader === "band";
  let scrolled = false;
  let keyboardInside = false;
  let frame = 0;

  const measure = () => {
    const style = getComputedStyle(header);
    const line = px(style.getPropertyValue("--header-line"), 48);
    const edge = px(style.getPropertyValue(hasBand ? "--header-edge-band" : "--header-edge-plain"), hasBand ? 6 : 2);
    const rowHeight = row.offsetHeight;
    // The edge is placed in the header's padding box: a plain header's own
    // 2px bottom border (today's rule) is not part of it.
    const full = header.clientHeight;
    header.style.setProperty("--header-glass-scale", String(line / rowHeight));
    header.style.setProperty("--header-row-shift", `${(line - rowHeight) / 2}px`);
    header.style.setProperty("--header-edge-shift", `${line + edge - full}px`);
    root.style.setProperty("--sticky-offset-compact", `${line + edge}px`);
    closeUp();
  };

  // What stays in the line closes up on the right, over the room left by what
  // leaves after it: each kept control gets the width (and gap) of the leaving
  // ones that follow it, as a transform — the layout itself never changes.
  const closeUp = () => {
    for (const group of header.querySelectorAll(".SiteHeader_end")) {
      const gap = px(getComputedStyle(group).columnGap, 0);
      let room = 0;
      for (const item of [...group.children].reverse()) {
        if (item.offsetWidth === 0 && item.offsetHeight === 0) continue;
        if (item.matches("[data-header-compact=leave]")) {
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
  const onFocusIn = (event) => {
    if (!event.target.matches?.(":focus-visible")) return;
    keyboardInside = true;
    apply();
  };
  const onFocusOut = (event) => {
    if (header.contains(event.relatedTarget)) return;
    keyboardInside = false;
    apply();
  };

  measure();
  scrolled = window.scrollY > 0;
  apply();
  // Transitions are switched on only after the first state is painted: a
  // page reloaded halfway down opens compact, without a motion.
  requestAnimationFrame(() => requestAnimationFrame(() => { header.dataset.compactReady = "true"; }));

  const resize = new ResizeObserver(measure);
  resize.observe(header);
  header.querySelectorAll(".SiteHeader_end").forEach((group) => resize.observe(group));
  window.addEventListener("scroll", onScroll, { passive: true });
  header.addEventListener("focusin", onFocusIn);
  header.addEventListener("focusout", onFocusOut);

  return () => {
    resize.disconnect();
    header.querySelectorAll("[data-header-close-up]").forEach((item) => {
      item.style.removeProperty("--header-close-up");
      delete item.dataset.headerCloseUp;
    });
    window.removeEventListener("scroll", onScroll);
    header.removeEventListener("focusin", onFocusIn);
    header.removeEventListener("focusout", onFocusOut);
    cancelAnimationFrame(frame);
    header.dataset.compact = "false";
    delete header.dataset.compactReady;
    root.style.removeProperty("--sticky-offset-compact");
  };
};
