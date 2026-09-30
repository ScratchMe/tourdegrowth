import * as React from 'react';
import { SelectOption } from '../Select/Select';

interface DateFieldBase {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  missing?: React.ReactNode;
  optional?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
}

/** A month from a list the caller builds (the engine's last eighteen). Value "YYYY-MM", "" if not chosen. */
export interface MonthFieldProps extends DateFieldBase {
  precision: 'month';
  value: string;
  onChange: (value: string) => void;
  /** Labels already written in the page's language: "August 2026" / « août 2026 ». */
  months: SelectOption[];
  placeholder?: string;
  fit?: 'fill' | 'content';
}

export interface DayValue { day: string; month: string; year: string }

/** A day, as three native selects under one legend. Each part "" until chosen. */
export interface DayFieldProps extends DateFieldBase {
  precision: 'day';
  value: DayValue;
  onChange: (value: DayValue) => void;
  /** Twelve month names in the page's language. */
  monthNames: string[];
  years: number[];
  /** Visible labels for the parts: { day: "Jour", month: "Mois", year: "Année" }. */
  partLabels: { day: string; month: string; year: string };
  /** The empty option of each part. Default "–". */
  partPlaceholder?: string;
}

/**
 * DateField — design system extension 04.
 * @replaces input[type=date], input[type=month]
 */
export type DateFieldProps = MonthFieldProps | DayFieldProps;
export declare const DateField: React.ComponentType<DateFieldProps>;
