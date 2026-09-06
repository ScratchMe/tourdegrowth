/**
 * Same share image as the landing page. Next.js does not inherit an
 * `opengraph-image` from a parent segment (verified on the build output:
 * without this file the page has no `og:image` at all), so each localized
 * content route re-exports the one implementation rather than getting a
 * copy — `src/app/[locale]/opengraph-image.tsx` stays the single source.
 */
export { default, size, contentType, generateImageMetadata } from "../opengraph-image";
