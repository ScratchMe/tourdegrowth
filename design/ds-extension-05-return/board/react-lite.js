// react-lite.js — the board's stand-in for React. Board only, never ported.
//
// The board runs the components' own source files, as they are, with no build
// step and nothing fetched from outside this project. The components import
// `React` from "react"; board.html's import map points "react" here. This
// covers exactly what they use — createElement, Fragment, useId — and renders
// once into a container. It is not React: no state, no reconciliation; the
// board simply renders again when something changes.

const Fragment = Symbol("Fragment");

const createElement = (type, props, ...children) => ({
  type,
  props: { ...(props ?? {}), children: children.length === 1 ? children[0] : children },
});

let idCounter = 0;
const useId = () => `:r${(idCounter++).toString(36)}:`;

const BOOLEAN_ATTRS = new Set(["disabled", "hidden", "checked", "open", "inert", "readonly"]);

const setProp = (el, name, value) => {
  if (name === "children" || name === "key" || name === "ref" || value == null || value === false) return;
  if (name === "className") return el.setAttribute("class", value);
  if (name === "htmlFor") return el.setAttribute("for", value);
  if (name === "style") {
    for (const [key, v] of Object.entries(value)) {
      if (v == null) continue;
      if (key.startsWith("--")) el.style.setProperty(key, String(v));
      else el.style[key] = typeof v === "number" ? `${v}px` : v;
    }
    return;
  }
  if (/^on[A-Z]/.test(name) && typeof value === "function") {
    el.addEventListener(name.slice(2).toLowerCase(), value);
    return;
  }
  if (BOOLEAN_ATTRS.has(name)) {
    if (value) el.setAttribute(name, "");
    return;
  }
  el.setAttribute(name, value === true ? "" : String(value));
};

const SVG_NS = "http://www.w3.org/2000/svg";

const toNodes = (vnode, inSvg = false) => {
  if (vnode == null || vnode === false || vnode === true) return [];
  if (Array.isArray(vnode)) return vnode.flatMap((child) => toNodes(child, inSvg));
  if (typeof vnode === "string" || typeof vnode === "number") return [document.createTextNode(String(vnode))];
  const { type, props } = vnode;
  if (type === Fragment) return toNodes(props.children, inSvg);
  if (typeof type === "function") return toNodes(type(props), inSvg);
  const svg = inSvg || type === "svg";
  const el = svg ? document.createElementNS(SVG_NS, type) : document.createElement(type);
  for (const [name, value] of Object.entries(props)) setProp(el, name, value);
  for (const child of toNodes(props.children, svg)) el.append(child);
  return [el];
};

export const render = (vnode, container) => {
  idCounter = 0;
  container.replaceChildren(...toNodes(vnode));
};

const React = { createElement, Fragment, useId };
export { createElement, Fragment, useId };
export default React;
