import { WordmarkLink } from "tour-de-growth";

/*
 * The wordmark as the way home, which is what every header uses. Home is a
 * localized address (`/en`, `/fr`) since the language moved into the URL, so
 * this needs the current locale — that is the whole reason it exists rather
 * than callers wrapping Wordmark in their own link.
 */

/** Header scale, English. */
export const English = () => <WordmarkLink locale="en" size="md" />;

/** The same mark pointing at the French home. */
export const French = () => <WordmarkLink locale="fr" size="md" />;

/** `sm` is the mobile header scale. */
export const Mobile = () => <WordmarkLink locale="en" size="sm" />;
