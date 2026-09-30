"use client";

import { Children, useId, type ReactElement, type ReactNode } from "react";
import { fieldRow } from "./field-parts";

export interface FieldRowProps {
  /** The word between the two, localized: "out of" / « sur », "to" / « à ». */
  joiner?: string;
  /** A message about the pair (« The minimum is above the maximum. »), under the whole row. */
  error?: ReactNode;
  /** Exactly two fields: NumberField, TextField or Select. */
  children: [ReactElement, ReactElement];
}

/**
 * Two fields that are one statement — « 26 000 out of 120 000 », « from 20 to
 * 40 % », the growth engine's commonest shape — design system extension 04.
 *
 * From a 480px container the two sit side by side, joined by their word,
 * their boxes on one line however their labels wrap; below it they stack,
 * the joiner between them, so a French label or a long message never
 * squeezes into half a phone. Each field keeps its own message; a message
 * about the pair belongs to the row. Never more than two fields, and never a
 * row of your own for two fields.
 */
export function FieldRow({ joiner, error, children }: FieldRowProps) {
  const id = `row-${useId().replace(/:/g, "")}`;
  const [first, second] = Children.toArray(children);
  return (
    <div className={fieldRow.row} role="group" aria-describedby={error ? `${id}-message` : undefined}>
      <div className={fieldRow.grid}>
        {first}
        {joiner ? <span className={fieldRow.joiner}>{joiner}</span> : null}
        {second}
      </div>
      {error ? (
        <p id={`${id}-message`} className={fieldRow.message}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
