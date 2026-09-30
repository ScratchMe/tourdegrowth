import * as React from 'react';

export interface FormSummaryItem {
  /** The field's control id: the link moves focus there. */
  targetId: string;
  /** The field's label, as shown. */
  label: React.ReactNode;
  /** The field's own message, repeated after a dash. Optional for a missing field. */
  message?: React.ReactNode;
  /** invalid blocks the save; missing does not. */
  kind: 'invalid' | 'missing';
}

/**
 * FormSummary — design system extension 04. What stands between the person
 * and the save, above the save button. Focus it when a save is refused.
 */
export interface FormSummaryProps {
  /** "3 things before this saves" / « 3 choses avant d'enregistrer ». */
  title: React.ReactNode;
  /** One sentence saying what happens if they save anyway. */
  lead?: React.ReactNode;
  items: FormSummaryItem[];
}

export declare const FormSummary: React.ForwardRefExoticComponent<FormSummaryProps & React.RefAttributes<HTMLDivElement>>;
