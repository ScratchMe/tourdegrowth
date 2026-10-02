// The preview's renderer: turns the frame's `h()` tree into DOM, the way
// Satori reads it — every div is a flex box (the frame says so itself), numbers
// are px, SVG children live in the SVG namespace. Preview only, never ported.
const SVG_NS = "http://www.w3.org/2000/svg";
const UNITLESS = new Set(["fontWeight", "lineHeight", "opacity", "flexGrow", "flexShrink", "zIndex"]);

export const h = (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() });

export const toDom = (node, inSvg = false) => {
  if (node == null || node === false) return document.createTextNode("");
  if (typeof node === "string" || typeof node === "number") return document.createTextNode(String(node));
  const svg = inSvg || node.type === "svg";
  const el = svg ? document.createElementNS(SVG_NS, node.type) : document.createElement(node.type);
  for (const [name, value] of Object.entries(node.props)) {
    if (name === "style") {
      for (const [k, v] of Object.entries(value)) el.style[k] = typeof v === "number" && !UNITLESS.has(k) ? `${v}px` : v;
    } else if (value != null) {
      el.setAttribute(name, String(value));
    }
  }
  for (const child of node.children) el.append(toDom(child, svg));
  return el;
};
