/*
  Configuraion for ESBuild

  usage:
    npm run build
    npm run build -- --watch
 */

import { readdir } from 'node:fs/promises'
import esbuild from "esbuild"
import sassPlugin from "esbuild-plugin-sass"

const watchMode = process.argv.includes('--watch')

// Which JS files should we build?
async function entryPoints() {
  const JS_DIR = 'app/javascript/'
  const dirCont = await readdir(JS_DIR);
  const results = dirCont
    .filter( filename => filename.match(/\.(js|jsx|css|scss)$/ig))
    .map( filename => JS_DIR + filename )
  console.log('!!! entryPoints = ', results)
  return results
}


esbuild
  .build({
    entryPoints: await entryPoints(),
    bundle: true,
    watch: watchMode,
    outdir: "app/assets/builds",
    // publicpath: 'assets',
    sourcemap: true,
    plugins: [sassPlugin()],

  })
  .catch((e) => console.error(e.message));
