// TypeScript module declaration so `import x from "./file.html"` is typed as a string (esbuild text loader).
declare module "*.html" {
  const html: string;
  export default html;
}
