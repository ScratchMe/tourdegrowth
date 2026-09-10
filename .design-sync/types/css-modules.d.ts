/* CSS Modules, for the declaration build only. The app gets these from
   `next-env.d.ts`, which is deliberately NOT in `tsconfig.dts.json`'s graph:
   it drags in Next's global JSX augmentation, and `@vercel/og` augments
   `HTMLAttributes` with a Tailwind `tw` prop — which then appears on every
   component's contract as a prop the design agent would try to use. */
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
