// src/lib/remark-headings.mjs adds this export to every MDX file.
declare module "*.mdx" {
  export const headings: { id: string; text: string }[];
}
