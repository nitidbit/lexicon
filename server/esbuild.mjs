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
  console.log('esbuild.mjs: entryPoints = ', results)
  return results
}


const notifyWhenBuilding = {
  name: 'notifyWhenBuilding',
  setup(build) {
    // build.onStart(() => {
    //   console.log('esbuild.mjs: build started')
    // })

    build.onEnd(result => {
      console.log(`esbuild.mjs: build done with ${result.errors.length} errors`)
    })
  },
}


esbuild
  .build({
    entryPoints: await entryPoints(),
    bundle: true,
    watch: watchMode,
    outdir: "app/assets/builds",
    sourcemap: true,
    plugins: [sassPlugin(), notifyWhenBuilding ],
  })
  .catch((e) => console.error(e.message));
