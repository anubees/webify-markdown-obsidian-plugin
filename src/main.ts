// Bundle entry for Obsidian: compiled to main.js; only re-exports the Plugin class (implementation lives elsewhere).
//
// Obsidian loads the bundled `main.js` from the `.obsidian/plugins/<id>/` folder at vault startup.
// The build (`esbuild.config.mjs`) sets `entryPoints: ["src/main.ts"]` and `outfile: "main.js"`, so every
// compile produces one CommonJS bundle from this file.

// This entry stays intentionally minimal: it only re-exports the plugin class Obsidian instantiates.
// All behavior lives in `./plugin/local-web-server-plugin` so the bundle graph stays clear and you do not
// duplicate `export default` logic here.

export { default } from "./plugin/local-web-server-plugin";
