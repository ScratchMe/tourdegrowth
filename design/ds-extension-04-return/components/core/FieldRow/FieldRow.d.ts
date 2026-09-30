import * as React from 'react';

/**
 * FieldRow — design system extension 04. Two fields that are one statement.
 */
export interface FieldRowProps {
  /** The word between them, localized: "out of" / « sur », "to" / « à ». */
  joiner?: string;
  /** A message about the pair ("The minimum is above the maximum."), under the whole row. */
  error?: React.ReactNode;
  /** Exactly two fields (NumberField, TextField, Select). */
  children: [React.ReactElement, React.ReactElement];
}

export declare const FieldRow: React.ComponentType<FieldRowProps>;
