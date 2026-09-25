/* `process.env`, for the declaration build only. `SiteFooter` reads one
   build-time flag through the literal `process.env.X` form Next inlines, and
   `tsconfig.dts.json` keeps `types: []` so that no global typing package can
   leak props or augmentations into the emitted contracts (see
   css-modules.d.ts). Declaring the one shape the components use is narrower
   than pulling in `@types/node` for it. The runtime half is
   `shims/process-env.ts`. */
declare const process: { readonly env: Readonly<Record<string, string | undefined>> };
