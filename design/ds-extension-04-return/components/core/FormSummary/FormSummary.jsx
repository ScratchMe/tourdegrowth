import React, { forwardRef } from "react";

/**
 * FormSummary — what stands between the person and saving, set just above
 * the save button: a title, and one line per field, each a link that moves
 * focus into that field. Invalid lines block the save; missing lines do not
 * ("the line saves anyway — the export will flag it"). With only missing
 * lines the frame is dashed, the system's "not yet".
 *
 * Focus it (it takes a ref) when a save is refused, so the reason is read.
 */
export const FormSummary = forwardRef(({ title, lead, items }, ref) => {
  const missingOnly = items.every((i) => i.kind === "missing");
  const focusField = (targetId) => (e) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    e.preventDefault();
    el.focus();
    el.scrollIntoView({ block: "center" });
  };
  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={`FormSummary_root ${missingOnly ? "FormSummary_missingOnly" : ""}`}
    >
      <p className="FormSummary_title">{title}</p>
      {lead ? <p className="FormSummary_lead">{lead}</p> : null}
      <ul className="FormSummary_list">
        {items.map((item) => (
          <li key={item.targetId} className="FormSummary_item">
            <span>
              <a className="FormSummary_link" href={`#${item.targetId}`} onClick={focusField(item.targetId)}>
                {item.label}
              </a>
              {item.message ? <span className="FormSummary_kind"> — {item.message}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
