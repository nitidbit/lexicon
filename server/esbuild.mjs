/*
  Configuraion for ESBuild

  usage:
    npm run build
 */

import { readdir } from 'node:fs/promises'
import esbuild from "esbuild"
import sassPlugin from "esbuild-plugin-sass"
import { livereloadPlugin } from '@jgoz/esbuild-plugin-livereload'

// Which JS/TS/SCSS files should be entry-points?
async function entryPoints() {
  const JS_DIR = 'app/javascript/'
  const dirCont = await readdir(JS_DIR);
  const results = dirCont
    .filter( filename => filename.match(/\.(js|jsx|ts|tsx|css|scss)$/ig))
    .map( filename => JS_DIR + filename )
  console.log('esbuild.mjs: entryPoints = ', results)
  return results
}


const notifyWhenBuilding = {
  name: 'notifyWhenBuilding',
  setup(build) {
    build.onEnd(result => {
      console.log(`esbuild.mjs: build done with ${result.errors.length} errors`)
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
    livereloadPlugin(),
  ],
})

console.log('watching...')
await esBuildConfig.watch()
