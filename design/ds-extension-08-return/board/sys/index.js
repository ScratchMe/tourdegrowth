// "tour-de-growth" on the board: stand-ins for the synced components the
// header's pages use, with the props of their .d.ts and the class names of
// _ds_bundle.css. board.html's import map points the bare name here. Not
// ported: the app has the real ones.
import React from "react";
import { cx } from "./_cx.js";
import { localePath } from "./space.js";

const h = React.createElement;

export const Wordmark = ({ size = "md", as = "div", className, ...rest }) =>
  h(as, { className: cx("Wordmark_wordmark", `Wordmark_${size}`, className), ...rest },
    "TOUR DE ", h("span", { className: "Wordmark_accent" }, "GROWTH"));

export const WordmarkLink = ({ locale, ...props }) =>
  h("a", { href: localePath(locale), "aria-label": "Tour de Growth", className: "hit_strip WordmarkLink_link", ...props },
    h(Wordmark, { as: "span" }));

export const Segmented = ({ options, value, label, size = "md", as }) =>
  h("div", { role: "group", "aria-label": label, className: cx("Segmented_group", size === "sm" ? "Segmented_sm" : "Segmented_md") },
    h("div", { className: "Segmented_track" },
      options.map((o) => {
        const on = o.id === value;
        const cls = cx("Segmented_option", on && "Segmented_on");
        return as === "a"
          ? h("a", { key: o.id, href: o.href, hrefLang: o.lang, lang: o.lang, "aria-current": on ? "true" : undefined, className: cls }, o.label)
          : h("button", { key: o.id, type: "button", "aria-pressed": on ? "true" : "false", className: cls }, o.label);
      })));

export const LocaleSwitcher = ({ locale, path }) =>
  h(Segmented, {
    as: "a",
    size: "sm",
    label: locale === "fr" ? "Langue" : "Language",
    value: locale,
    options: ["en", "fr"].map((l) => ({ id: l, label: l.toUpperCase(), lang: l, href: path === undefined ? `?lang=${l}` : localePath(l, path) })),
  });

export const Button = ({ variant = "primary", size = "md", fullWidth, className, children, href, ...rest }) => {
  const cls = cx("Button_button", `Button_${size}`, `Button_${variant}`, fullWidth && "Button_fullWidth", className);
  return href ? h("a", { className: cls, href, ...rest }, children) : h("button", { type: "button", className: cls, ...rest }, children);
};

export const ModeTag = ({ mode = "quick", className, children, ...rest }) =>
  h("span", { className: cx("ModeTag_tag", mode === "deep" ? "ModeTag_deep" : "ModeTag_quick", className), ...rest },
    children || (mode === "deep" ? "Deep dive" : "Quick"));

export const Tag = ({ tone = "neutral", children, className, ...rest }) =>
  h("span", { className: cx("Tag_tag", `Tag_${tone}`, className), ...rest }, children);

export const MetaLabel = ({ size = "sm", tone = "muted", uppercase = true, wide, as = "div", children, className, ...rest }) =>
  h(as, { className: cx("MetaLabel_label", `MetaLabel_${size}`, `MetaLabel_${tone}`, uppercase && "MetaLabel_uppercase", wide && "MetaLabel_wide", className), ...rest }, children);
