/*
  Configuraion for ESBuild

  usage:
    npm build
    npm build -- --watch
 */

const esbuild = require("esbuild");
const sassPlugin = require("esbuild-plugin-sass");
const watchMode = process.argv.includes('--watch')

esbuild
  .build({
    entryPoints: [
      "app/javascript/application.js",
      "app/javascript/demo.jsx",
    ],
    bundle: true,
    watch: watchMode,
    outdir: "app/assets/builds",
    // publicpath: 'assets',
    // sourcemap: true,
    plugins: [sassPlugin()],
    // esbuild app/javascript[>.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets",

  })
  .catch((e) => console.error(e.message));
