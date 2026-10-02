// react-lite.js — the board's stand-in for React. Board only, never ported.
//
// The board runs the components' own source files, as they are, with no build
// step and nothing fetched from outside this project. The components import
// `React` from "react"; board.html's import map points "react" here. This
// covers exactly what they use — createElement, Fragment, useId, and inert
// useState/useRef/effects/forwardRef for the form primitives — and renders
// once into a container. It is not React: no state, no reconciliation; the
// board simply renders again when something changes.

const Fragment = Symbol("Fragment");

const createElement = (type, props, ...children) => ({
  type,
  props: { ...(props ?? {}), children: children.length === 1 ? children[0] : children },
});

let idCounter = 0;
const useId = () => `:r${(idCounter++).toString(36)}:`;

// The board draws fixed states: hooks hold their first value, effects do not
// run, refs stay empty. Enough for the components' own files to execute.
const useState = (initial) => [typeof initial === "function" ? initial() : initial, () => {}];
const useRef = (initial = null) => ({ current: initial });
const useEffect = () => {};
const useLayoutEffect = () => {};
const useMemo = (fn) => fn();
const useCallback = (fn) => fn;
const forwardRef = (render) => (props) => render(props, null);
const Children = {
  toArray: (children) => [children].flat(Infinity).filter((c) => c != null && c !== false && c !== true),
};

const BOOLEAN_ATTRS = new Set(["disabled", "hidden", "checked", "open", "inert", "readonly", "readOnly", "required", "multiple", "selected"]);

const setProp = (el, name, value) => {
  if (name === "children" || name === "key" || name === "ref" || name === "defaultValue" || value == null || value === false) return;
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
  // A form control's value is a property, not only an attribute: a <select>
  // picks its option and a <textarea> shows its text only this way.
  const formValue = props.value ?? props.defaultValue;
  if (formValue != null && (type === "select" || type === "textarea" || type === "input")) el.value = String(formValue);
  return [el];
};

export const render = (vnode, container) => {
  idCounter = 0;
  container.replaceChildren(...toNodes(vnode));
};

const React = { createElement, Fragment, Children, useId, useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, forwardRef };
export { createElement, Fragment, Children, useId, useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, forwardRef };
export default React;
