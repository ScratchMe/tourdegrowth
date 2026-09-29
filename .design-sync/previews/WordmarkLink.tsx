import { WordmarkLink } from "tour-de-growth";

/*
 * The wordmark as the way home, which is what every header uses. Home is a
 * localized address (`/en`, `/fr`) since the language moved into the URL, so
 * this needs the current locale — that is the whole reason it exists rather
 * than callers wrapping Wordmark in their own link. The French one points at
 * `/fr` and looks exactly the same, so it has no cell of its own.
 */

/** Header scale (`md`, the default), pointing at the English home. No link underline, no link colour: the mark stays the mark. */
export const English = () => <WordmarkLink locale="en" size="md" />;

/**
 * `sm`, pinned. No header passes it: the header's `md` drops to this size
 * under 760px by itself (an @media rule this card cannot show). The owner's
 * preview page is the one caller that fixes it small.
 */
export const Small = () => <WordmarkLink locale="en" size="sm" />;
