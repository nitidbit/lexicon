/*
  Configuraion for ESBuild

  usage:
    npm run build
 */

import { readdir } from 'node:fs/promises'
import esbuild from "esbuild"
import sassPlugin from "esbuild-plugin-sass"
import { livereloadPlugin } from '@jgoz/esbuild-plugin-livereload'

const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const RESET = "\x1b[39m"

// Which JS/TS/SCSS files should be entry-points?
async function entryPoints() {
  const JS_DIR = 'app/javascript/'
  const dirCont = await readdir(JS_DIR);
  const results = dirCont
    .filter( filename => filename.match(/\.(js|jsx|ts|tsx)$/ig))
    .map( filename => JS_DIR + filename )
  console.log('esbuild.mjs: entryPoints = ', results)
  return results
}


const notifyWhenBuilding = {
  name: 'notifyWhenBuilding',
  setup(build) {
    build.onEnd(result => {
      const numErrors = result.errors.length
      const color = numErrors ? RED : GREEN
      console.log(`${ color }esbuild.mjs: build done with ${result.errors.length} errors`,  RESET)
    })
  },
}



let esBuildConfig = await esbuild.context({
  entryPoints: await entryPoints(),
  bundle: true,
  outdir: "app/assets/builds",
  sourcemap: 'linked',
  plugins: [
    sassPlugin(),
    notifyWhenBuilding,
    livereloadPlugin({fullReloadOnCssUpdates: true}),
  ],
})

console.log('watching...')
await esBuildConfig.watch()
