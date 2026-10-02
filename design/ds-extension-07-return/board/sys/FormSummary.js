// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React, { forwardRef } from "react";
const FormSummary = forwardRef(({ title, lead, items }, ref) => {
  const missingOnly = items.every((i) => i.kind === "missing");
  const focusField = (targetId) => (e) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    e.preventDefault();
    el.focus();
    el.scrollIntoView({ block: "center" });
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      tabIndex: -1,
      className: `FormSummary_root ${missingOnly ? "FormSummary_missingOnly" : ""}`
    },
    /* @__PURE__ */ React.createElement("p", { className: "FormSummary_title" }, title),
    lead ? /* @__PURE__ */ React.createElement("p", { className: "FormSummary_lead" }, lead) : null,
    /* @__PURE__ */ React.createElement("ul", { className: "FormSummary_list" }, items.map((item) => /* @__PURE__ */ React.createElement("li", { key: item.targetId, className: "FormSummary_item" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("a", { className: "FormSummary_link", href: `#${item.targetId}`, onClick: focusField(item.targetId) }, item.label), item.message ? /* @__PURE__ */ React.createElement("span", { className: "FormSummary_kind" }, " \u2014 ", item.message) : null))))
  );
});
export {
  FormSummary
};
